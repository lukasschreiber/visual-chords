import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.songtive.com/en/chords/piano/Cmaj');
    const bodyHandle = await page.$('body');
    const majorLinks = await page.evaluate(async (body) => {
        return Array.from(body.querySelectorAll("[data-reactid='21'] a")).map(a => {
            return { name: a.innerText, href: a.href };
        });
    }, bodyHandle);

    for (let link of majorLinks) {
        await page.goto(link.href);
        const bodyHandle = await page.$('body');
        link.links = await page.evaluate(async (body) => {
            return Array.from(body.querySelectorAll("[data-reactid='44'] a")).map(a => {
                return { name: a.innerText, href: a.href };
            });
        }, bodyHandle);
    }

    let data = JSON.stringify(majorLinks.flatMap(link => link.links));
    fs.writeFileSync('links.json', data);


    await browser.close();
})();