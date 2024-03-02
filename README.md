Based off 
https://github.com/vdutts7/gpt4V-scraper
https://github.com/ddupont808/GPT-4V-Act

Uses Set of Mark prompting (SOM)

1. Run `npm i` to install dependencies (Puppetteer libraries, see package.json for details).
2. Copy .env.template and rename this new file .env . Then add your OPENAI_API_KEYand save the file. Run source .env properly mount this into the environment.
3. Install Chromium 
Go to 
    `executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
    userDataDir:
      "/Users/Chris/Library/Application Support/Google/Chromium/Default",`