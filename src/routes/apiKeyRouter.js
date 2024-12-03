import { Router } from "express";
import { getApiKey,getSingleAddressBalance,getMultipleAddressBalance,fetchInternalTransaction,getTransactionByAddress,getTokenTransferEvents} from "../controllers/apiKeyController.js";
import {verifySingleFileContract, getVerifiedContract , verifyMultiFileContract} from "../controllers/verifyController.js";
import upload from "../controllers/upload.js";
const apiKeyRoute = Router();

apiKeyRoute.get("/", getApiKey);
apiKeyRoute.get("/singlebalance", getSingleAddressBalance);
apiKeyRoute.get("/multiplebalance", getMultipleAddressBalance);
apiKeyRoute.get("/fetchinternaltransaction", fetchInternalTransaction);
apiKeyRoute.get("/getTransactionByAddress", getTransactionByAddress);
apiKeyRoute.get("/getTokenTransferEvents", getTokenTransferEvents);
apiKeyRoute.post('/verify',upload.single('file'), verifySingleFileContract);
apiKeyRoute.post('/multipleVerify',upload.array('files',15), verifyMultiFileContract);
apiKeyRoute.get("/getVerifiedContract", getVerifiedContract);

export default apiKeyRoute;