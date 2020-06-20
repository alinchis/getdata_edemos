// get indexes list

// import libraries
const {chromium: chrome} = require('playwright');  // Or 'chromium' or 'webkit'.
const axios = require('axios');
// const cheerio = require('cheerio');
const fs = require('fs-extra');
// const qs = require('qs');

// create url paths
const homePath = 'http://edemos.insse.ro/xmlpserver/PODCA/Reports/Agricultur%C4%83%20-%20silvicultur%C4%83%20-%20mediu.xdo?_xpf=&_xpt=0&_xdo=%2FPODCA%2FReports%2FAgricultur%C4%83%20-%20silvicultur%C4%83%20-%20mediu.xdo&_xmode=2&xdo%3Axdo%3A_paramsP_AN_REF_div_input=&xdo%3Axdo%3A_paramsP_INDIC_TYPE_div_input=Definitiv&_paramsP_INDIC_TYPE=3&xdo%3Axdo%3A_paramsP_INDIC_div_input=AGR101B%20-%20Suprafa%C5%A3a%20fondului%20funciar%20dup%C4%83%20modul%20de%20folosin%C5%A3%C4%83%2C%20pe%20forme%20de%20proprietate&_paramsP_INDIC=1&xdo%3Axdo%3A_paramsP_DEZAGREGARE1_div_input=Mod%20de%20folosinta%20pentru%20suprafata%20agricola&_paramsP_DEZAGREGARE1=21&xdo%3Axdo%3A_paramsP_DEZAGREGARE2_div_input=Forme%20de%20proprietate&_paramsP_DEZAGREGARE2=2&xdo%3Axdo%3A_paramsP_CRITERIU1_div_input=&xdo%3Axdo%3A_paramsP_CRITERIU2_div_input=&xdo%3Axdo%3A_paramsP_MACROREG_div_input=All&_paramsP_MACROREG=*&_paramsP_NREG=Da&xdo%3Axdo%3A_paramsP_REG_div_input=All&_paramsP_REG=*&_paramsP_NJUD=Da&xdo%3Axdo%3A_paramsP_JUD_div_input=All&_paramsP_JUD=*&_paramsP_NMOC=Da&xdo%3Axdo%3A_paramsP_MOC_div_input=&_xt=Agricultur%C4%83%20-%20silvicultur%C4%83%20-%20mediu%20-%20cu%20grafice&_xf=analyze';

