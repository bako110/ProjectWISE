const TransactionService = require('../services/transaction.js');
const SubscriptionService = require('../services/subscription.js');
const { notificationService } = require('../services/notification.service.js');
const { addBalanceService, getWalletByUserIdService, createWalletService} = require('../services/wallet.js');
const {getPricingById} = require('../services/pricingAgency.js');
const { payOrangeMoney } = require('../services/apiOM.js');
const {sendMoovOpt, reSendMoovOpt, payMoov } = require('../services/apiMoov.js');
const logger = require('../utils/logger.js');

class TransactionController {
  /**
   * INITIATE
   */
  static async initiate(req, res) {
    try {
      const { amount, customerMsisdn, operator, pricingId, userId, numberMonths } = req.body;

       // ✅ 1. Validation basique
      if (!['ORANGE_MONEY', 'MOOV_MONEY'].includes(operator)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Opérateur non supporté. Utilisez ORANGE_MONEY ou MOOV_MONEY' 
        });
      }

      if (!amount || !customerMsisdn || !pricingId || !numberMonths) {
        return res.status(400).json({ 
          success: false, 
          message: 'Paramètres manquants amount, customerMsisdn, pricingId, walletId, numberMonths)' 
        });
      }

      // ✅ 2. Validation opérateur/numéro
      try {
        await TransactionService.verifyOperatorMsisdn(operator, customerMsisdn);
      } catch (validationError) {
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }

      // ✅ 3. Vérifier que le pricing existe
      const pricing = await getPricingById(pricingId);
      if (!pricing) {
        return res.status(404).json({ 
          success: false, 
          message: 'Plan tarifaire introuvable' 
        });
      }

      const wallet = await getWalletByUserIdService(pricing.agencyId);
      if (!wallet) {
        await createWalletService(pricing.agencyId);
      }

      // ✅ 4. Vérifier que le montant correspond
      const expectedAmount = pricing.price * numberMonths;
      if (parseFloat(amount) !== expectedAmount) {
        return res.status(400).json({ 
          success: false, 
          message: `Montant incorrect. Attendu: ${expectedAmount} FCFA (${pricing.price} x ${numberMonths} mois)` 
        });
      }
      const reference = `TXN-${Date.now()}`;

      logger.info(`Initiating transaction ${reference} for ${customerMsisdn} amount ${amount} via ${operator}`);
      
      const tx = await TransactionService.createTransaction({
        reference,
        amount,
        customerMsisdn,
        userId,
        pricingId,
        operator,
        walletId: wallet._id,
        numberMonths
      });

      logger.info(`Transaction created: ${JSON.stringify(tx)}`);

      let message = '';

      if (operator === 'MOOV_MONEY') {
        const moovResponse = await sendMoovOpt(tx.id, customerMsisdn, amount);

        if (moovResponse.status === '0') {

          await TransactionService.updateTransaction(tx._id, {
            status: 'OTP_PENDING',
            transactionId: moovResponse['trans-id']
          });
          message = `Vous allez recevoir un OTP pour valider le paiement de ${amount} FCFA`;

        } else {

          await TransactionService.failTransaction(tx._id, moovResponse.status, moovResponse.message);
          throw new Error(moovResponse.message || 'Erreur initiation Moov Money');

        }
      } else if (operator === 'ORANGE_MONEY') {

        await TransactionService.updateTransaction(tx._id, {
          status: 'OTP_PENDING'
        });
        message = `Composez *144*4*6*${amount}# pour générer le code de paiement`;

      }
      
      await TransactionService.markOtpPending(tx._id);
      
