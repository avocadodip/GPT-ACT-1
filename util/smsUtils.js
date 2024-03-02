require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

async function sendSms(outgoingMessage, toUserNumber) {
  try {
    await client.messages.create({
      body: outgoingMessage,
      to: toUserNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    console.log(`Message sent to ${toUserNumber}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${toUserNumber}: ${error}`);
  }
}

module.exports = { sendSms };
