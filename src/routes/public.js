import { Router } from "express";
import { blocks, fetchTransactionDataByBlockNumber, fetchTransactions, fetchTransactionsByTime, fetchblockdatabynumber, gatherBlockInfo, getdatabyaddress, inserthashtextmapping, searchTransactionByHash } from "../controllers/blockchain-monitoring.js";
import { ApiResponse } from '../utils/api-response.js'

const api = Router();

api.get('/', (req, res) => {
    try {
        console.log("api", req.query);
        if (typeof req.query.page == "undefined" && typeof req.query.limit == "undefined") {
            const query = typeof req.query.page == "undefined" ? "page" : typeof req.query.limit == "undefined" ? "limit" : false;
            ApiResponse.ErrorResponse(
                res,
                `Please provide ${query}`
            )
        }
        let responseMessage = "Something Went Wrong...";

        switch (req.query.module) {
            case 'address':
                responseMessage = "Address module logic here...";
                break;
            case 'block':
                responseMessage = "Block module logic here...";
                break;
            case 'states':
                responseMessage = "States module logic here...";
                break;
            case 'transaction':
                responseMessage = "Transaction module logic here...";
                break;
            default:
                break;
        }

        // Send the final response outside the switch statement
        res.send(responseMessage);
    } catch (error) {
        console.log("error aayi :!", error);
        res.json({ "message": "we got error in backend!" });
        
    }
    // req.query.module === 'address' ? res.send('address ma aaavi gaya') :
    //     req.query.module === 'block' ? res.send('block') :
    //         req.query.module === 'states' ? res.send('stats') :
    //             req.query.module === 'transaction' ? res.send('transaction') :
    //                 res.send('error');

});
export { api };