      res.status(201).json({
        success: true,
        message,
        data : tx,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async resendOtp(req, res) {
    try {
      const { reference } = req.body;

      const tx = await TransactionService.getByReference(reference);

      if (!tx || tx.status !== 'OTP_PENDING') {
        return res.status(400).json({ 
          success: false,
          message: 'Transaction invalide' 
        });
      }

      if (tx.operateur === 'MOOV_MONEY') {
        const moovResponse = await reSendMoovOpt(reference, tx.id, tx.customerMsisdn, tx.amount);

        logger.info(`Moov Resend OTP Response for TXN ${reference}: ${JSON.stringify(moovResponse)}`);
      } 
      res.json({ 
        success: true, 
        message: 'OTP renvoyé avec succès' 
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
      let om;
      if (tx.operator === 'MOOV_MONEY') {
        om = await payMoov(tx.reference, tx.transactionId, tx.id, tx.customerMsisdn, tx.amount, otp);
      } else if (tx.operator === 'ORANGE_MONEY') {
        om = await payOrangeMoney({
          customerMsisdn: tx.customerMsisdn,
          amount: tx.amount,
          otp,
          reference,
        });
      }
      
      logger.info(`OM Response for TXN ${reference}: ${JSON.stringify(om)}`);

      if (om.code === '200' || om.status === '0') {
        await TransactionService.completeTransaction(tx._id, om);
        logger.info(`Transaction ${tx._id} marked as COMPLETED`);
        // 👉 ACTIVER ABONNEMENT ICI
        // return res.json({ 
        //   success: true, 
        //   message: 'Paiement réussi',
        //   transactionId: om.orangeTransactionId
        // });

         // ✅ 2. Créer l'abonnement automatiquement
        try {

          // const subscription = await SubscriptionService.createSubscriptionAfterPayment({
          //   transactionId: tx._id
          // });

          const { subscription, agencyId, amount, clientId } = 
            await SubscriptionService.createSubscriptionAfterPayment({
              transactionId: tx._id
            });

          logger.info(`✅ Subscription ${subscription._id} créé pour le client ${clientId}`);

          // ✅ C. Créditer le wallet de l'agence
          const agencyWallet = await addBalanceService(agencyId, amount);
          logger.info(`💰 Wallet agence ${agencyId} crédité de ${amount} FCFA. Nouveau solde: ${agencyWallet.balance}`);

          // ✅ 3. Notifications
          await notificationService.createNotification({
            user: tx.userId,
            message: `Abonnement activé pour ${tx.numberMonths} mois`,
            type: 'Subscribed'
          });

          await notificationService.createNotification({
            user: subscription.agencyId,
            message: `Nouveau client abonné pour ${tx.numberMonths} mois`,
            type: 'Subscribed'
          });

          // return res.json({ 
          //   success: true, 
          //   message: 'Paiement réussi et abonnement activé',
          //   subscription: subscription._id,
          //   transactionId: om['trans-id']
          // });

          return res.json({ 
            success: true, 
            message: 'Paiement réussi, abonnement activé et wallet crédité',
            data : {
              reference: tx.reference,
              subscription: subscription._id,
            }
            // data: {
            //   subscription: {
            //     id: subscription._id,
            //     startDate: subscription.startDate,
            //     endDate: subscription.endDate,
            //     numberMonths: subscription.numberMonths
            //   },
            //   transaction: {
            //     id: tx._id,
            //     reference: tx.reference,
            //     amount: tx.amount,
            //     operatorTransactionId: om.orangeTransactionId || om['trans-id'],
            //     status: tx.status || 'COMPLETED',
            //     tx
            //   },
            //   wallet: {
            //     agencyId,
            //     newBalance: agencyWallet.balance
            //   }
            // }
          });

        } catch (subError) {
          logger.error('Erreur création subscription:', subError);
          // Transaction OK mais subscription KO → à gérer manuellement

          await TransactionService.updateTransaction(tx._id, {
            status: 'COMPLETED_WITH_ERROR',
            errorDetails: subError.message
          });

          return res.status(207).json({ // 207 Multi-Status
            success: true,
            warning: true,
            message: 'Paiement validé mais erreur lors de l\'activation',
            details: 'Veuillez contacter le support avec votre référence',
            reference: tx.reference,
            error: subError.message
          });
        }
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