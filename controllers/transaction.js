const TransactionService = require('../services/transaction.js');
const { payOrangeMoney } = require('../services/apiOM.js');

class TransactionController {
  /**
   * INITIATE
   */
  static async initiate(req, res) {
    try {
      const { amount, customerMsisdn, tarifId, walletId, userId } = req.body;
      const reference = `TXN-${Date.now()}`;
      
      const tx = await TransactionService.createTransaction({
        reference,
        amount,
        customerMsisdn,
        userId,
        tarifId,
        walletId,
      });
      
      await TransactionService.markOtpPending(tx._id);
      
      res.status(201).json({
        success: true,
        message: `Composez *144*4*6*${amount}# pour générer le code de paiement`,
        reference,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  /**
   * CONFIRM OTP
   */
  static async confirm(req, res) {
    try {
      const { reference, otp } = req.body;
      
      const tx = await TransactionService.getByReference(reference);
      
      if (!tx || tx.status !== 'OTP_PENDING') {
        return res.status(400).json({ 
          success: false,
          message: 'Transaction invalide' 
        });
      }
      
      const om = await payOrangeMoney({
        customerMsisdn: tx.customerMsisdn,
        amount: tx.amount,
        otp,
        reference,
      });
      
      if (om.code === '200') {
        await TransactionService.completeTransaction(tx._id, om);
        // 👉 ACTIVER ABONNEMENT ICI
        return res.json({ 
          success: true, 
          message: 'Paiement réussi',
          transactionId: om.orangeTransactionId
        });
      }
      
      await TransactionService.failTransaction(tx._id, om.code, om.message);
      
      res.status(400).json({ 
        success: false, 
        message: om.message 
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ 
        success: false, 
        error: e.message 
      });
    }
  }
}

module.exports = TransactionController;