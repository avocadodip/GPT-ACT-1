const puppeteer   = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


const url = process.argv[2];
// const url = "https://www.google.com/search?sca_esv=32c94e6edcb8598c&sxsrf=ACQVn0_dQ_fOqGdd5WiRejp2FK7uobSzzg:1709094171400&q=dakgangjeong+recipe+i+like+chicken+korean+fried+chicken&uds=AMwkrPttffKhC3CUhYkXBNH71I3qy_fvz0tTe_cMnNLfVDD9gtDvHyIi85P-q7ecz3gq1hFGcCTg6jdUvGfP0Gagbqib8424seL7LNjptQMF5drs-QNlW1sEfYQr_3BAjyyd7qYV2vB42AbCRBXWFkW-Zsw2d_jq5yFzy5ehxE6S4PeotbnqNifBXTiwgJ2MQRIoxutikBw-zTFOhnY48ObJPMYLerjhiB9fWNaQTDYhMEpadAtCHbsMR2GlP0eGQAe71hpVAjGZ2FKKxyIo-Iw_UUxvC1AN_xlWwD9NJN7N2qLgIm_VP-R4dsnDmebn-ojTOZ7iy3-1l--YtsZUyvnFngg0P0h7D1vrRR0nO4E6Rb4mBw7cvLUmzf1iJ9-OzdOC3Zc3SUEN9Qy_IbWl94sdM1_SU4Cn4CbPGmMvd2_R2VUcRhNVS-hElbLUXsuILKcVL2_7XP_FIeBwZNngt8OViE3fKwS4dA&udm=2&sa=X&ved=2ahUKEwiAguX3l82EAxXP78kDHSLhCOUQxKsJegQIBxAB&ictx=0&biw=1429&bih=663&dpr=1.8";
const timeout = 5000; //adjust to liking

(async () => {

    // See README for Windows/Linux instructions
    const browser = await puppeteer.launch( {
        headless: "false",
        executablePath: '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary',
        userDataDir: '/Users/Chris/Library/Application\ Support/Google/Chrome\ Canary/Default',
    } );

    const page = await browser.newPage();


    await page.setViewport( {
        width: 1200,
        height: 1200,
        deviceScaleFactor: 1,
    } );
    await page.goto( url, {
        waitUntil: "domcontentloaded",
        timeout: timeout,
    } );



    await page.waitForTimeout(timeout);

    await page.screenshot({
        path: "snapshot.jpg",
        fullPage: true,
    });

    await browser.close();
})();