const puppeteer = require('puppeteer');

const monitorAttackStripe = async () => {
    try {
        const attackStripeExists = await page.$('#attack-stripe-bar');
        const attackButton = await page.$('#attack-stripe-bg');

        if (attackStripeExists && attackButton) {
            const attackBarTop = await page.evaluate(() => {
                const attackBar = document.getElementById('attack-stripe-bar');
                return parseFloat(window.getComputedStyle(attackBar).getPropertyValue('top'));
            });

            // Ensure the attack button is visible and interactable before clicking
            const isButtonVisible = await page.evaluate(() => {
                const button = document.querySelector('#attack-stripe-bg');
                return button && window.getComputedStyle(button).visibility !== 'hidden' && button.offsetHeight > 0 && button.offsetWidth > 0;
            });

            if (attackBarTop < 25 && isButtonVisible) {
                await attackButton.click();
                console.log(`Attack button clicked at attack bar top position: ${attackBarTop}px`);
            }
        }
    } catch (err) {
        console.log(`${err.message}`);
    }
};


const performDuel = async (page) => {
    for (let i = 0; i < 20; i++) {
        console.log(`Starting duel ${i + 1}/20`);
        try {
            // Navigate to the arena
            await page.goto('https://g2.gangsters.pl/?module=arena', { waitUntil: 'domcontentloaded' });

            // Click the city button if available
            const cityButton = await page.waitForSelector('input[type="image"][alt="Miasto"]', { timeout: 2000 }).catch(() => null);
            if (cityButton) {
                await cityButton.click();
                await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            }

            const interval = setInterval(async () => {
                await monitorAttackStripe();
            }, 10);

            // Stop monitoring after 3 seconds
            await new Promise(resolve => setTimeout(() => {
                clearInterval(interval);
                resolve();
            }, 3000));

            // Handle end duel buttons
            const endButton = await Promise.race([
                page.waitForSelector('input.buttonBigRed[value="Zakończ pojedynek"]', { timeout: 2000 }).catch(() => null),
                page.waitForSelector('input.buttonBigGreen[value="Zakończ pojedynek"]', { timeout: 2000 }).catch(() => null),
            ]);
            if (endButton) {
                await endButton.evaluate((btn) => btn.click());
                await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            }

            console.log(`Duel ${i + 1} completed.`);
        } catch (err) {
            console.error(`Error during duel ${i + 1}: ${err.message}`);
        }
    }
};


/**
 * Main execution function
 */
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
    });

    const page = await browser.newPage();

    try {
        // Login process
        await page.goto('https://g2.gangsters.pl/', { waitUntil: 'networkidle2' });
        await page.type('input[name="email"]', 'kotek1988@fejm.pl');
        await page.type('input[name="pass"]', 'ciapek12345!');
        await Promise.all([
            page.click('.buttonGreen'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);
        console.log('Login successful.');

        console.log('Starting duel process...');
        await performDuel(page);

        console.log('All tasks completed successfully.');
    } catch (err) {
        console.error(`Critical error: ${err.message}`);
    } finally {
        await browser.close();
    }
})();
