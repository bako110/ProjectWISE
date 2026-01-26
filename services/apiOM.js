const axios = require('axios');
const xml2js = require('xml2js');
const https = require('https');
const fs = require('fs');
const dotenv = require('dotenv');
const { parseStringPromise } = require('xml2js');
const logger = require('../utils/logger.js');

dotenv.config();

const agent = new https.Agent({
  cert: fs.readFileSync(process.env.OM_CERT_PATH || "cert.pem"),
  key: fs.readFileSync(process.env.OM_KEY_PATH || "key.pem"),
  rejectUnauthorized: true,
});

const payOrangeMoney = async ({
  customerMsisdn,
  amount,
  otp,
  reference,
}) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<COMMAND>
  <TYPE>OMPREQ</TYPE>
  <customer_msisdn>${customerMsisdn}</customer_msisdn>
  <merchant_msisdn>${process.env.MERCHANT_MSISDN}</merchant_msisdn>
  <api_username>${process.env.API_USERNAME}</api_username>
  <api_password>${process.env.API_PASSWORD}</api_password>
  <amount>${amount}</amount>
  <PROVIDER>101</PROVIDER>
  <PROVIDER2>101</PROVIDER2>
  <PAYID>12</PAYID>
  <PAYID2>12</PAYID2>
  <otp>${otp}</otp>
  <reference_number>WI${otp}</reference_number>
  <ext_txn_id>${reference}</ext_txn_id>
</COMMAND>`;

  const response = await axios.post(
    process.env.OM_URL,
    xml,
    {
      httpsAgent: agent,
      headers: { "Content-Type": "text/xml" },
      timeout: 30000,
    }
  );

  logger.info(`OM Response: ${JSON.stringify(response.data)}`);

  const rawXml = response.data;

  // ⚠️ Orange Money renvoie un XML sans root → on en ajoute une
  const safeXml = `
  <RESPONSE>
    ${rawXml}
  </RESPONSE>
  `;

  const parsed = await parseStringPromise(safeXml, {
    explicitArray: false,
    trim: true,
  });

  logger.info(`OM Response parsed: ${JSON.stringify(parsed)}`);

  return {
    code: parsed.RESPONSE.status,
    message: parsed.RESPONSE.message,
    orangeTransactionId: parsed.RESPONSE.transID,
  };

}

module.exports = { payOrangeMoney };