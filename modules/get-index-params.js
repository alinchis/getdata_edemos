// get indexes list

// import libraries
const {chromium: chrome} = require('playwright');  // Or 'chromium' or 'webkit'.
const axios = require('axios');
// const cheerio = require('cheerio');
const fs = require('fs-extra');
const qs = require('qs');

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
    console.log(`\ngetUatList: START`);
    console.log(`\ngetUatList: pageUrl = ${pageUrl}\n`);

    (async () => {
        //#1 launch browser
        const browser = await chrome.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(pageUrl);

        // create return array
        const returnArray = [];

        // for each county
        for (let i = 0; i <= 41; i += 1) {

            // select county
            // select visible multiple choice element, activates hidden list
            await page.click('div#xdo\\:_paramsP_JUD_div');
            // deselect all checkbox from hidden list
            await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
            // select current county from hidden list
            await page.check(`input#xdo\\:xdo\\:_paramsP_JUD_div_cb_${i}`);
            // get current county data: name and siruta/value/id
            const county = await page.$(`li#xdo\\:xdo\\:_paramsP_JUD_div_li_${i}`);
            const countyValueItem = await county.$('input');
            const countyId = await countyValueItem.getAttribute('value');
            const countyName = await county.innerText();
            console.log(`\n${i + 1}/42 JUDETUL :: [ ${countyId}, ${countyName} ]\n`);

            // click to register county selection
            await page.click('label[for=_paramsP_JUD]');

            // get uat list
            // select visible multiple choice element, activates hidden list
            await page.click('div#xdo\\:_paramsP_MOC_div');
            // select hidden uat items container tag
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
// multiple choice check box select item
async function mcCBSelectItem(element, marker, choice) {
    // select all items from input
    await element.click(`div#xdo\\:${marker}_div`);
    await element.click(`li#xdo\\:xdo\\:${marker}_div_li_${choice} label input`);
    // click to register input selection
    await element.click(`label[for=${marker}]`);
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// multiple choice select item
async function mcSelectItem(element, marker, choice) {
    // select item of choice from input
    await element.click(`div#xdo\\:${marker}_div`);
    await element.click(`li#xdo\\:xdo\\:${marker}_div_li_${choice}`);
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get list of items
async function getItemList(element, marker) {
    // get ul element
    await element.click(`div#xdo\\:${marker}_div`);
    const selectedUlItem = await element.$(`ul#xdo\\:xdo\\:${marker}_div_ul`);
    const returnArr = await selectedUlItem.$$('li');
    await element.click(`div#xdo\\:${marker}_div`);
    return returnArr;
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get url list
function getPrimaryUrlList(urlTable, saveUrlPath, saveLogPath) {
    console.log(`\ngetPrimaryUrlList: START\n`);
    console.log(urlTable.length);

    (async () => {
        //#1 launch browser
        const browser = await chrome.launch({headless: false});
        const page = await browser.newPage();

        // create return array
        const returnArray = [];

        //#2 for each page in url table
        for (let i = 0; i < urlTable.slice(1).length; i += 1) {
            // assemble current index path
            const indexI = `${i}/${urlTable.length}`;
            console.log(`\n${indexI}\n`);

            // load page in browser
            await page.goto(urlTable[i][3]);

            // select second tab, no pictures only table
            await page.click('div.tabBGN2L a.tabLink2L');

            // select all years from input: '1. An referinta'
            await mcCBSelectItem(page, '_paramsP_AN_REF', 'all');

            // get list of current indexes from input: '2. Indicatori'
            const indexList = await getItemList(page, '_paramsP_INDIC');

            // select all items from input: '5. Criteriu 1'
            await mcCBSelectItem(page, '_paramsP_CRITERIU1', 'all');

            // select all items from input: '6. Criteriu 2'
            await mcCBSelectItem(page, '_paramsP_CRITERIU2', 'all');

            //#3 for each indicator
            for (let j = 0; j < indexList.length; j += 1) {
                // assemble current index path
                const indexJ = `${indexI}::${j}/${indexList.length}`;
                console.log(`\n${indexJ}\n`);

                // get dezagregare_1 list of items from input: '3. Dezagregare 1'
                const dez1List = await getItemList(page, '_paramsP_DEZAGREGARE1');

                //#4 for each item in dezagregare 1 list
                for (let k1 = 0; k1 < dez1List.length; k1 += 1) {
                    // assemble current index path
                    const indexK1 = `${indexJ}::${k1}/${dez1List.length}`;
                    console.log(`\n${indexK1}\n`);

                    // select dezagregare_1 item
                    await mcSelectItem(page, '_paramsP_DEZAGREGARE1', k1);

                    // get dezagregare_2 list of items from input: '4. Dezagregare 2'
                    const dez2List = await getItemList(page, '_paramsP_DEZAGREGARE2');


                    //#5 for each item in dezagregare_2 list
                    for (let k2 = 0; k2 < dez2List.length; k2 += 1) {
                        // assemble current index path
                        const indexK2 = `${indexK1}::${k2}/${dez2List.length}`;
                        console.log(`\n${indexK2}\n`);

                        // select dezagregare_2 item
                        await mcSelectItem(page, '_paramsP_DEZAGREGARE2', k2);

                        //#6 for each item in county list
                        for (let k3 = 0; k3 <= 41; k3 += 1) {
                            // assemble current index path
                            const indexK3 = `${indexK2}::${k2}/42`;
                            console.log(`\n${indexK3}\n`);

                            // select county
                            // await mcCBSelectItem(page, '_paramsP_JUD', k3);
                            await page.click('div#xdo\\:_paramsP_JUD_div');
                            // uncheck checkbox 'all'
                            await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
                            // checkt current selection checkbox
                            await page.check(`input#xdo\\:xdo\\:_paramsP_JUD_div_cb_${k3}`);
                            const county = await page.$(`li#xdo\\:xdo\\:_paramsP_JUD_div_li_${k3}`);
                            const countyValueItem = await county.$('input');
                            const countyId = await countyValueItem.getAttribute('value');
                            const countyName = await county.innerText();
                            console.log(`\n${k3 + 1}/42 JUDETUL :: [ ${countyId}, ${countyName} ]\n`);
                            // click to register county selection
                            await page.click('label[for=_paramsP_JUD]');

                            // get uat list
                            const uatList = await getItemList(page, '_paramsP_MOC');

                            // for each item in uat list
                            for (let k4 = 0; k4 < uatList.length; k4 += 1) {
                                // assemble current index path
                                const indexK4 = `${indexK3}::${k4}/${uatList.length}`;
                                console.log(`\n${indexK4}\n`);

                                // select uat
                                await page.click('div#xdo\\:_paramsP_MOC_div');
                                await page.check(`input#xdo\\:xdo\\:_paramsP_MOC_div_cb_${k4}`);
                                const uat = await page.$(`li#xdo\\:xdo\\:_paramsP_MOC_div_li_${k4}`);
                                const uatValueItem = await uat.$('input');
                                const uatId = await uatValueItem.getAttribute('value');
                                const uatName = await uat.innerText();
                                console.log(`${indexK4} >>> [ ${countyId}, ${countyName} ] > [ ${uatId}, ${uatName} ]`);
                                // click to register uat selection
                                // await uat.click();
                                await page.click('label[for=_paramsP_MACROREG]');

                                // // get uat siruta
                                // const uatSirutaItem = await uatList[k4].$('input');
                                // const uatSiruta = await uatSirutaItem.getAttribute('value');
                                // // get uat name
                                // const uatName = await uatList[k4].innerText();

                                // get export to html url
                                const currentUrl = '';

                                // save log
                                fs.appendFileSync(saveLogPath, `${[i, j, k1, k2, k3, k4].join(',')}\n`)

                                // create row item
                                const urlItemArr = ['indicator', 'dezagregare_1', 'dezagregare_2', 'judet', 'siruta_uat', 'uat', 'html_url'];

                                // save url to array
                                returnArray.push(urlItemArr);

                                // save url to file
                                fs.appendFileSync(saveUrlPath, `${urlItemArr.join('#')}\n`);

                                // console.log(`${k3 + 1}/42 >>> ${countyId} ${countyName} :: ${uatSiruta} ${uatName}`);
                                await sleep(3600);
                            }

                            // click to close county selection
                            await page.click('div#xdo\\:_paramsP_MOC_div');
                            sleep(1);

                            // reset county selector, set back to all
                            await page.click('div#xdo\\:_paramsP_JUD_div');
                            await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
                            await page.click('div#xdo\\:_paramsP_JUD_div');


                        }
                    }
                }
            }

            await sleep(300);

        }

        // return array
        return returnArray;

    })();

}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get counties list
async function getTableData() {

    const urlStart = qs.stringify('/PODCA/Reports/Agricultură - silvicultură - mediu');
    // test request
    try {
        const res = await axios({
            method: 'get',
            url: `http://edemos.insse.ro/xmlpserver${urlStart}`,
            params: qs.stringify(params),
        })

        console.log(res.data);

    } catch (e) {
        console.log(e);
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
// // EXPORTS
module.exports = (today, saveFilePath, saveUatPath, saveUrlPrimaryPath, saveUrlPerformancePath, saveLogPath) => {
    console.log(`saveFilePath: ${saveFilePath}`);

    // start log file
    const logHeaderArr = ['i', 'j', 'k1', 'k2', 'k3', 'k4'];
    fs.writeFileSync(saveLogPath, `${logHeaderArr.join(',')}\n`);

    // start url save file, for primary index
    const urlPrimaryHeaderArr = ['indicator', 'dezagregare_1', 'dezagregare_2', 'judet', 'siruta_uat', 'uat', 'html_url'];
    fs.writeFileSync(saveUrlPrimaryPath, `${urlPrimaryHeaderArr.join('#')}\n`);
    // start url save file, for performance index
    const urlPerformanceHeaderArr = ['indicator', 'dezagregare', 'judet', 'mediu', 'siruta_uat', 'uat', 'html_url'];
    fs.writeFileSync(saveUrlPerformancePath, `${urlPerformanceHeaderArr.join('#')}\n`);

    // input file is present
    if (fs.existsSync(saveFilePath)) {
        // read file into array
        const indexesArr = readCSV(saveFilePath, '#').slice(1);
        console.log(`saveFilePath: CSV import >>> ${indexesArr.length} items!\n`);

        // get uat list
        // if uat list file exist read from file, else download uat
        // const uatList = fs.existsSync(saveUatPath) ? readCSV(saveUatPath) : getUatList(indexesArr[0][3], saveUatPath);
        // console.log(uatList);

        // // split index list on type of index, have different selection
        // creat list of primary indexes, 13 selection boxes
        const primaryIndexesArr = indexesArr.filter(item => item[1] === 'Indicatori primari');
        // create list of performance indexes, 10 selection boxes
        const performanceIndexesArr = indexesArr.filter(item => item[1] === 'Indicatori de performanță');
        // // get url for indexes list
        // get url for primary data tables
        // if url list file exist read from file, else download url list
        const urlPrimaryList = getPrimaryUrlList(primaryIndexesArr, saveUrlPrimaryPath, saveLogPath);
        console.log(urlPrimaryList);
        // get url for primary data tables
        // if url list file exist read from file, else download url list
        // const urlPerformanceList = fs.existsSync(saveUrlPerformancePath) ? readCSV(saveUrlPerformancePath) : getPerformanceUrlList(performanceIndexesArr, saveUrlPerformancePath, saveLogPath);
        // console.log(urlPerformanceList);

        // else
    } else {
        console.log(`ERROR: Missing input file >>> ${saveFilePath}`);
    }
}
