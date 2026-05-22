const router = require('express').Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');

router.post('/create-payment-intent', createPaymentIntent);
router.post('/webhook', handleWebhook);

module.exports = router;