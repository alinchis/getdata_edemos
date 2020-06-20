// get indexes list

// import libraries
const {chromium: chrome} = require('playwright');  // Or 'chromium' or 'webkit'.
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const qs = require('qs');

// create url paths
const homePath = 'http://edemos.insse.ro/xmlpserver/PODCA/Reports/Agricultur%C4%83%20-%20silvicultur%C4%83%20-%20mediu.xdo?_xpf=&_xpt=0&_xdo=%2FPODCA%2FReports%2FAgricultur%C4%83%20-%20silvicultur%C4%83%20-%20mediu.xdo&_xmode=2&xdo%3Axdo%3A_paramsP_AN_REF_div_input=&xdo%3Axdo%3A_paramsP_INDIC_TYPE_div_input=Definitiv&_paramsP_INDIC_TYPE=3&xdo%3Axdo%3A_paramsP_INDIC_div_input=AGR101B%20-%20Suprafa%C5%A3a%20fondului%20funciar%20dup%C4%83%20modul%20de%20folosin%C5%A3%C4%83%2C%20pe%20forme%20de%20proprietate&_paramsP_INDIC=1&xdo%3Axdo%3A_paramsP_DEZAGREGARE1_div_input=Mod%20de%20folosinta%20pentru%20suprafata%20agricola&_paramsP_DEZAGREGARE1=21&xdo%3Axdo%3A_paramsP_DEZAGREGARE2_div_input=Forme%20de%20proprietate&_paramsP_DEZAGREGARE2=2&xdo%3Axdo%3A_paramsP_CRITERIU1_div_input=&xdo%3Axdo%3A_paramsP_CRITERIU2_div_input=&xdo%3Axdo%3A_paramsP_MACROREG_div_input=All&_paramsP_MACROREG=*&_paramsP_NREG=Da&xdo%3Axdo%3A_paramsP_REG_div_input=All&_paramsP_REG=*&_paramsP_NJUD=Da&xdo%3Axdo%3A_paramsP_JUD_div_input=All&_paramsP_JUD=*&_paramsP_NMOC=Da&xdo%3Axdo%3A_paramsP_MOC_div_input=&_xt=Agricultur%C4%83%20-%20silvicultur%C4%83%20-%20mediu%20-%20cu%20grafice&_xf=analyze';

