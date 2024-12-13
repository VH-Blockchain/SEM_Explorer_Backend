import { connection } from "../config/db-config.js";
import { ethers } from "ethers";
import fs from "fs";
import solc from "solc";
import { Web3 } from "web3";
import dotenv from 'dotenv'
dotenv.config()
export async function getApiKey(req, res) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PROVIDER_KEY
  );
  const address = process.env.PROVIDER_ADRESS
  try {
    let transferEvents = [];
    const latestBlockNumber = await provider.getBlockNumber();
    for (
      let blockNumber = 9248260;
      blockNumber <= latestBlockNumber;
      blockNumber++
    ) {
      const block = await provider.getBlockWithTransactions(blockNumber);
      for (const transaction of block.transactions) {
        if (transaction.to !== null) {
          const contract = new ethers.Contract(
            transaction.to,
            [
              "event Transfer(address indexed from, address indexed to, uint256 value)",
            ],
            provider
          );
          const events = await contract.queryFilter(
            contract.filters.Transfer(address, null)
          );
          transferEvents = transferEvents.concat(events);
        }
      }
    }
    const formattedEvents = transferEvents.map((event) => ({
      blockNumber: event.blockNumber,
      timeStamp: Math.floor(Date.now() / 1000),
      hash: event.transactionHash,
      from: event.args.from,
      to: event.args.to,
      value: ethers.utils.formatUnits(event.args.value.toString(), 18),
    }));

    return res.status(200).send(formattedEvents);
  } catch (error) {
    return res.status(200).send("Error fetching token transfer events:");
  }

  return res.status(200).send("Internal Server Error");
}

export async function getSingleAddressBalance(req, res) {
  const module = req.query.module;
  const action = req.query.action;
  const address = req.query.address;
  if (module === "account" && action === "balance") {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.PROVIDER_KEY
    );
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.utils.formatEther(balance);
    return res.send(balanceInEth);
  }
  res.send("Invalid request");
}

export async function getMultipleAddressBalance(req, res) {
  const module = req.query.module;
  const action = req.query.action;
  const address = req.query.address;
  if (!address) {
    return res.status(400).send("No addresses provided");
  }
  const addressArray = address.split(",");
  const balances = [];
  if (module === "account" && action === "balancemulti") {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.PROVIDER_KEY
    );
    for (const add of addressArray) {
      const trimmedAddress = add.trim();
      const balance = await provider.getBalance(trimmedAddress);
      const balanceInEth = ethers.utils.formatEther(balance);
      balances.push({ address: trimmedAddress, balance: balanceInEth });
    }

    return res.json(balances);
  }
  return res.send("Invalid request");
}

export async function fetchInternalTransaction(req, res) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PROVIDER_KEY
  );
  try {
    const transactionHash = req.query.transactionHash;
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) {
      return res.status(404).json({ error: "Transaction receipt not found" });
    }
    const internalTransactions = receipt.logs.filter(
      (log) => log.topics.length > 1
    );
    const formattedInternalTransactions = internalTransactions.map((tx) => ({
      blockNumber: receipt.blockNumber,
      timeStamp: receipt.timestamp,
      from: ethers.utils.getAddress(tx.topics[1]),
      to: ethers.utils.getAddress(tx.topics[2]),
      value: ethers.utils.formatUnits(tx.data, "wei"),
      contractAddress: "",
      input: "",
      type: "call",
      gas: receipt.gasUsed.toString(),
      gasUsed: "0",
      isError: "0",
      errCode: "",
    }));

    res.json(formattedInternalTransactions);
  } catch (error) {
    console.error("Error fetching internal transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTransactionByAddress(req, res) {
  const module = req.query.module;
  const action = req.query.action;
  const address = req.query.address;
  const page = req.query.page != undefined ? req.query.page : 1;
  const limit = req.query.limit != undefined ? req.query.limit : 10;
  const offset = (page - 1) * limit;
  let start_number = limit * (page - 1) + 1;
  let last_number = limit * (page - 1) + parseInt(limit + 10);

  if (!address) {
    return res.status(400).send("No addresses provided");
  }

  if (module === "account" && action === "balancemulti") {
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
        return res.json(error);
      } else {
        const response = {
          transactions: queryresponse,
          meta: {
            start_number: start_number,
            last_number: last_number,
            current_page: page,
            per_page: limit,
            offset: offset,
          },
        };
        console.log(response, "response");
        return res.json(response);
      }
    });
  } else {
    return res.send("Invalid request");
  }
}

export async function getTokenTransferEvents(req, res) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.PROVIDER_KEY
    );
    const latestBlockNumber = await provider.getBlockNumber();
    const address = req.query.address;
    const contractAddress = req.query.contractAddress;
    if (!address || !contractAddress) {
      return res
        .status(400)
        .send("Missing required parameters: address, contractAddress");
    }
    const contract = new ethers.Contract(
      contractAddress,
      [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ],
      provider
    );
    const sentEvents = await contract.queryFilter(
      contract.filters.Transfer(address, null),
      9248260,
      latestBlockNumber
    );
    const receivedEvents = await contract.queryFilter(
      contract.filters.Transfer(null, address),
      9248260,
      latestBlockNumber
    );
    const transferEvents = sentEvents.concat(receivedEvents);
    const data = transferEvents.map((event) => ({
      blockNumber: event.blockNumber,
      timeStamp: Math.floor(Date.now() / 1000),
      hash: event.transactionHash,
      blockHash: event.blockHash,
      from: event.args.from,
      contractAddress: contractAddress,
      to: event.args.to,
      value: ethers.utils.formatUnits(event.args.value.toString(), 18),
      transactionIndex: event.transactionIndex,
    }));

    return res.send(data);
  } catch (error) {
    console.error("Error fetching token transfer events:", error);
    return res.status(500).send("Internal Server Error");
  }
}
