const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  // Load the page
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' }).catch(e => console.log(e));
  
  // Set localStorage with a populated attempt
  await page.evaluate(() => {
    localStorage.setItem('selected_aws_cert', 'mle_associate');
    const fakeAttempt = {
      id: new Date().toISOString(),
      certId: 'mle_associate',
      testId: 'test_1',
      testTitle: 'Fake Test',
      date: 'Jun 17, 2026',
      mode: 'practice',
      score: 80,
      correctCount: 8,
      totalCount: 10,
      answers: {},
      timeTaken: 120,
      completed: true,
    };
    localStorage.setItem('aws_exam_prep_attempts', JSON.stringify([fakeAttempt]));
  });
  
  // Reload the page
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' }).catch(e => console.log(e));
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Click History
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const historyBtn = buttons.find(b => b.textContent.includes('History'));
    if (historyBtn) historyBtn.click();
  });

  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY HTML LENGTH WITH ATTEMPT:', html.length);
  
  await browser.close();
})();
