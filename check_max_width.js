const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    const result = await page.evaluate(() => {
        const bg = document.getElementById('global-celular-bg');
        if (!bg) return 'no bg';
        const s = window.getComputedStyle(bg);
        return {
            width: s.width,
            maxWidth: s.maxWidth,
            minWidth: s.minWidth
        };
    });
    console.log('Computed styles:', result);
    
    await browser.close();
})();
