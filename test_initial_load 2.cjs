const assert = require('node:assert/strict');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
    await page.waitForFunction(
      () => document.body.innerText.includes('Select Your Target Certification'),
      { timeout: 5000 }
    );

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.match(bodyText, /Select Your Target Certification/);
    assert.doesNotMatch(bodyText, /Loading Practice Exam Platform/);
  } finally {
    await browser.close();
  }
})();
