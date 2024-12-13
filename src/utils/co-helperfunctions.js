import axios from "axios";
import * as ethers from "ethers";
/**
 * Calculates the age in years, days, hours, minutes, and seconds
 * between the current date and a given block timestamp.
 *
 * @param {Date} blocktimestamp - The timestamp of the block
 * @return {Object} - An object containing the age in years, days,
 *                    hours, minutes, and seconds
 */
import dotenv from 'dotenv'

dotenv.config();

export function blockAgecalculator(blocktimestamp) {
    const date1 = new Date()
    // Calculate the time difference in milliseconds
    const timeDifference = Math.abs(date1 - blocktimestamp);

    // Convert milliseconds to years, days, hours, minutes, and seconds
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = 60 * millisecondsInSecond;
    const millisecondsInHour = 60 * millisecondsInMinute;
    const millisecondsInDay = 24 * millisecondsInHour;

    let remainingMilliseconds = timeDifference;

    const days = Math.floor(remainingMilliseconds / millisecondsInDay);
    remainingMilliseconds %= millisecondsInDay;

    const hours = Math.floor(remainingMilliseconds / millisecondsInHour);
    remainingMilliseconds %= millisecondsInHour;

    const minutes = Math.floor(remainingMilliseconds / millisecondsInMinute);
    remainingMilliseconds %= millisecondsInMinute;

    const seconds = Math.floor(remainingMilliseconds / millisecondsInSecond);
    return {
        days,
        hours,
        minutes,
        seconds,
    }
}
blockAgecalculator("1222222")
/**
 * Fetches transfer data for a given transaction hash.
 *
 * @return {Promise<void>} The fetched transfer data.
 */
async function fetchTransferData(transactionHash) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.MAINNET_INFURA_URL);
        const transaction = await provider.getTransaction(transactionHash);
        // console.log("Transaction Data", transaction);
        const data = transaction.data;
        // console.log("Data hai kya ?", data);
        // console.log("Transaction Hash to", transaction.to);
        const code = await provider.getCode(transaction.to);
        if (data == "0x" && transaction.value >= 0 && code === '0x') {
            return {
                transaction,
                "method": "Transfer",
            }
        } else {
            const temp = await fetchTransactionNameByTransactionHash(data.slice(0, 10)).then(async (response) => {
                const tx = await provider.getTransactionReceipt(transactionHash)
                tx.logs.map((log) => {
                    // console.log("hehehe ", log.topics)
                })
                return {
                    transaction,
                    "method": response.data.items[0].text,
                }
                // return Promise.resolve(response.data);
            }).catch((error) => {
                console.log(error);
                return error;
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// fetchTransferData("0x443a2c81fc6c54c355b3fec7e066990fab368e991783b5bd7329d3e30c665c63")

/**
 * Fetches the transaction name by the given transaction hash.
 *
 * @param {string} hexdata - The transaction hash in hexadecimal format.
 * @return {Promise} A Promise that resolves to the response object containing the transaction name.
 */
export async function fetchTransactionNameByTransactionHash(hexdata) {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.ETHERFACE_URL}/signatures/hash/all/${hexdata}/1`,
        headers: {}
    };

    const res = await axios.request(config)

    return res;

}
