// controllers/qrValidationController.js
const QRValidationService = require('../services/qrValidation');
const logger = require('../utils/logger');

class QRValidationController {

  /**
   * Scanner et valider un QR Code
   * @route POST /qr/validate
   * @body { qrData: string }
   */
  static async validate(req, res) {
    try {
      const { qrData } = req.body;
      if (!qrData) return res.status(400).json({ message: 'QR Data is required' });

      const result = await QRValidationService.validateSubscription(qrData);

      return res.status(200).json(result);
    } catch (error) {
      if (['Subscription not found', 'Subscription is not active', 'User not found'].includes(error.message)) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = QRValidationController;