// url params
const urlParams = [
    {
        "key": "_xpf",
        "value": "1",
    },
    {
        "key": "_xpt",
        "value": "1",
    },
    {
        "key": "_xdo",
        "value": "/PODCA/Reports/Agricultură - silvicultură - mediu.xdo",
    },
    {
        "key": "_xmode",
        "value": "2",
    },
    {
        "key": "xdo:xdo:_paramsP_AN_REF_div_input",
        "value": "All",
    },
    {
        "key": "_paramsP_AN_REF",
        "value": "*",
    },
    {
        "key": "xdo:xdo:_paramsP_INDIC_div_input",
        "value": "AGR101B - Suprafaţa fondului funciar după modul de folosinţă, pe forme de proprietate",
    },
    {
        "key": "_paramsP_INDIC",
        "value": "1",
    },
    {
        "key": "xdo:xdo:_paramsP_DEZAGREGARE1_div_input",
        "value": "Mod de folosinta pentru suprafata agricola",
    },
    {
        "key": "_paramsP_DEZAGREGARE1",
        "value": "21",
    },
    {
        "key": "xdo:xdo:_paramsP_DEZAGREGARE2_div_input",
        "value": "Forme de proprietate",
    },
    {
        "key": "_paramsP_DEZAGREGARE2",
        "value": "2",
    },
    {
        "key": "xdo:xdo:_paramsP_CRITERIU1_div_input",
        "value": "All",
    },
    {
        "key": "_paramsP_CRITERIU1",
        "value": "*",
    },
    {
        "key": "xdo:xdo:_paramsP_CRITERIU2_div_input",
        "value": "All",
    },
    {
        "key": "_paramsP_CRITERIU2",
        "value": "*",
    },
    {
        "key": "xdo:xdo:_paramsP_MACROREG_div_input",
        "value": "All",
    },
    {
        "key": "_paramsP_MACROREG",
        "value": "*",
    },
    {
        "key": "xdo:xdo:_paramsP_NREG_div_input",
        "value": "Da",
    },
    {
        "key": "_paramsP_NREG",
        "value": "Da",
    },
    {
        "key": "xdo:xdo:_paramsP_REG_div_input",
        "value": "All",
    },
    {
        "key": "_paramsP_REG",
        "value": "*",
    },
    {
        "key": "xdo:xdo:_paramsP_NJUD_div_input",
        "value": "Da",
    },
    {
        "key": "_paramsP_NJUD",
        "value": "Da",
    },
    {
        "key": "xdo:xdo:_paramsP_JUD_div_input",
        "value": "ARAD",
    },
    {
        "key": "_paramsP_JUD",
        "value": "2",
    },
    {
        "key": "xdo:xdo:_paramsP_NMOC_div_input",
        "value": "Selectie detaliata localitati",
    },
    {
        "key": "_paramsP_NMOC",
        "value": "Da",
    },
    {
        "key": "xdo:xdo:_paramsP_MOC_div_input",
        "value": "MUNICIPIUL ARAD",
    },
    {
        "key": "_paramsP_MOC",
        "value": "9262",
    },
    {
        "key": "_xt",
        "value": "Agricultură - silvicultură - mediu - fără grafice",
    },
    {
        "key": "_xf",
        "value": "html",
    },
    {
        "key": "_xana",
        "value": "view",
    }
];


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sleep
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get counties list
function getCountiesList(pageUrl) {
    console.log(`\ngetCountiesList: START`);
    console.log(`\ngetCountiesList: pageUrl = ${pageUrl}\n`);

    (async () => {
        //#1 launch browser
        const browser = await chrome.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(pageUrl);
        // await page.waitForSelector("table.fieldText .parameters");
        // const mainFrame = page.frame('css=div #xdo:content');
        // await sleep(5);

        // select county
        await page.click('div#xdo\\:_paramsP_JUD_div');
        // const button = await page.selectOption('select#xdo\\:_paramsP_JUD', [['ALBA', '1']]);
        const testButtonA = await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
        // await testButtonA.click();
        const testButton0 = await page.check('input#xdo\\:xdo\\:_paramsP_JUD_div_cb_2');
        // await testButton0.click();
        // await sleep(2);
        // const testButton = await page.$('div#xdo\\:xdo\\:_paramsP_JUD_div_b');
        // await testButton.click();
        // await page.type('input#xdo\\:xdo\\:_paramsP_JUD_div_input', 'BACAU')
        // await testButton.type('ALBA');
        // const test = await testButton.innerHTML();
        // console.log(test);
        await page.click('div#xdo\\:_paramsP_JUD_div');
        await page.click('label[for=_paramsP_JUD]');

        // select detailed locality
        await page.click('div#xdo\\:_paramsP_NMOC_div');
        await page.selectOption('select#xdo\\:_paramsP_NMOC', 'Da');
        // const testButton0 = await page.check('input#xdo\\:xdo\\:_paramsP_JUD_div_cb_2');;
        await page.click('div#xdo\\:_paramsP_NMOC_div');

    })();

    // console.log(pageHtml);

    // // load page
    // const $ = cheerio.load(pageHtml);
    //
    // // get counties parent element
    // const counties = $('select').attr('id', 'xdo:_paramsP_JUD');
    // $(counties).children().each(county => {
    //     console.log($(county).text());
    // })
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get counties list
function getUatList(pageUrl) {

}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get child by frame name
async function getChildFrameByName(frame, name) {
    const frameName = await frame.name();

    if (frameName === name) {
        return frame;
    }
    for (const child of frame.childFrames()) {
        const resFrame = await getChildFrameByName(child, name);
        if (resFrame) return resFrame;
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// extract data from html
function extractDataB(tablePrefix, tableName, permutation, permutationsTotal, resData) {
    console.log('\x1b[34m%s\x1b[0m', `\nPROGRESS: Extract Data from HTML, table type B`);
    console.log('\x1b[33m%s\x1b[0m', `${tablePrefix}.${tableName} :: permutation ${permutation[0]}/${permutationsTotal}`);
    const returnArray = [];
    // remove unnecessary '\n' characters
    const htmlTable = resData.resultTable.replace(/\\n/g, '');
    // console.log(htmlTable);

    // process html table
    const $ = cheerio.load(htmlTable);
    // select all 'tr' elements
    const trArray = $('tr');
    console.log('\x1b[33m%s\x1b[0m', `${tablePrefix}.${tableName} :: ${permutation[0]}/${permutationsTotal} >>> trArray.length = ${trArray.length - 4}\n`);

    // filter out the first 3 rows
    // 0: tableTitle, 1: keys array (w UM), 2: timesArray
    // last row is footer
    $(trArray).slice(3, trArray.length - 1)
        .each((i, row) => {
            // console.log($(row).text());
            // console.log('bucla 1');
            const rowArray = [];
            $(row).children().each((j, cell) => {
                // console.log('bucla 2');
                // console.log($(cell).text());
                rowArray.push($(cell).text().trim());
            });
            // add current row to return array
            returnArray.push(`${rowArray.join(csvDelimiter)}`);
        });

    // console.log(returnArray);
    // check return array if it has expected number of rows
    const arrayLength = returnArray.length;
    const expectedLength = permutation[1];
    console.log(`@extractDataB :: return array length = ${arrayLength} / expected = ${expectedLength}`);
    // retrun array for current permutation
    return returnArray;
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get indexes params for table url request
function getIndexesParams(indexesArr) {
    // prepare return array
    const outArr = {};

    // for each url get list of indexes with parameters
    const indexesParams = [];

    for (let i = 0; i < indexesArr.length; i += 1) {
        (async () => {
            //#1 launch browser
            const browser = await chrome.launch({headless: false});
            const page = await browser.newPage();
            await page.goto(homePath);
            // await page.waitForNavigation("wcnav_defaultSelection");
            // await page.click('text=Acces');
            // await sleep(10);

            // select left panel
            const button = await page.$('text=div xdo:_paramsP_JUD_div');
            await button.selectOption('1');

            // await sleep(10);
            // // const childFrames = page.frames();
            //
            // let frameIndicatori;
            // while (!frameIndicatori) {
            //     frameIndicatori = await getChildFrameByName(page.mainFrame(), 'pt1:portlet1::_iframe');
            //     if (frameIndicatori) {
            //         break;
            //     }
            //     sleep(1);
            // }
            //
            // await frameIndicatori.waitForSelector('text=Tip indicatori');

            // // console.log('111111111111', frameIndicatori);
            // const selectBoxes = await frameIndicatori.$$('.af_selectOneListbox_content', (el) => el);
            // for (const sb of selectBoxes){
            //     const html = await sb.innerHTML();
            //     console.log(`==============`, html);
            // }

            // select first item
            // await frameIndicatori.click('text=Agricultură, silvicultură, mediu');
            // await page.click('');
            // const testItem = await page.$('li');
            // await testItem.click();
            // await page.click('li.af_selectOneListbox_item');
            // await sleep(10);


            //#1 close browser
            // await browser.close();

        })();
    }
}


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (today, inFilePath) => {
    console.log(`inFilePath: ${inFilePath}`);

    // input file is present
    if (fs.existsSync(inFilePath)) {
        // read file into array
        const indexesArr = readCSV(inFilePath, '#').slice(1);
        console.log(`inFilePath: CSV import >>> ${indexesArr.length} items!`);

        // get counties list
        const countiesList = getCountiesList(indexesArr[0][3]);

        // for each county, get uat list
        // const uatList = getUatList(indexesArr[0][3]);

        // get index parameters
        // const indexesParams = getIndexesParams(indexesArr);

        // else
    } else {
        console.log(`ERROR: Missing input file >>> ${inFilePath}`);
    };
}
