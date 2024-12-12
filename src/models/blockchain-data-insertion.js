import { connection } from "../config/db-config.js";
import express from "express";
import cron from "node-cron";
import * as ethers from "ethers";

const app = express();
// const provider = new ethers.providers.JsonRpcProvider(
//   "http://b4hit-l1-node-backend.appworkdemo.com/archive"
// );
const provider = new ethers.providers.JsonRpcProvider(
  "https://sem-live.appworkdemo.com/archive"
);
// console.log(provider, "provider");
// // Connect to the database
// connection.connect(function (error) {
//     if (error) throw error;
// });

// let block_number = 680500;

// Schedule a cron job to run functions periodically
export const temp = cron.schedule("*/6 * * * * *", async function () {
  console.log("Adding Every Block in 6 seconds");
  await insertBlockData();
  await insertTransactionData();
});

app.listen(3001, () => {
  console.log("Application listening.....");
});

let block_number = await provider.getBlockNumber();
console.log(block_number, "block_number");
async function insertBlockData() {
  try {
    const block = await provider.getBlockWithTransactions(block_number);

    block_number++;
    if (block == null) {
      return;
    }

    const formattedDate = convertUnixTimestampToDate(block?.timestamp);
    const query =
      "INSERT INTO blocks(blockhash, parentHash, number, timestamp, nonce, difficulty, gasLimit, gasUsed, miner, extraData, baseFeePerGas, totalTransactions) VALUES ('" +
      block.hash +
      "','" +
      block.parentHash +
      "','" +
      block.number +
      "','" +
      formattedDate +
      "','" +
      block.nonce +
      "','" +
      block.difficulty +
      "','" +
      block.gasLimit +
      "','" +
      block.gasUsed +
      "','" +
      block.miner +
      "','" +
      block.extraData +
      "','" +
      block.baseFeePerGas +
      "','" +
      block.transactions.length +
      "')";
    connection.query(query, function (error, result) {
      if (error) throw error;
      let query = "UPDATE transactions SET confirmations = confirmations + 1";
      connection.query(query, function (error, result) {
        if (error) throw error;
        console.log("Updated....");
      });
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
    return error;
  }
}

function convertHexValuesToNumbers(arr) {
  for (let index = 0; index < arr.length; index++) {
    if (
      typeof arr[index] === "object" &&
      arr[index] != null &&
      arr[index] != [] &&
      index != 13
    ) {
      arr[index] = parseInt(arr[index], 16);
    }
  }
  return arr;
}

async function insertTransactionData() {
  try {
    const blockWithTransactions = await provider.getBlockWithTransactions(
      block_number
    );
    console.log(blockWithTransactions, "blockWithTransactions");
    if (blockWithTransactions == null) {
      return;
    }
    const formattedDate = convertUnixTimestampToDate(
      blockWithTransactions.timestamp
    );
    for (
      let index = 0;
      index < blockWithTransactions.transactions.length;
      index++
    ) {
      const values = await convertHexValuesToNumbers(
        Object.values(blockWithTransactions.transactions[index])
      );
      const filteredValues = values.filter(
        (value) => typeof value !== "function"
      );

      const gasPrice = blockWithTransactions.transactions[index].gasPrice.toString();
      console.log(filteredValues, "filteredValues", formattedDate, "timestamp");
      const data = blockWithTransactions.transactions[index].hasOwnProperty(
        "maxPriorityFeePerGas"
      )
        ? filteredValues[11]
        : filteredValues[10];
      let query =
        "INSERT INTO transactions (transaction_hash, type, accessList, blockHash, blockNumber, transactionIndex, confirmations, `from`, gasPrice, maxPriorityFeePerGas, maxFeePerGas, gasLimit, `to`, `value`, nonce, data, r, s, v, creates, raw, chainId, timestamp) VALUES ('" +
        filteredValues[0] +
        "','" +
        filteredValues[1] +
        "','" +
        filteredValues[2] +
        "','" +
        filteredValues[3] +
        "','" +
        filteredValues[4] +
        "','" +
        filteredValues[5] +
        "','" +
        filteredValues[6] +
        "','" +
        filteredValues[7] +
        "','" +
        gasPrice +
        "','" +
        filteredValues[9] +
        "','" +
        filteredValues[10] +
        "','" +
        data +
        "','" +
        filteredValues[12] +
        "','" +
        filteredValues[13].toString() +
        "','" +
        filteredValues[14] +
        "','" +
        filteredValues[15] +
        "','" +
        filteredValues[16] +
        "','" +
        filteredValues[17] +
        "','" +
        filteredValues[18] +
        "','" +
        filteredValues[19] +
        "','" +
        filteredValues[20] +
        "','" +
        "456789" +
        "','" +
        formattedDate +
        "')";
      connection.query(query, function (error, result) {
        if (error) throw error;
        console.log("Transaction added..");
      });
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
    return error;
  }
}

// async function inserthashtextmapping(data) {
//     try {
//        return Promise
//     }catch (error) {
//         console.log("Something Went Wrong", error);
//         return error;
//     }
// }
// async function inserthashtextmapping(data) {
//     try {
//         const response = await helperfunctions.fetchTransactionNameByTransactionHash(data.slice(0, 10)).then((response) => {
//             // console.log(JSON.stringify(response.data));
//             return Promise.resolve(response.data);
//         }).catch((error) => {
//             console.log(error);
//             return error;
//         });
//         for (let index = 0; index < response.items.length; index++) {
//             let query = "INSERT INTO `FunctionHashTextMappingTable` (`hash`, `short_hash`, `text`) VALUES ('" + response.items[index].hash + "', '" + (response.items[index].hash).slice(0, 10) + "', '" + response.items[index].text + "')";
//             connection.query(query, function (error, result) {
//                 if (error) throw error;
//                 console.log("Transaction added..", result);
//             });
//             return response;
//         }
//     } catch (error) {
//         console.log("Error Message: ", error);
//     }

// }
function convertUnixTimestampToDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  return formattedDate;
}
