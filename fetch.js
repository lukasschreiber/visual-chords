import puppeteer from "puppeteer";
import fs from "fs";
import links from "./links.json" assert { type: 'json' };

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    });

    const chords = {};

    let i = 0;
    for (let link of links) {
        i++;
        await page.goto(link.href);
        const bodyHandle = await page.$('body');
        const chord = await page.evaluate(async (body) => {
            const inversions = Array.from(document.querySelectorAll(".panel-default:not(#feedback-form)")).map(div => {
                let names = div.querySelector(".text").innerText.split(", ");
                let notes = div.querySelector(".notes").innerText.replace("Notes: ", "").split(", ");
                return {
                    name: names[0],
                    alternate: names.slice(1),
                    notes
                };
            });

            return {
                ...inversions[0],
                inversions: inversions.slice(1).map((inversion, index) => {
                    return {
                        notes: inversion.notes,
                        inversion: index + 1
                    };
                })
            };
        }, bodyHandle);

        console.log(`fetched ${chord.name} | (${i} of ${links.length})`)
        chords[chord.name] = chord;
    }


    // replace all B with H
    let data = JSON.stringify(chords);
    fs.writeFileSync('chords.json', data);
    console.log("Please continue to merge the duplicate chords with 'npm run merge'!")

    await browser.close();
})();