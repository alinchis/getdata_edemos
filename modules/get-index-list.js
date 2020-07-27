// get indexes list

// import libraries
const {
    selectors,
    chromium: chrome,
    firefox
} = require('playwright'); // Or 'chromium' or 'webkit'.
const {
    sleep,
    getChildFrameByName
} = require('./utils.js');
const cheerio = require('cheerio');
const fs = require('fs-extra');

// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// load csv file
function readCSV(filePath, colDelimiter = ',', strDelimiter = '') {
    // if file is found in path
    if (fs.existsSync(filePath)) {
        // return parsed file
        const newArray = fs.readFileSync(filePath, 'utf8').split('\n');
        return newArray.filter(line => line).map(line => {
            if (strDelimiter !== '') {
                // if final column is missing, add empty value
                const newLine = line[line.length - 1] === colDelimiter ? `${line}""` : line;
                return newLine
                    .split(`${strDelimiter}${colDelimiter}${strDelimiter}`)
                    .map((item) => {
                        let newItem = item.replace(/\s+/g, ' ');
                        if (item[0] === strDelimiter) {
                            newItem = newItem.slice(1);
                        } else if (item[item.length - 1] === strDelimiter) {
                            newItem = newItem.slice(0, -1);
                        }
                        // return new item
                        return newItem;
                    })
            } else {
                return line.split(colDelimiter);
            }
        });
    }
    // else return empty object
    console.log('\x1b[31m%s\x1b[0m', `ERROR: ${filePath} file NOT found!`);
    return [];
}

// /////////////////////////////////////////////////////////////////////
// get home html
async function getHomePage(outPath) {

    const urlArray = [];

    // start browser
    const browser = await firefox.launch({
        headless: false
    });
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
        // console.log($(this).text());
    });

    // for each item in first column of choices
    for (let i = 0; i < texteDomenii.length; i += 1) {
        await frameIndicatori.click(`text= ${texteDomenii[i]}`);

        // for each item in second column
        const secondColArr = ['Indicatori primari', 'Indicatori de performanță'];
        for (let j = 0; j < secondColArr.length; j += 1) {
            await frameIndicatori.click(`text=${secondColArr[j]}`);
            await sleep(2);

            const lista = (await frameIndicatori.$$('.af_selectOneListbox_content', (el) => el) || []).pop();
            const htmlLista = await lista.innerHTML()
            const $lista = cheerio.load(`<ul>${htmlLista}</ul>`);
            const texteLista = [];

            // get third column items
            $lista('li').each(function () {
                texteLista.push($lista(this).text());
            });

            // select the first item in third column
            await frameIndicatori.click(`text= ${texteLista[0]}`);
            await sleep(3);

            // extract link to new window
            const pageFrame = await getChildFrameByName(page.mainFrame(), 'pt1:portlet1::_iframe');
            const button = await pageFrame.$('button');
            const buttonAttr = (await button.getAttribute('onclick'))
                .replace('var newWindow = window.open(\'', '')
                .replace('\',\'_blank\'); newWindow.focus(); return false;', '');

            // const innerHtml = await buttonProperty.jsonValue();
            console.log(`\t${i}:${j} URL: ${buttonAttr}\n`);
            const urlLine = [texteDomenii[i], secondColArr[j], texteLista[0], buttonAttr];
            fs.appendFileSync(outPath, `${urlLine.join('#')}\n`);
        }

    }

    await browser.close();
}


// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (indexesListFilePath) => {
    console.log(`\n************************************************************************`);
    console.log('@getIndexList: START...');

    // prepare write file, if necessary
    // prepare array to hold previous values
    let urlTable = [];

    // if write file does not exist
    if (!fs.existsSync(indexesListFilePath)) {
        console.log(`\t> file '${indexesListFilePath}' NOT FOUND, creating...`);
        // start write file
        const headerArr = ['domeniu', 'tip_indicator', 'indicator', 'url'];
        fs.writeFileSync(indexesListFilePath, `${headerArr.join('#')}\n`);

        // get data
        await getHomePage(indexesListFilePath);

        // else
    } else {
        console.log(`\t> file '${indexesListFilePath}' FOUND, skipping...`)
    }

    console.log('\n@getIndexList: END!\n');
}