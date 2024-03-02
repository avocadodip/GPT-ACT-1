
# GPT ACT-1

1. Run `npm i` to install dependencies (Puppeteer libraries, see `package.json` for details).

2. Copy `.env.template` and rename this new file `.env` . Then add your `OPENAI_API_KEY` and save the file. Run `source .env` properly mount this into the environment.

3. Make sure Chromium is installed. Then, go to `web_agent.js` and update the path to the one on your computer:
    `executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
    userDataDir:
      "/Users/Chris/Library/Application Support/Google/Chromium/Default",`

4. Run `node web_agent.js`

Cool stuffs:
- Windows OS UI controller (https://github.com/microsoft/UFO - Feb 24, 2024)
- Set of Mark (SOM) prompting technique (https://arxiv.org/abs/2310.11441 - Oct 17, 2023)

