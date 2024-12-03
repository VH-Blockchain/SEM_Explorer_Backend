import { blockAgecalculator } from "../utils/co-helperfunctions.js";
import { connection } from "../config/db-config.js";

//Get Table Count
function getTableCount(tablename) {
  return new Promise(async (resolve, reject) => {
    connection.query(
      `SELECT COUNT(*) AS count FROM ${tablename}`,
      function (error, response, fields) {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(JSON.stringify(response)));
        }
      }
    );
  });
}

export function blocks(page, limit, offset) {
  return new Promise(async (resolve, reject) => {
    const limits = 1000;
    // Execute a SQL query to select all rows from the 'blocks' table, ordered by 'number'
    const totalPageData = await getTableCount("blocks");
    const totalpage = Math.ceil(totalPageData[0]?.count / limits);
    connection.query(
      "SELECT * FROM blocks ORDER BY number DESC limit " +
        limits +
        " offset " +
        offset +
        "",
      function (error, queryresponse, fields) {
        if (error) {
          // Reject the promise if there's an error
          reject(error);
        } else {
          let i = 0;
          queryresponse.forEach((element) => {
            Object.assign(queryresponse[0], {
              Age: blockAgecalculator(element.timestamp),
            });
          });

          const response = {
            blocks: queryresponse,
            meta: {
              from: queryresponse[0]?.number,
              to: queryresponse[limit - 1]?.number,
              current_page: page,
              per_page: limit,
              total: totalPageData[0]?.count,
              last_page: totalpage,
            },
          };
          // Resolve the promise with the query result
          resolve(response);
        }
      }
    );
  });
}

//Don't Change Frontend is Working on this.
/**
 * Fetches transactions from the 'transactions' table by executing a SQL query.
 *
 * @return {Promise} A Promise that resolves with the query result or rejects with an error.
 */
export function fetchTransactions(page, limit, offset) {
  return new Promise(async (resolve, reject) => {
    const limits = limit;
    const totalPageData = await getTableCount("transactions");
    const totalpage = Math.ceil(totalPageData[0]?.count / limits);
    // Execute a SQL query to select all rows from the 'transactions' table
    connection.query(
      "SELECT * FROM transactions  ORDER BY blockNumber DESC limit " +
        limits +
        " offset " +
        offset +
        "",
      function (error, queryresponse, fields) {
        if (error) {
          // Reject the promise if there's an error
          reject(error);
        } else {
          console.log(queryresponse, "queryresponse");
          // Resolve the promise with the query result
          const response = {
            transactions: queryresponse,
            meta: {
              from: queryresponse[0]?.number,
              to: queryresponse[limit - 1]?.number,
              current_page: page,
              per_page: limit,
              total: totalPageData[0]?.count,
              last_page: totalpage,
            },
          };
          // Resolve the promise with the query result
          resolve(response);
        }
      }
    );
  });
}

// Function to gather block information
export async function gatherBlockInfo() {
  let transactions = [];
  // const blocks = await fetchFirst10Blocks(); // Await the result of fetching the first 10 blocks

  const latestBlock = blocks[0]; // Get the latest block from the result

  if (latestBlock.totaltransactions != 0) {
    let blockTransactions = await fetchTransactionDataByBlockNumber(
      latestBlock.number
    ); // Await the result of fetching transaction data for the latest block
    transactions = blockTransactions; // Assign the transaction data to the 'transactions' array
  }

  const temp = [{ transactions }];
  blocks.splice(1, 0);
  for (let index = 0; index < blocks.length; index++) {
    temp.push(blocks[index]);
  }

  // return an object with the latest block number and the previous block information
  return {
    latestBlock: latestBlock.number,
    previousBlockInfo: temp,
  };
}
//Function to retrieve transaction by time
export function fetchTransactionsByTime() {
  return new Promise((resolve, reject) => {
    // Execute a SQL query to select all rows from the 'transactions' table, ordered by 'timestamp'
    connection.query(
      "SELECT transaction_hash,blockNumber,`from`,`to`,`value`,timestamp,gasPrice FROM transactions ORDER BY timestamp ASC",
      function (error, response, fields) {
        if (error) {
          // Reject the promise if there's an error
          reject(error);
        } else {
          // Resolve the promise with the query result
          resolve(response);
        }
      }
    );
  });
}
// Function to retrieve transaction data by block number from the database
export function fetchTransactionDataByBlockNumber(number) {
  return new Promise((resolve, reject) => {
    // Execute a SQL query to select specific columns from the 'transactions' table based on the block number
    connection.query(
      "SELECT transaction_hash, timestamp, `from`, `to`, `value` FROM transactions where `blockNumber` = '" +
        number +
        "'",
      function (error, response, fields) {
        if (error) {
          //reject the promise if there's an error
          reject(error);
        } else {
          // Resolve the promise with the query result
          resolve(response);
        }
      }
    );
  });
}

