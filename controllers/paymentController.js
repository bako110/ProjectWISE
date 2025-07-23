import Payment from '../models/Payment.js';
import {initializePayment, verifyPayment,getPaymentStatus} from '../utils/paymentMethod.js';
import Tarif from '../models/Tarif.js';

export const createPayment = async (req, res) => {
  const { amount, phone, method, clientId, tarifId} = req.body;

  if (!amount || !phone || !method) {
    return res.status(400).json({ message: 'Les champs obligatoires sont : amount, phone, method.' });
  }

  try {
    console.log('Creating payment with data:', { amount, phone, method, clientId, tarifId });
    const paymentData = await initializePayment(amount, phone, method);

    if (!paymentData.status) {
      return res.status(400).json({
        message: 'Erreur lors de la création du paiement',
        apiResponse: paymentData
      });
    }
    const payment = new Payment({
      status: 'pending',
      clientId,
      tarifId,
      response: paymentData
    });

    await payment.save();
    res.status(201).json({ message: 'Payment created successfully', payment, paymentData });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}


export const verifyPayments = async (req, res) => {
  const { referenceId, opt } = req.body;

  if (!referenceId || !opt) {
    return res.status(400).json({ message: 'Reference ID is required' });
  }

  try {
    const paymentData = await verifyPayment(opt, referenceId);
    const log = null
    if (!paymentData) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    let payment;

    if (paymentData.status) {
      log = await getPaymentStatus(referenceId);
       payment = await Payment.findOneAndUpdate(
        { _id: referenceId },
        { status: 'completed', response: log },
        { new: true }
        );
    }else {
        payment = await Payment.findOneAndUpdate(
            { _id: referenceId },
            { status: 'completed', response: log },
            { new: true }
            );
    }

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment verified successfully', payment, paymentData, log });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    if (payments.length === 0) {
      return res.status(404).json({ message: 'No payments found' });
    }
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}