// url params
const params = {
    "_xpf": "1",
    "_xpt": "1",
    "_xdo": "/PODCA/Reports/Agricultură - silvicultură - mediu.xdo", // ?
    "_xmode": "2",
    "xdo:xdo:_paramsP_AN_REF_div_input": "All",
    "_paramsP_AN_REF": "*",
    "xdo:xdo:_paramsP_INDIC_div_input": "AGR101B - Suprafaţa fondului funciar după modul de folosinţă, pe forme de proprietate", // indicator titlu
    "_paramsP_INDIC": "1", // indicator id
    "xdo:xdo:_paramsP_DEZAGREGARE1_div_input": "Mod de folosinta pentru suprafata agricola", // dezagregare1 titlu
    "_paramsP_DEZAGREGARE1": "21", // dezagregare1 id
    "xdo:xdo:_paramsP_DEZAGREGARE2_div_input": "Forme de proprietate", // dezagregare2 titlu
    "_paramsP_DEZAGREGARE2": "2", // dezagregare2 id
    "xdo:xdo:_paramsP_CRITERIU1_div_input": "All",
    "_paramsP_CRITERIU1": "*",
    "xdo:xdo:_paramsP_CRITERIU2_div_input": "All",
    "_paramsP_CRITERIU2": "*",
    "xdo:xdo:_paramsP_MACROREG_div_input": "All",
    "_paramsP_MACROREG": "*",
    "xdo:xdo:_paramsP_NREG_div_input": "Da",
    "_paramsP_NREG": "Da",
    "xdo:xdo:_paramsP_REG_div_input": "All",
    "_paramsP_REG": "*",
    "xdo:xdo:_paramsP_NJUD_div_input": "Da",
    "_paramsP_NJUD": "Da",
    "xdo:xdo:_paramsP_JUD_div_input": "ARAD", // nume judet
    "_paramsP_JUD": "2", // id judet
    "xdo:xdo:_paramsP_NMOC_div_input": "Selectie detaliata localitati",
    "_paramsP_NMOC": "Da",
    "xdo:xdo:_paramsP_MOC_div_input": "MUNICIPIUL ARAD", // nume uat
    "_paramsP_MOC": "9262", // siruta uat
    "_xt": "Agricultură - silvicultură - mediu - fără grafice", // ?
    "_xf": "html",
    "_xana": "view",
};


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
// get uat list
function getUatList(pageUrl, saveUatPath) {
    console.log(`\ngetCountiesList: START`);
    console.log(`\ngetCountiesList: pageUrl = ${pageUrl}\n`);

    (async () => {
        //#1 launch browser
        const browser = await chrome.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(pageUrl);

        // create return array
        const returnArray = [];

        for (let i = 0; i <= 41; i += 1) {
            // select county
            await page.click('div#xdo\\:_paramsP_JUD_div');
            await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
            await page.check(`input#xdo\\:xdo\\:_paramsP_JUD_div_cb_${i}`);
            const county = await page.$(`li#xdo\\:xdo\\:_paramsP_JUD_div_li_${i}`);
            const countyValueItem = await county.$('input');
            const countyId = await countyValueItem.getAttribute('value');
            const countyName = await county.innerText();
            console.log(`\n${i + 1}/42 JUDETUL :: [ ${countyId}, ${countyName} ]\n`);
            await page.click('label[for=_paramsP_JUD]');

            // get uat list
            await page.click('div#xdo\\:_paramsP_MOC_div');
            const uatUlItem = await page.$('ul#xdo\\:xdo\\:_paramsP_MOC_div_ul');
            const uatList = await uatUlItem.$$('li');
            for (const uat of uatList) {
                // get uat siruta
                const uatSirutaItem = await uat.$('input');
                const uatSiruta = await uatSirutaItem.getAttribute('value');
                // get uat name
                const uatName = await uat.innerText();
                returnArray.push([countyId, countyName, uatSiruta, uatName]);
                console.log(`${i + 1}/42 >>> ${countyId} ${countyName} :: ${uatSiruta} ${uatName}`);
            }
            // const uatListHtml = await uatList.innerHTML();
            // console.log(uatListHtml);
            await page.click('div#xdo\\:_paramsP_MOC_div');
            sleep(1);

            // reset selector
            await page.click('div#xdo\\:_paramsP_JUD_div');
            await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
            await page.click('div#xdo\\:_paramsP_JUD_div');

        }

        // save array to csv file
        fs.writeFileSync(saveUatPath, returnArray.join('\n'));

        // return array
        return returnArray;

    })();

}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get counties list
async function getTableData() {

    // test request
    try {
        const res = await axios({
            method: 'get',
            url: 'http://edemos.insse.ro/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu',
            params,
        })

        console.log(res.request);

    } catch (e) {
        console.log(e);
    }
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
module.exports = (today, inFilePath, saveUatPath) => {
    console.log(`inFilePath: ${inFilePath}`);

    // input file is present
    if (fs.existsSync(inFilePath)) {
        // read file into array
        const indexesArr = readCSV(inFilePath, '#').slice(1);
        console.log(`inFilePath: CSV import >>> ${indexesArr.length} items!`);

        // get uat list
        // if uat list file exist read from file, else download uat
        const uatList = fs.existsSync(saveUatPath) ? readCSV(saveUatPath) : getUatList(indexesArr[0][3], saveUatPath);
        // console.log(uatList);

        // get index parameters
        // const indexesParams = getIndexesParams(indexesArr);

        // get table data
        getTableData();

        // else
    } else {
        console.log(`ERROR: Missing input file >>> ${inFilePath}`);
    };
}
