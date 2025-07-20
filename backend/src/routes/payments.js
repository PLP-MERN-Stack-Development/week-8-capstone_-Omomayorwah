const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');
const Payment = require('../models/Payment'); // Adjust path if needed
const axios = require('axios');

const router = express.Router();

// @route   POST /api/payments/initiate
// @desc    Initiate a payment (Paystack/Flutterwave)
// @access  Private
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod, subscriptionType } = req.body;
    if (!amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Amount and payment method are required' });
    }
    // Mock payment initiation
    const paymentRef = `PAY-${Date.now()}`;
    logger.info(`Payment initiated by user ${req.user._id}: ${paymentRef}`);
    res.json({
      success: true,
      message: 'Payment initiated',
      data: {
        paymentRef,
        paymentUrl: `https://paystack.com/pay/${paymentRef}`,
        amount,
        paymentMethod,
        subscriptionType,
      },
    });
  } catch (error) {
    logger.error('Error initiating payment:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment (Paystack/Flutterwave callback)
// @access  Public (webhook)
router.post('/verify', async (req, res) => {
  try {
    const { paymentRef, status } = req.body;
    // Mock verification
    logger.info(`Payment verified: ${paymentRef}, status: ${status}`);
    res.json({ success: true, message: 'Payment verified', data: { paymentRef, status } });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// @route   GET /api/payments/history
// @desc    Get user payment history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // Mock payment history
    const history = [
      {
        id: 'pay-1',
        userId: req.user._id,
        amount: 5000,
        method: 'paystack',
        status: 'success',
        date: new Date('2024-01-10'),
        description: 'Monthly subscription',
      },
      {
        id: 'pay-2',
        userId: req.user._id,
        amount: 15000,
        method: 'flutterwave',
        status: 'success',
        date: new Date('2024-02-10'),
        description: 'Annual subscription',
      },
    ];
    res.json({ success: true, data: { history } });
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
});

// @route   GET /api/payments/subscription
// @desc    Get user subscription status
// @access  Private
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    // Mock subscription status
    const subscription = {
      userId: req.user._id,
      type: 'monthly',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
});

// @route   POST /api/payments/invoice
// @desc    Generate invoice for a payment
// @access  Private
router.post('/invoice', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }
    // Mock invoice generation
    const invoiceUrl = `https://example.com/invoices/${paymentId}.pdf`;
    logger.info(`Invoice generated for payment ${paymentId}`);
    res.json({ success: true, data: { invoiceUrl } });
  } catch (error) {
    logger.error('Error generating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
});

// @route   PUT /api/payments/:id/status
// @desc    Update payment status (admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['completed', 'pending', 'failed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing status',
      });
    }
    const payment = await Payment.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }
    // n8n payment automation
    if (status === 'completed' && process.env.N8N_PAYMENT_WEBHOOK_URL) {
      axios.post(process.env.N8N_PAYMENT_WEBHOOK_URL, {
        paymentId: payment._id,
        userId: payment.userId,
        amount: payment.amount,
        status: payment.status,
      }).catch(err => {
        logger.error('Failed to trigger n8n payment workflow:', err.message);
      });
    }
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { payment },
    });
  } catch (error) {
    logger.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
    });
  }
});

module.exports = router; 