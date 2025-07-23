
import followRedirects from 'follow-redirects';
const { https } = followRedirects;

// import fs from 'fs';

// export async function initializePayment(amount, phone, method) {
    
//     var options = {
//         'method': 'POST',
//         'hostname': 'api.senfenico.com',
//         'path': '/v1/payment/charges/',
//         'headers': {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'X-API-KEY': 'sk_test_6w9pyIqwychYnCBJ2g9eIWBl2p3HqfrZxv_YDnNchcE'
//         },
//         'maxRedirects': 20
//     };

//     var req = https.request(options, function (res) {
//     var chunks = [];

//     res.on("data", function (chunk) {
//         chunks.push(chunk);
//     });

//     res.on("end", function (chunk) {
//         var body = Buffer.concat(chunks);
//         console.log(body.toString());
//     });

//     res.on("error", function (error) {
//         console.error(error);
//     });
//     });

//     var postData = JSON.stringify({
//         "amount": amount,
//         "currency": "XOF",
//         "payment_method": "mobile_money",
//         "payment_method_details": {
//             "phone": phone,
//             "provider": method
//         }
//     });

//     req.write(postData);

//     req.end();

// }

// export async function verifyPayment(opt, referenceId) {

//     var options = {
//         'method': 'POST',
//         'hostname': 'api.senfenico.com',
//         'path': '/v1/payment/charges/submit',
//         'headers': {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'X-API-KEY': 'sk_test_6w9pyIqwychYnCBJ2g9eIWBl2p3HqfrZxv_YDnNchcE'
//         },
//         'maxRedirects': 20
//     };

//     var req = https.request(options, function (res) {
//     var chunks = [];

//     res.on("data", function (chunk) {
//         chunks.push(chunk);
//     });

//     res.on("end", function (chunk) {
//         var body = Buffer.concat(chunks);
//         console.log(body.toString());
//     });

//     res.on("error", function (error) {
//             console.error(error);
//         });
//     });

//     var postData = JSON.stringify({
//         "otp": opt,
//         "charge_reference": referenceId
//     });

//     req.write(postData);

//     req.end();
// }

// export async function getPaymentStatus(referenceId) {

//     var options = {
//         'method': 'GET',
//         'hostname': 'api.senfenico.com',
//         'path': '/v1/payment/charges/' + referenceId,
//         'headers': {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'X-API-KEY': 'sk_test_6w9pyIqwychYnCBJ2g9eIWBl2p3HqfrZxv_YDnNchcE'
//         },
//         'maxRedirects': 20
//     };

//     var req = https.request(options, function (res) {
//     var chunks = [];

//     res.on("data", function (chunk) {
//         chunks.push(chunk);
//     });

//     res.on("end", function (chunk) {
//         var body = Buffer.concat(chunks);
//         console.log(body.toString());
//     });

//     res.on("error", function (error) {
//             console.error(error);
//         });
//     });

//     req.end();
// }


// import { https } from followRedirects;
import fs from 'fs';

export async function initializePayment(amount, phone, method) {

    console.log('Initializing payment with data:', { amount, phone, method });
  const postData = JSON.stringify({
    "amount": String(amount),
    "currency": "XOF",
    "payment_method": "mobile_money",
    "payment_method_details": {
        "phone": String(phone),
        "provider": String(method)
    }
});
  const options = {
    method: 'POST',
    hostname: 'api.senfenico.com',
    path: '/v1/payment/charges/',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': 'sk_test_6w9pyIqwychYnCBJ2g9eIWBl2p3HqfrZxv_YDnNchcE',
      'Content-Length': Buffer.byteLength(postData)
    },
    maxRedirects: 20
  };

  
//   var postData = JSON.stringify({
//     amount,
//     currency: 'XOF',
//     payment_method: 'mobile_money',
//     payment_method_details: {
//       phone,
//       provider: method
//     }
//   });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

export async function verifyPayment(opt, referenceId) {
  const options = {
    method: 'POST',
    hostname: 'api.senfenico.com',
    path: '/v1/payment/charges/submit',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': 'sk_test_6w9pyIqwychYnCBJ2g9eIWBl2p3HqfrZxv_YDnNchcE'
    },
    maxRedirects: 20
  };

  const postData = JSON.stringify({
    otp: opt,
    charge_reference: referenceId
  });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

export async function getPaymentStatus(referenceId) {
  const options = {
    method: 'GET',
    hostname: 'api.senfenico.com',
    path: `/v1/payment/charges/${referenceId}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': 'sk_test_6w9pyIqwychYnCBJ2g9eIWBl2p3HqfrZxv_YDnNchcE'
    },
    maxRedirects: 20
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}
