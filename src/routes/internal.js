import { Router } from "express";
import {
  getbalance,
  blocks,
  fetchTransactionDataByBlockNumber,
  fetchTransactions,
  fetchTransactionsByTime,
  fetchblockdatabynumber,
  gatherBlockInfo,
  getdatabyaddress,
  inserthashtextmapping,
  searchTransactionByHash,
} from "../controllers/blockchain-monitoring.js";
import { ApiResponse } from "../utils/api-response.js";
import { ethers } from "ethers";

export const internal = Router();
// Define a route to get blockchain blocks
internal.get("/fetchBlocks", (req, res) => {
  let page, limit;
  try {
    if (
      typeof req.query.page != undefined &&
      typeof req.query.limit != undefined
    ) {
      // console.log("page", typeof req.query.page, "limit", typeof req.query.limit);
      page = 1;
      limit = 10;
    } else {
      page = req.query.page;
      limit = req.query.limit;
    }
    const offset = (page - 1) * limit;
    blocks(page, limit, offset).then((result) => {
      return ApiResponse.successResponseWithData(
        res,
        "Blocks Fetched Successfully",
        { ...result }
      );
    });
  } catch (error) {
    res.send(error);
  }
});

// Define a route to get blockchain transactions
internal.get("/txs", (req, res) => {
  let page, limit;
  try {
    if (req.query.page == undefined && req.query.limit == undefined) {
      page = 1;
      limit = 10;
    } else {
      console.log("object");
      page = req.query.page;
      limit = req.query.limit;
    }
    const offset = (page - 1) * limit;
    fetchTransactions(page, limit, offset).then((result) => {
      return ApiResponse.successResponseWithData(
        res,
        "Transactions Fetched Successfully",
        { ...result }
      );
    });
  } catch (error) {
    return ApiResponse.ErrorResponse(res, "Error while fetching Transactions");
  }
});

// Define a route to search for a transaction by hash
internal.get("/searchbytransactionhash/:hash", (req, res) => {
  try {
    searchTransactionByHash(req.params.hash).then((result) => {
      //  console.log("Res",result);
      if (result === undefined) {
        return ApiResponse.ErrorResponse(
          res,
          "Error while fetching Transactions"
        );
      } else {
        return ApiResponse.successResponseWithData(
          res,
          "Transaction Fetched Successfully",
          { ...result }
        );
      }
    });
  } catch (error) {
    res.send(error);
  }
});

internal.get("/getblockbynumber/:number", (req, res) => {
  try {
    fetchblockdatabynumber(req.params.number).then((result) => {
      //  console.log("Res",result);
      if (result === undefined) {
        return ApiResponse.ErrorResponse(
          res,
          `Block Number ${req.params.number} not found`
        );
      } else {
        return ApiResponse.successResponseWithData(
          res,
          "Transaction Fetched Successfully",
          { ...result }
        );
      }
    });
  } catch (error) {
    res.send(error);
  }
});

// Define a route to get data by address
internal.get("/address/:address", (req, res) => {
  // let page, limit;
  try {
    const page = req.query.page != undefined ? req.query.page : 1;
    const limit = req.query.limit != undefined ? req.query.limit : 20;

    const offset = (page - 1) * limit;
    getdatabyaddress(page, limit, offset, req.params.address).then((result) => {
      // console.log(result);
      if (result.transactions.length == 0) {
        return ApiResponse.notFoundResponse(res, "No Transactions Found");
      }
      return ApiResponse.successResponseWithData(
        res,
        "Transactions Fetched Successfully",
        { ...result }
      );
    });
  } catch (error) {
    return ApiResponse.ErrorResponse(res, "Error while fetching Transactions");
  }
});

internal.get("/subscriptions", async function (req, res) {
  const data = await inserthashtextmapping();
  return ApiResponse.successResponseWithData(
    res,
    "Transaction Fetched Successfully",
    data
  );
});

internal.get("/providers", async function (req, res) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sem-live.appworkdemo.com/archive"
    );
    return ApiResponse.successResponseWithData(
      res,
      "Transaction Fetched Successfully",
      provider
    );
  } catch (error) {
    console.log(error, "provider error");
    return ApiResponse.ErrorResponse(res, "Error while fetching Transactions");
  }
});

internal.get("/getbalance", async function (req, res) {
  const d = await getbalance();
  return ApiResponse.successResponse(
    res,
    "Transaction Fetched Successfully",
    d
  );
});
