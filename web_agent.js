const fs = require("fs");
const readline = require("readline");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const OpenAI = require("openai");
const { sendSms } = require("./util/smsUtils");
const { systemMessage } = require("./util/systemMessage");
const {
  image_to_base64,
  waitForEvent,
  labelPage,
  sleep,
} = require("./util/agentUtils");

puppeteer.use(StealthPlugin());
const openai = new OpenAI();
const TIMEOUT = 6000;
let page;
let messages = [
  {
    role: "system",
    content: systemMessage,
  },
];

// For running in terminal
async function input(text) {
  let the_prompt;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await (async () => {
    return new Promise((resolve) => {
      rl.question(text, (prompt) => {
        the_prompt = prompt;
        rl.close();
        resolve();
      });
    });
  })();

  return the_prompt;
}

runTerminalPrompt();

async function runTerminalPrompt() {
  const prompt = await input("You: ");
  await respondToUser(prompt);
}

async function respondToUser(incomingMessage, userNumber) {
  // Launch pppeteer browser
  const browser = await puppeteer.launch({
    headless: "false",
    executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
    userDataDir:
      "/Users/Chris/Library/Application Support/Google/Chromium/Default",
  });

  page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800,
    deviceScaleFactor: 1,
  });

  // Generate response and send message
  await handleUserQuery(incomingMessage, userNumber);
}

async function handleUserQuery(incomingMessage, userNumber) {
  let isAnswerFound = false;
  let snapshot_taken = false;
  let attemptCount = 0;
  const maxAttempts = 3;
  let url;
  let labelData;

  while (!isAnswerFound && attemptCount < maxAttempts) {
    attemptCount++;
    messages.push({
      role: "user",
      content: incomingMessage,
    });

    // Goes to url page, labels the page elements, and takes a screenshot
    if (url) {
      console.log("Crawling 🐜  " + url);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUT,
      });

      await Promise.race([waitForEvent(page, "load"), sleep(TIMEOUT)]);

      labelData = await labelPage(page);

      await page.screenshot({
        path: "snapshot.jpg",
        fullPage: true,
      });

      snapshot_taken = true;
      url = null;
    }

    // Pass screenshot to messages array
    if (snapshot_taken) {
      const base64_image = await image_to_base64("snapshot.jpg");

      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: base64_image,
          },
          {
            type: "text",
            text: "Snapshot of website you are on right now.",
          },
        ],
      });

      snapshot_taken = false;
    }

    // Get GPT's response
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 1024,
      messages: messages,
    });
    const responseObj = response.choices[0].message.content;

    messages.push({
      role: "assistant",
      content: responseObj,
    });

    // Format GPT's response
    const data = JSON.parse(responseObj);
    const nextAction = data.nextAction;
    const briefExplanation = data.briefExplanation;

    // For click and type actions
    let targetElement, x, y;
    if (nextAction.hasOwnProperty("element")) {
      targetElement = labelData[nextAction.element];
      x = targetElement.x;
      y = targetElement.y;
    }

    console.log("GPT: " + JSON.stringify(data, null, 2));

    // Handle each action type
    switch (nextAction.action) {
      case "visit-url":
        url = nextAction.url;
        break;
      case "mark-task-complete":
        console.log("Task is completed! " + briefExplanation);
        isAnswerFound = true;
        runTerminalPrompt();
        // await sendSms(briefExplanation, userNumber);
        break;
      case "click":
        // go to joshuawolk.com and tell me about meds ai
        if (targetElement) {
          try {
            console.log(
              `⏳ Clicking on element ${JSON.stringify(targetElement)}`
            );
            await page.mouse.click(x, y);

            // Additional checks can be done here, like validating the response or URL
            await Promise.race([waitForEvent(page, "load"), sleep(TIMEOUT)]);

            labelData = await labelPage(page);

            await page.screenshot({
              path: "snapshot.jpg",
              quality: 100,
              fullpage: true,
            });

            snapshot_taken = true;
          } catch (error) {
            console.log("❌ Unable to click: ", error);

            messages.push({
              role: "user",
              content: "❌ Unable to access element: ",
            });
          }
          break;
        } else {
          console.log("target element not found");
        }
      case "type":
        if (targetElement) {
          // 1. Click into text input
          try {
            console.log(
              `🖱️ Clicking on element ${JSON.stringify(targetElement)}`
            );
            await page.mouse.click(x, y);
          } catch {
            console.log("❌ Unable to click text input: ", error);

            messages.push({
              role: "user",
              content: "❌ Unable to click text input: ",
            });
            break;
          }

          // 2. Type
          try {
            console.log(
              `💻 Typing ${nextAction.text}...`
            );
            await page.keyboard.type(nextAction.text);
          } catch (error) {
            console.log("❌ Unable to type into text input: ", error);

            messages.push({
              role: "user",
              content: "❌ Unable to type into text input: ",
            });
          }
        }

        break;
      case "scroll":
        break;
      case "request-info":
        break;
      case "remember-info":
        break;
    }
  }

  runTerminalPrompt();
}

module.exports = { respondToUser };