// Function to search for a transaction by its hash in the database
export function searchTransactionByHash(hash) {
  return new Promise((resolve, reject) => {
    // console.log("Da")
    // Execute a SQL query to select all columns from the 'transactions' table based on the transaction hash
    connection.query(
      "SELECT * FROM transactions where `transaction_hash` = '" + hash + "'",
      function (error, response, fields) {
        if (error) {
          // Reject the promise if there's an error
          resolve(error);
          // reject(error);
        } else {
          // Resolve the promise with the query result
          resolve(response[0]);
        }
      }
    );
  });
}

// Function to fetch the first 10 rows of block data from the database
export function fetchblockdatabynumber(blockNumber) {
  return new Promise((resolve, reject) => {
    // Execute a SQL query to select specific columns from the 'blocks' table, ordered by 'number' in descending order, and limit to 10 rows
    connection.query(
      "SELECT * FROM blocks where `number` ='" + blockNumber + "'",
      function (error, response, fields) {
        if (error) {
          // Reject the promise if there's an error
          reject(error);
        } else {
          // Resolve the promise with the query result
          resolve(response[0]);
        }
      }
    );
  });
}

export function getdatabyaddress(page, limit, offset, address) {
  return new Promise(async (resolve, reject) => {
    const totalPageData = await getTableCount("transactions");
    const totalpage = Math.ceil(totalPageData[0]?.count / limit);
    let start_number = limit * (page - 1) + 1;
    let last_number = limit * (page - 1) + parseInt(limit + 10);

    // Execute a SQL query to select all rows from the 'transactions' table
    let temp =
      "SELECT * FROM transactions where `from` ='" +
      address +
      "' OR `to`='" +
      address +
      "' OR `creates` ='" +
      address +
      "' ORDER BY blockNumber DESC limit " +
      limit +
      " offset " +
      offset +
      "";

    connection.query(temp, function (error, queryresponse, fields) {
      if (error) {
        // Reject the promise if there's an error
        reject(error);
      } else {
        // Resolve the promise with the query result
        const response = {
          transactions: queryresponse,
          meta: {
            start_number: start_number,
            last_number: last_number,
            current_page: page,
            per_page: limit,
            total: totalPageData[0]?.count,
            last_page: totalpage,
          },
        };
        // Resolve the promise with the query result
        resolve(response);
      }
    });
  });
}

export async function getbalance() {
  try {
    return new Promise(async (resolve, reject) => {
      // let address = "0xf0Ebc9a4944FfbBB00f83C097311666BD7c45A26"
      let query =
        "SELECT value FROM transactions where `to` ='" + address + "'";
      const frombalance = connection.query(
        query,
        function (error, response, fields) {
          if (error) {
            reject(error);
          } // Reject the promise if there's an error
          else {
            const d = JSON.parse(JSON.stringify(response));
            // Create a new array to store the extracted values
            const outputArray = [];

            // Loop through the input array and extract the 'value' property
            for (const item of d) {
              outputArray.push(item.value);
            }
            // Initialize a variable to store the sum
            let balance = 0;

            // Loop through the array and add each value to the sum
            for (const value of outputArray) {
              balance += value;
            }

            // The 'sum' variable now contains the total sum of the values
            resolve(balance);
          }
        }
      );
      const tobalance = resolve(frombalance);
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
    return error;
  }
}

export async function inserthashtextmapping() {
  try {
    return new Promise(async (resolve, reject) => {
      connection.query(
        "SELECT * FROM `subscriptions`",
        function (error, response, fields) {
          if (error) {
            // Reject the promise if there's an error
            reject(error);
          } else {
            // console.log(JSON.parse(response));
            response.forEach((element) => {
              element["features"] = JSON.parse(element["features"]);
              element["features"] = element["features"]["data"];
            });
            // Resolve the promise with the query result
            resolve(response);
          }
        }
      );
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
    return error;
  }
}
