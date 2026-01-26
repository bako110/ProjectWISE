const axios = require("axios");
const dotenv = require("dotenv");
const logger = require("../utils/logger.js");

dotenv.config();

const username = process.env.MOOV_USERNAME;
const password = process.env.MOOV_PASSWORD;
const url = process.env.MOOV_URL;

const sendMoovOpt = async (transaction_id, destination, amount) => {
  try {
    const response = await axios.post(
      url,
      {
        "request-id": transaction_id,
        destination,
        amount,
        remarks: "OTP Merchant",
        "extended-data": { "module": "MERCHOTPPAY" },
      },
      {
        auth: {
            username,
            password,
        },
        headers: {
          "Content-Type": "application/json",
          "command-id": "process-create-mror-otp",
        },
        timeout: 30000,
      }
    );

    logger.info(`Moov Response: ${JSON.stringify(response.data)}`);

    switch (response.data.status) {
      case '0':
        logger.info(`OTP sent successfully for transaction ${transaction_id}`);
        return response.data;
      case '12':
        logger.info(`Failed to send OTP for transaction ${transaction_id}`);
        break;
      default:
        logger.info(`Unknown status code ${response.data.statusCode} for transaction ${transaction_id}`);
        break;
    }

    return response.data;
  } catch (error) {
    logger.error(`Error in getMoovOpt: ${error.message}`);
    throw error;
  }
};

const reSendMoovOpt = async (moov_id, request_id, destination, amount) => {
  try {
    const response = await axios.post(
      url,
      {
        "request-id": moov_id,
        destination,
        amount,
        remarks: "RESEND OTP",
        "extended-data": { 
            "module": "MERCHOTPPAY",
            ext1: request_id
         },
      },
      {
        auth: {
            username,
            password,
        },
        headers: {
          "Content-Type": "application/json",
          "command-id": "process-mror-resend-otp",
        },
        timeout: 30000,
      }
    );

    logger.info(`Moov Response: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (error) {
    logger.error(`Error in getMoovOpt: ${error.message}`);
    throw error;
  }
};

const payMoov = async (new_request_id, moov_id, request_id, destination, amount, otp) => {
  try {
    const response = await axios.post(
      url,
      {
        "request-id": new_request_id,
        destination,
        amount,
        remarks: "SDK test",
        "extended-data": { 
            "module": "MERCHOTPPAY",
            "trans-id": moov_id,
            ext1: request_id,
            ext2: request_id,
            otp
         },
      },
      {
        auth: {
            username,
            password,
        },
        headers: {
          "Content-Type": "application/json",
          "command-id": "process-commit-otppay",
        },
        timeout: 30000,
      }
    );

    logger.info(`Moov Response: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (error) {
    logger.error(`Error in getMoovOpt: ${error.message}`);
    throw error;
  }
};

module.exports = { sendMoovOpt, reSendMoovOpt, payMoov };