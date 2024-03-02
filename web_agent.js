const OpenAI = require("openai");
const Jarvis = require("./Jarvis");
const { input } = require("./util/util");

async function run() {
  const openai = new OpenAI();
  const agent = new Jarvis(openai);
  await agent.init(); // Initialize Puppeteer and open a new page
  let isAnswerFound = false;

  while (true) {
    const userInput = await input("You: ");

    await agent.storeMessageToMemory(userInput);

    while (!isAnswerFound) {
      const { thoughtProcess, nextAction } = await agent.startEvaluation();
      console.log("🤖 Jarvis: " + thoughtProcess);

      switch (nextAction.action) {
        case "visit-url":
          await agent.goToUrl(nextAction.url);
          await agent.labelPage();
          await agent.takeScreenShot();
          break;
        case "click":
          await agent.click(nextAction.element);
          break;
        case "type":
          await agent.type(nextAction.element, nextAction.text);
          break;
        case "request-info":
          break;
        case "remember-info":
          break;
        case "mark-task-complete":
          isAnswerFound = true;
          console.log("✅ Yippeee I finished this task");
          break;
        case "give-up":
          isAnswerFound = false;
          console.log("❌ Wah Wah. Had to give up.");
          break;
      }
    }
  }
}

run().catch(console.error);
