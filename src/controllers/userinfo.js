import * as userinfo from "../models/planInformation.js";
import { ApiResponse } from "../utils/api-response.js";
//Get User Data
export function getuserdata(req,res) {
    const email_id = req.email;
    console.log("email_id", email_id);
    if (email_id == undefined) {ApiResponse.validationRuleResponse(res, "email_id is required")};
    userinfo.getActivePlan(email_id).then((result) => {
        return ApiResponse.successResponseWithData(res, "User Details", { ...result });
    }).catch((error) => {
        return ApiResponse.ErrorResponse(res, error);
    });
}
export function updateuserdata(req,res) {
    const email_id = req.email;
    const plan_id = req.body.plan_id;
    if (email_id == undefined) {ApiResponse.validationRuleResponse(res, "email_id is required")};
    if (plan_id == undefined) {
        ApiResponse.validationRuleResponse(res, "plan_id is required")
    }else if(plan_id ==0 || plan_id>4){
        ApiResponse.validationRuleResponse(res, "plan_id is not valid")
    }
    userinfo.UpdatePlan(email_id, plan_id).then((result) => {
        return ApiResponse.successResponseWithData(res, "User Details", { ...result });
    }).catch((error) => {
        return ApiResponse.ErrorResponse(res, error);
    });
}