const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the login page
        await page.goto('https://g2.gangsters.pl/', {
            waitUntil: 'networkidle2'
        });

        // Fill out the login form
        await page.type('input[name="email"]', 'piotrserewis@wp.pl');
        await page.type('input[name="pass"]', 'serek123');

        // Click the login button
        await page.click('.buttonGreen'); // Update selector if necessary

        // Wait for navigation after login
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log('Login successful!');

        // Navigate to the protected page
        await page.goto('https://g2.gangsters.pl/?module=sa', {
            waitUntil: 'networkidle2'
        });

        // Scrape data from the protected page
        const pageContent = await page.content();
        console.log('Protected Page Content:', pageContent);

        // Example: Extract specific elements
        const data = await page.evaluate(() => {
            // Adjust selectors to scrape desired content
            const elements = [...document.querySelectorAll('.desired-class')];
            return elements.map(el => el.textContent.trim());
        });

        console.log('Extracted Data:', data);

        await browser.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
})();
