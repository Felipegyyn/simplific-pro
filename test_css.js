const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent('<div id="test">Hello</div>');
    const result = await page.evaluate(() => {
        const div = document.getElementById('test');
        div.style.width = 'calc(min(calc(100vw * 0.88), 410px) * 1910 / 487)';
        return div.style.width;
    });
    console.log('Parsed width:', result);
    
    await browser.close();
})();
