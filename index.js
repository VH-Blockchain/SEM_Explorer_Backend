import express from "express";
import cors from "cors";
import { internal } from "./src/routes/internal.js";
import { connection } from "./src/config/db-config.js";
import { api } from "./src/routes/public.js";
import * as UserAuth from "./src/routes/UserAuthRoutes.js";
import apiKeyRoute from "./src/routes/apiKeyRouter.js";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "redis";
import RedisClient from "ioredis";
import morgan from "morgan";
import { temp } from "./src/models/blockchain-data-insertion.js";
import dotenv from 'dotenv'

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

const apiListContent = `
List of APIs Available:
1. /internal/ Example: <a href="https://example.com/get_blocks">https://example.com/get_blocks</a>
2. /get_transaction Example: <a href="https://example.com/get_transaction">https://example.com/get_transaction</a>
3. /getdatabyaddress/:username Example: <a href="https://example.com/getdatabyaddress/0x798d4Ba9baf0064Ec19eB4F0a1a45785ae9D6DFc">https://example.com/getdatabyaddress/0x798d4Ba9baf0064Ec19eB4F0a1a45785ae9D6DFc</a>
4. /searchbytransactionhash/:hash Example: <a href="https://example.com/searchbytransactionhash/0x463b94c2315c59a23b37e83c452f1899acc68e5727a1430d6e106682b11f7191">https://example.com/searchbytransactionhash/0x463b94c2315c59a23b37e83c452f1899acc68e5727a1430d6e106682b11f7191</a>
`;

redis
  .createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  })
  .connect()
  .then((e) => {
    console.log("redis connected");
  });

const client = new RedisClient();

export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => client.call(...args),
  }),
  standardHeaders: true,
  legacyHeaders: false,
  windowMs: 30 * 1000,
  max: (req) => req.second,
  keyGenerator: (req) => `${req.keyGenerator}:${req.second}`,
  message: "Too many requests from this API key. Please try again later.",
});

export const dailyLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => client.call(...args),
  }),
  standardHeaders: true,
  legacyHeaders: false,
  windowMs: 24 * 60 * 60 * 1000,
  max: (req) => req.day,
  keyGenerator: (req) => `${req.keyGenerator}:${req.day}`,
  message:
    "Too many requests from this API key today. Please try again tomorrow.",
});

export const verifyKey = async (req, res, next) => {
  const apiKey = req.query.apikey;
  const query = `
    SELECT subscriptions.*
    FROM subscriptions
    JOIN userapikeydata ON subscriptions.id = userapikeydata.planid
    WHERE userapikeydata.appapikey = ?;
  `;
  connection.query(query, [apiKey], (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      req.keyGenerator = apiKey;
      req.second = results[0].cal_limit_per_second;
      req.day = results[0].cal_limit_per_day;
      next();
    } else {
      res.status(401).send("Unauthorized apikey");
    }
  });
};

app.use("/internal", internal);
app.use("/api", api);
app.use("/user", UserAuth.default);
app.use("/apiauth", apiKeyRoute);

app.get("*/:name", function (req, res) {
  res.send(`404  ${req.params.name} Route Not Found!`);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
