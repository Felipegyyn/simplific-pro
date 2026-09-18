const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    try {
        await page.waitForSelector('#global-celular-bg', { timeout: 5000 });
        const bg = await page.$('#global-celular-bg');
        if (bg) {
            console.log('global-celular-bg IS FOUND!');
            const box = await bg.boundingBox();
            console.log('global-celular-bg bounding box:', box);
            
            const styles = await page.evaluate(el => {
                const s = window.getComputedStyle(el);
                return {
                    width: s.width,
                    height: s.height,
                    opacity: s.opacity,
                    top: s.top,
                    display: s.display
                };
            }, bg);
            console.log('Computed styles for global-celular-bg:', styles);
        }
    } catch (e) {
        console.log('global-celular-bg NOT FOUND within 5s');
    }
    
    const container = await page.$('.chat-simulation-container');
    if (container) {
        const box = await container.boundingBox();
        console.log('chat-simulation-container bounding box:', box);
        
        const scale = await page.evaluate(el => el.style.getPropertyValue('--conversa-escala'), container);
        console.log('--conversa-escala:', scale);
    }
    
    await browser.close();
})();
