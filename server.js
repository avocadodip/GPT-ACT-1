// 1. NGROK_AUTHTOKEN=2d1EuaMS082aJ6kTiFpLegFB1iG_3ukh1GGVtDR7to19kZVFx node server.js
// 2. update Twilio webhook url with new ingress url  + /sms
// lsof -i :5001    kill -9 <PID>
const express = require("express");
const ngrok = require("@ngrok/ngrok");
const { MessagingResponse } = require("twilio").twiml;
const { respondToUser } = require("./web_agent");

const app = express();
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies

// Webhook endpoint. Runs when a user sends us a message
app.post("/sms", async (req, res) => {
  const incomingMessage = req.body.Body;
  const userNumber = req.body.From;

  try {
    // Responds to message
    await respondToUser(incomingMessage, userNumber);
    res.status(200).send("Command received");
  } catch (error) {
    console.error("Failed to process command:", error);

    // Send message notifying user of failure

    // const twiml = new MessagingResponse();
    // twiml.message("Failed to process your command.");
    // res.type("text/xml").send(twiml.toString());
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  ngrok
    .connect({ addr: port, authtoken_from_env: true })
    .then((listener) =>
      console.log(`Ingress established at: ${listener.url()}`)
    );
});
