const axios = require('axios');
const xml2js = require('xml2js');
const https = require('https');
const fs = require('fs');
const dotenv = require('dotenv');
const { parseStringPromise } = require('xml2js');

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
})  => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<COMMAND>
  <TYPE>OMPREQ</TYPE>
  <customer_msisdn>${customerMsisdn}</customer_msisdn>
  <merchant_msisdn>${process.env.MERCHANT_MSISDN}</merchant_msisdn>
  <api_username>${process.env.API_USERNAME}</api_username>
  <api_password>${process.env.API_PASSWORD }</api_password>
  <amount>${amount}</amount>
  <PROVIDER>101</PROVIDER>
  <PROVIDER2>101</PROVIDER2>
  <PAYID>12</PAYID>
  <PAYID2>12</PAYID2>
  <otp>${otp}</otp>
  <reference_number>${reference}</reference_number>
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

  const parsed = await parseStringPromise(response.data, {
    explicitArray: false,
  });

  return {
    code: parsed.status,
    message: parsed.message,
    orangeTransactionId: parsed.transID,
  };
}

module.exports = { payOrangeMoney };