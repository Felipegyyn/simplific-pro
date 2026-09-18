const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    const rootStyles = await page.evaluate(() => {
        const root = document.documentElement;
        return {
            aparelho_larg: getComputedStyle(root).getPropertyValue('--aparelho-larg'),
            aparelho_corpo: getComputedStyle(root).getPropertyValue('--aparelho-corpo'),
            aparelho_tela: getComputedStyle(root).getPropertyValue('--aparelho-tela')
        };
    });
    console.log('Root CSS Variables:', rootStyles);
    
    await browser.close();
})();
