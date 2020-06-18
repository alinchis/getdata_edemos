
const { chromium: chrome } = require('playwright');  // Or 'chromium' or 'webkit'.
const { sleep, getChildFrameByName } = require('./utils.js');
const cheerio = require('cheerio');

(async () => {
    const browser = await chrome.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://edemos.insse.ro/portal/');
    await page.waitForNavigation("wcnav_defaultSelection");
    await page.click('text=Acces');

    await sleep(10);
    const childFrames = page.frames();

    let frameIndicatori;
    while (!frameIndicatori) {
        frameIndicatori = await getChildFrameByName(page.mainFrame(), 'pt1:portlet1::_iframe');
        if (frameIndicatori) {
            break;
        }
        sleep(1);
    }

    await frameIndicatori.waitForSelector('text=Tip indicatori');
    const [domenii] = await frameIndicatori.$$('.af_selectOneListbox_content', (el) => el);

    const htmlDomenii = await domenii.innerHTML();
    const $ = cheerio.load(`<ul>${htmlDomenii}</ul>`);

    const texteDomenii = [];
    $('li').each(function (el) {
        texteDomenii.push($(this).text());
    });

    for (const domeniu of texteDomenii) {
        await frameIndicatori.click(`text= ${domeniu}`);
        await frameIndicatori.click('text=Toţi');
        await sleep(2);

        const lista = (await frameIndicatori.$$('.af_selectOneListbox_content', (el) => el) || []).pop();
        const htmlLista = await lista.innerHTML()
        const $lista = cheerio.load(`<ul>${htmlLista}</ul>`);
        const texteLista = [];
        $lista('li').each(function () {
            texteLista.push($lista(this).text());
        });

        for (const numeIndicator of texteLista) {
            await frameIndicatori.click(`text= ${numeIndicator}`);
            await sleep(2);
        }
        console.log(`=======got indicatori`, htmlLista);
    }

    await browser.close();
})();

