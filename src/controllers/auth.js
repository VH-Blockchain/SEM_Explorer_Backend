import bcrypt from "bcryptjs";
import { addUser, validateUser } from "../models/userAuth.js";
import GenrateToken from "../utils/generateToken.js";
import { ApiResponse } from "../utils/api-response.js";
import { connection } from "../config/db-config.js";
import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";
import dotenv from 'dotenv'
dotenv.config()
export async function Login(req, res) {
  var { email, password } = req.body;
  try {
    var result = await validateUser(email);
    console.log("We will get error from backend:->", result);
    if (result == undefined) {
      res.status(400).json({ message: "User not found" });
    } else {
      const data = JSON.parse(result);
      let check = await bcrypt.compare(data.password, password);
      if (!check) {
        const token = await GenrateToken({ email, Date: new Date() });
        ApiResponse.successResponseWithData(
          res,
          "User logged in successfully",
          { token: token }
        );
      } else {
        ApiResponse.unauthorizedRespons(res, "Invalid credentials");
      }
    }
  } catch (error) {
    res.json({ message: "we got error in backend!" });
  }
}
export async function Signup(req, res) {
  try {
    var { FirstName, LastName, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    var encreptPassword = await bcrypt.hash(password, salt);
    try {
      const result = await addUser(FirstName, LastName, email, encreptPassword);
      if (result.code == 400) {
        ApiResponse.validationErrorWithData(res, result.message);
      } else {
        ApiResponse.successResponseWithData(res, result.message);
      }
    } catch (error) {
      console.error("Error signing up:", error);
    }
  } catch (error) {
    console.log("error while generating the hash");
  }
}

export async function setUserApiKeyData(req, res) {
  const { appname } = req.body;
  const email = req.email;
  const uuid = uuidv4();

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const userRowsQuery = `
    SELECT COUNT(*) AS rowCount FROM userapikeydata WHERE email = ?;
  `;

  const fetchSubscriptionIdQuery = `
    SELECT subscription_id FROM users WHERE email_id = ?;
  `;

  connection.query(
    userRowsQuery,
    [email],
    (countError, countResults, countFields) => {
      if (countError) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const rowCount = countResults[0].rowCount || 0;

      if (rowCount >= 3) {
        return res
          .status(400)
          .json({ error: "You can only add 3 rows of data." });
      }

      connection.query(
        fetchSubscriptionIdQuery,
        [email],
        (fetchError, fetchResults, fetchFields) => {
          if (fetchError) {
            console.error("Error fetching subscription_id:", fetchError);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          const subscriptionId = fetchResults[0].subscription_id || 1;

          const insertDataQuery = `
        INSERT INTO userapikeydata (email, appname, appapikey, planid)
        VALUES (?, ?, ?, ?);
      `;

          connection.query(
            insertDataQuery,
            [email, appname, uuid, subscriptionId],
            (insertError, insertResults, insertFields) => {
              if (insertError) {
                console.error(
                  "Error inserting data in userapikeydata:",
                  insertError
                );
                return res.status(500).json({ error: "Internal Server Error" });
              }

              console.log("Data inserted in userapikeydata successfully");
              res.status(200).json({ message: "Data inserted successfully" });
            }
          );
        }
      );
    }
  );
}

export async function getUserApiKeyData(req, res) {
  // const email = req.email
  const email = req.email;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const fetchDataQuery = `
    SELECT * FROM userapikeydata WHERE email = ?;
  `;

  connection.query(
    fetchDataQuery,
    [email],
    (fetchError, fetchResults, fetchFields) => {
      if (fetchError) {
        console.error("Error fetching userapikeydata:", fetchError);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (fetchResults.length > 0) {
        res.status(200).json({ data: fetchResults });
      } else {
        return res.status(404).json({ error: "User data not found." });
      }
    }
  );
}

export async function sendFaucetToken(req, res) {
  const clientIP = req.ip; // Access the IP address of the client
  console.log("Client IP:", clientIP);
  const { address } = req.body;
  console.log(address, req.body);
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_RCP_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const amountToSend = ethers.utils.parseEther("1");
    const transaction = await wallet.sendTransaction({
      to: address,
      value: amountToSend,
    });
    await transaction.wait();

    res.status(200).json("Transaction confirmed.");
  } catch (error) {
    res.status(500).json(error);
  }
}

// export async function updateUserApiKeyData(req, res) {
//   const { appname } = req.body;
//   const email = req.email
//   const uuid = uuidv4();
//   console.log("uuid", uuid);

//   if (!email) {
//     return res.status(400).json({ error: "Email is required." });
//   }

//   const fetchArraysQuery = `
//     SELECT appname, appapikey FROM userapikeydata WHERE email = ?;
//   `;

//   connection.query(
//     fetchArraysQuery,
//     [email],
//     (fetchError, fetchResults, fetchFields) => {
//       if (fetchError) {
//         console.error("Error fetching appname and appapikey:", fetchError);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       if (fetchResults.length > 0) {
//         const currentAppnameArray = JSON.parse(fetchResults[0].appname || "[]");
//         const currentAppapikeyArray = JSON.parse(
//           fetchResults[0].appapikey || "[]"
//         );

//         const updatedAppnameArray = currentAppnameArray.concat(appname);
//         const updatedAppapikeyArray = currentAppapikeyArray.concat(uuid);

//         const updateDataQuery = `
//         UPDATE userapikeydata
//         SET appname = ?, appapikey = ?
//         WHERE email = ?;
//       `;

//         connection.query(
//           updateDataQuery,
//           [
//             JSON.stringify(updatedAppnameArray),
//             JSON.stringify(updatedAppapikeyArray),
//             email,
//           ],
//           (updateError, updateResults, updateFields) => {
//             if (updateError) {
//               console.error(
//                 "Error updating data in userapikeydata:",
//                 updateError
//               );
//               return res.status(500).json({ error: "Internal Server Error" });
//             }

//             console.log("Data updated in userapikeydata successfully");
//             res.status(200).json({ message: "Data updated successfully" });
//           }
//         );
//       } else {
//         return res.status(404).json({ error: "Email not found." });
//       }
//     }
//   );
// }
