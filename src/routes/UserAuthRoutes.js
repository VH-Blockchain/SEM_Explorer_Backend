import { Router } from "express";
import * as explorer from "../controllers/auth.js";
import AuthToken from "../middleware/jwtAuthentication.js";
import * as userinfo from "../controllers/userinfo.js";
import Limiter from "../utils/checkRateLimit.js";

const route = Router();

route.post("/sign-up", explorer.Signup);
route.post("/login", explorer.Login);
route.get("/checktoken", AuthToken, (req, res) => {
  res.send("welcome to dashboard");
});
route.get("/activePlan", AuthToken, userinfo.getuserdata);
route.post("/updatePlan", AuthToken, userinfo.updateuserdata);
route.post("/setuserapikeydata",AuthToken, explorer.setUserApiKeyData);
// route.post("/update-userapikeydata", AuthToken, explorer.updateUserApiKeyData);
route.get("/get-userapikeydata",AuthToken, explorer.getUserApiKeyData);
route.post("/sendFaucetToken", Limiter, explorer.sendFaucetToken);
export default route;
