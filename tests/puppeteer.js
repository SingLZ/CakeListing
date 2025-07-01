const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");

let testUser = null;
let page = null;
let browser = null;

describe("jobs-ejs puppeteer test", function () {
  this.timeout(10000); 

  before(async function () {
    testUser = await seed_db();
      browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser
      slowMo: 50      // Slow down for visibility
    });
    page = await browser.newPage();
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  });

  after(async function () {
    if (browser) {
      await browser.close();
    }
  });

  describe("index page test", function () {
    it("finds the index page logon link", async function () {
      // const html = await page.content();
      // console.log("Page HTML:", html);

      await page.waitForSelector('#logon-register');
    });

    it("gets to the logon page", async function () {
      await page.waitForSelector('#logon', { visible: true });
      const logonButton = await page.$('#logon');
      if (!logonButton) {
        await page.screenshot({ path: "logon-link-missing.png" });
        throw new Error("Logon link not found on index page");
      }
      await logonButton.click();
      await page.waitForSelector('#logon-div', { visible: true });
      
      await page.waitForSelector('input#email', { visible: true });
      await page.waitForSelector('input#password', { visible: true });
    });
  });

  describe("logon page test", function () {
    it("resolves all the fields", async function () {
      await page.waitForSelector('input#email');
      await page.waitForSelector('input#password');
      await page.waitForSelector('button#logon-button');
    });

    it("sends the logon", async function () {
      testUser = await seed_db();
  

      await page.type('input#email', "sing@gmail.com");
      await page.type('input#password', "password");

     
  
    });
  });
});
