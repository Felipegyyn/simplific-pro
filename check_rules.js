const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    const rules = await page.evaluate(() => {
        const bg = document.getElementById('global-celular-bg');
        if (!bg) return 'no bg';
        const matched = window.getMatchedCSSRules ? window.getMatchedCSSRules(bg) : 'no API';
        // In modern Chrome getMatchedCSSRules is removed, let's just look for stylesheets that match #global-celular-bg
        const result = [];
        for (let sheet of document.styleSheets) {
            try {
                for (let rule of sheet.cssRules) {
                    if (rule.selectorText && rule.selectorText.includes('#global-celular-bg')) {
                        result.push(rule.cssText);
                    } else if (rule.type === CSSRule.MEDIA_RULE) {
                        for (let mediaRule of rule.cssRules) {
                            if (mediaRule.selectorText && mediaRule.selectorText.includes('#global-celular-bg')) {
                                result.push(`@media ${rule.conditionText} { ${mediaRule.cssText} }`);
                            }
                        }
                    }
                }
            } catch(e) {}
        }
        return result;
    });
    console.log('Applied rules:', rules);
    
    await browser.close();
})();
