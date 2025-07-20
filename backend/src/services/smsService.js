const twilio = require('twilio');
const AfricasTalking = require('africas-talking');
const logger = require('../utils/logger');

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Initialize Africa's Talking client
const africastalkingClient = process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME
  ? new AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME,
    })
  : null;

// Send SMS using Twilio
const sendSMSTwilio = async (to, message) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    logger.info(`SMS sent via Twilio to ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    logger.error('Error sending SMS via Twilio:', error);
    throw error;
  }
};

// Send SMS using Africa's Talking
const sendSMSAfricasTalking = async (to, message) => {
  try {
    if (!africastalkingClient) {
      throw new Error('Africa\'s Talking not configured');
    }

    const result = await africastalkingClient.SMS.send({
      to: to,
      message: message,
      from: process.env.AFRICASTALKING_SENDER_ID || 'LERNBASE',
    });

    logger.info(`SMS sent via Africa's Talking to ${to}: ${result.SMSMessageData.Recipients[0].messageId}`);
    return result;
  } catch (error) {
    logger.error('Error sending SMS via Africa\'s Talking:', error);
    throw error;
  }
};

// Send SMS (automatically choose provider)
const sendSMS = async (to, message) => {
  try {
    // Format phone number for Nigerian numbers
    let formattedNumber = to;
    if (to.startsWith('0')) {
      formattedNumber = `+234${to.substring(1)}`;
    } else if (to.startsWith('234')) {
      formattedNumber = `+${to}`;
    } else if (!to.startsWith('+234')) {
      formattedNumber = `+234${to}`;
    }

    // Try Africa's Talking first (better for Nigerian numbers)
    if (africastalkingClient) {
      try {
        return await sendSMSAfricasTalking(formattedNumber, message);
      } catch (error) {
        logger.warn('Africa\'s Talking failed, trying Twilio:', error.message);
      }
    }

    // Fallback to Twilio
    if (twilioClient) {
      return await sendSMSTwilio(formattedNumber, message);
    }

    throw new Error('No SMS provider configured');
  } catch (error) {
    logger.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};

// Send verification code via SMS
const sendVerificationSMS = async (phone, code, firstName = 'User') => {
  try {
    const message = `Hello ${firstName}! Your LernBase Nigeria verification code is: ${code}. Valid for 10 minutes. Do not share this code with anyone.`;
    return await sendSMS(phone, message);
  } catch (error) {
    logger.error('Error sending verification SMS:', error);
    throw new Error('Failed to send verification SMS');
  }
};

// Send welcome SMS
const sendWelcomeSMS = async (phone, firstName, role) => {
  try {
    const roleMessages = {
      student: 'Start your learning journey with our comprehensive educational content.',
      artisan: 'Showcase your skills and get certified to connect with employers.',
      employer: 'Find skilled artisans and professionals for your business needs.',
    };

    const message = `Welcome to LernBase Nigeria, ${firstName}! ${roleMessages[role]} Visit our platform to get started.`;
    return await sendSMS(phone, message);
  } catch (error) {
    logger.error('Error sending welcome SMS:', error);
    throw new Error('Failed to send welcome SMS');
  }
};

// Send job notification SMS
const sendJobNotificationSMS = async (phone, jobTitle, employerName, firstName = 'User') => {
  try {
    const message = `Hello ${firstName}! A new job matching your skills is available: ${jobTitle} at ${employerName}. Log in to LernBase Nigeria to apply.`;
    return await sendSMS(phone, message);
  } catch (error) {
    logger.error('Error sending job notification SMS:', error);
    throw new Error('Failed to send job notification SMS');
  }
};

// Send assessment reminder SMS
const sendAssessmentReminderSMS = async (phone, assessmentType, firstName = 'User') => {
  try {
    const message = `Hello ${firstName}! Don't forget to complete your ${assessmentType} assessment on LernBase Nigeria. Your progress is important to us!`;
    return await sendSMS(phone, message);
  } catch (error) {
    logger.error('Error sending assessment reminder SMS:', error);
    throw new Error('Failed to send assessment reminder SMS');
  }
};

// Send certification notification SMS
const sendCertificationNotificationSMS = async (phone, skillName, firstName = 'User') => {
  try {
    const message = `Congratulations ${firstName}! You have been certified in ${skillName}. Your certificate is now available on LernBase Nigeria.`;
    return await sendSMS(phone, message);
  } catch (error) {
    logger.error('Error sending certification notification SMS:', error);
    throw new Error('Failed to send certification notification SMS');
  }
};

// Send payment confirmation SMS
const sendPaymentConfirmationSMS = async (phone, amount, service, firstName = 'User') => {
  try {
    const message = `Hello ${firstName}! Your payment of ₦${amount} for ${service} has been confirmed. Thank you for using LernBase Nigeria!`;
    return await sendSMS(phone, message);
  } catch (error) {
    logger.error('Error sending payment confirmation SMS:', error);
    throw new Error('Failed to send payment confirmation SMS');
  }
};

// Send general notification SMS
const sendNotificationSMS = async (phone, message, firstName = 'User') => {
  try {
    const fullMessage = `Hello ${firstName}! ${message} - LernBase Nigeria`;
    return await sendSMS(phone, fullMessage);
  } catch (error) {
    logger.error('Error sending notification SMS:', error);
    throw new Error('Failed to send notification SMS');
  }
};

// Bulk SMS sending
const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    const results = [];
    const errors = [];

    for (const phone of phoneNumbers) {
      try {
        const result = await sendSMS(phone, message);
        results.push({ phone, success: true, result });
      } catch (error) {
        errors.push({ phone, success: false, error: error.message });
      }
    }

    logger.info(`Bulk SMS completed: ${results.length} successful, ${errors.length} failed`);
    
    return {
      successful: results,
      failed: errors,
      total: phoneNumbers.length,
    };
  } catch (error) {
    logger.error('Error sending bulk SMS:', error);
    throw new Error('Failed to send bulk SMS');
  }
};

// Check SMS balance (if supported by provider)
const checkSMSBalance = async () => {
  try {
    if (africastalkingClient) {
      // Africa's Talking balance check
      const balance = await africastalkingClient.APPLICATION.fetchApplication();
      return {
        provider: 'Africa\'s Talking',
        balance: balance.UserData.balance,
      };
    }

    if (twilioClient) {
      // Twilio balance check
      const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      return {
        provider: 'Twilio',
        balance: account.balance,
        currency: account.currency,
      };
    }

    throw new Error('No SMS provider configured');
  } catch (error) {
    logger.error('Error checking SMS balance:', error);
    throw new Error('Failed to check SMS balance');
  }
};

module.exports = {
  sendSMS,
  sendVerificationSMS,
  sendWelcomeSMS,
  sendJobNotificationSMS,
  sendAssessmentReminderSMS,
  sendCertificationNotificationSMS,
  sendPaymentConfirmationSMS,
  sendNotificationSMS,
  sendBulkSMS,
  checkSMSBalance,
}; 