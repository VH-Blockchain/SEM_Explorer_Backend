import moment from "moment";

export const ApiResponse = {
  successResponse: (res, msg) => {
    const data = {
      code: 200,
      responseTimeStamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss:ms"),
      message: msg,
    };
    return res.status(200).json(data);
  },

  successResponseWithData: (res, msg, data) => {
    const resData = {
      code: 200,
      responseTimeStamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss:ms"),
      message: msg,
      data,
    };
    return res.status(200).json(resData);
  },

  ErrorResponse: (res, msg) => {
    const data = {
      code: 500,
      responseTimeStamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss:ms"),
      message: msg,
    };
    return res.status(500).json(data);
  },

  notFoundResponse: (res, msg) => {
    const data = {
      code: 404,
      responseTimeStamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss:ms"),
      message: msg,
    };
    return res.status(404).json(data);
  },

  validationErrorWithData: (res, msg) => {
    const resData = {
      code: 400,
      responseTimeStamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss:ms"),
      message: msg,
    };
    return res.status(400).json(resData);
  },

  unauthorizedRespons: (res, msg) => {
    const data = {
      code: 401,
      responseTimeStamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss:ms"),
      message: msg,
    };
    return res.status(401).json(data);
  },

  validationRuleResponse: (res, msg, data) => {
    const resData = {
      code: 412,
      responseTimeStamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss:ms"),
      message: msg,
      data,
    };
    return res.status(412).send(resData);
  },
};
