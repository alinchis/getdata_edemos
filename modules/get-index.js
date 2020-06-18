// get indexes list

// import libraries
const {chromium: chrome} = require('playwright');  // Or 'chromium' or 'webkit'.
const cheerio = require('cheerio');
const fs = require('fs-extra');

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

// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
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
};

// /////////////////////////////////////////////////////////////////////
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

// /////////////////////////////////////////////////////////////////////
// get home html
function getHomePage() {
    (async () => {
        //#1 launch browser
        const browser = await chrome.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(homePath);
        // await page.waitForNavigation("wcnav_defaultSelection");
        // await page.click('text=Acces');
        // await sleep(10);

        // select left panel
        await page.waitForSelector('text=Apply');
        const leftPanelHtml = await page.$('table');
        console.log(leftPanelHtml);

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

    function sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}


// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = () => {
    getHomePage();
}
