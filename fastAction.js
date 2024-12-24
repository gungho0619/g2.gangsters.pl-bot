const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,  // Set headless to false for debugging
        defaultViewport: null, // This ensures the window opens in full-screen
        args: ['--start-maximized'] // Starts the browser maximized
    });
    const page = await browser.newPage();

    try {
        // Step 1: Navigate to login page and log in
        await page.goto('https://g2.gangsters.pl/', { waitUntil: 'networkidle2' });
        await page.type('input[name="email"]', 'kotek1988@fejm.pl');
        await page.type('input[name="pass"]', 'ciapek12345!');
        await page.click('.buttonGreen'); // Update selector if necessary
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log('Login successful.');

        // Function to handle the attack process
        const performAttack = async () => {
            await page.goto('https://g2.gangsters.pl/?module=sa', { waitUntil: 'networkidle2' });

            // Step 3: Click the "Napadnij" button
            await page.waitForSelector('input.buttonBigRed[value="Napadnij"]');
            await page.click('input.buttonBigRed[value="Napadnij"]');

            console.log('Napadnij button clicked.');

            // Step 4: Monitor and interact with the attack stripe
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
                    console.error(`Error monitoring attack stripe: ${err.message}`);
                }
            };

            // Continuously monitor the attack stripe for 3 seconds
            const interval = setInterval(async () => {
                await monitorAttackStripe();
            }, 10);

            // Stop monitoring after 3 seconds
            await new Promise(resolve => setTimeout(() => {
                clearInterval(interval);
                resolve();
            }, 3000));
        };

        // Repeat the attack process 20 times
        for (let i = 0; i < 20; i++) {
            console.log(`Starting attack iteration ${i + 1}`);
            await performAttack();
        }

        console.log('All attacks completed.');
        await browser.close();

    } catch (err) {
        console.error('Error:', err.message);
        await browser.close();
    }
})();
