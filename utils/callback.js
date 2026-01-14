const axios = require('axios');
const xml2js = require('xml2js');
import dotenv from 'dotenv';
dotenv.config();

app.post('/pay', async (req, res) => {
  try {
    const {
      customer_msisdn,
      amount,
      otp
    } = req.body;

    const xmlRequest = buildOrangeMoneyXML({
      customer_msisdn,
      merchant_msisdn: process.env.MERCHANT_MSISDN,
      api_username: process.env.API_USERNAME,
      api_password: process.env.API_PASSWORD,
      amount,
      otp,
      reference_number: 'REFW' + Date.now(),
      ext_txn_id: 'TXNw' + Date.now()
    });

    const response = await axios.post(
      'https://testom.bf/', // TEST
      xmlRequest,
      {
        headers: {
          'Content-Type': 'text/xml'
        },
        timeout: 15000
      }
    );

    // Parser la réponse XML
    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false
    });

    return res.json({
      success: parsed.status === '200',
      status: parsed.status,
      message: parsed.message,
      transactionId: parsed.transID
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du paiement Orange Money'
    });
  }
});


function buildOrangeMoneyXML(data) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<COMMAND>
  <TYPE>OMPREQ</TYPE>
  <customer_msisdn>${data.customer_msisdn}</customer_msisdn>
  <merchant_msisdn>${data.merchant_msisdn}</merchant_msisdn>
  <api_username>${data.api_username}</api_username>
  <api_password>${data.api_password}</api_password>
  <amount>${data.amount}</amount>
  <PROVIDER>101</PROVIDER>
  <PROVIDER2>101</PROVIDER2>
  <PAYID>12</PAYID>
  <PAYID2>12</PAYID2>
  <otp>${data.otp}</otp>
  <reference_number>${data.reference_number}</reference_number>
  <ext_txn_id>${data.ext_txn_id}</ext_txn_id>
</COMMAND>`;
}


