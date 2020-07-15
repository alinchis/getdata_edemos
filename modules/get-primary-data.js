// get indexes list
'use strict';

// import libraries
const {
    chromium: chrome
} = require('playwright'); // Or 'chromium' or 'webkit'.
// const axios = require('axios');
// const cheerio = require('cheerio');
const fs = require('fs-extra');
const {
    Tabletojson: tabletojson
} = require('tabletojson');


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
// get list of indexes
async function getIndexList(manualIndexesList, urlTable, saveIndexListPath) {
    console.log(`\ngetIndexList: START`);

    // start write file
    const listHeader = ['domeniu', 'tip_indicator', 'url', 'indicator_cod', 'indicator_nume', 'an_prim', 'an_ultim', 'dezagregare1', 'dezagregare2', 'criteriu1', 'criteriu2', 'years_count', 'max_years', 'years_step', 'uat_step'];
    fs.writeFileSync(saveIndexListPath, `${listHeader.join('#')}\n`);

    try {
        // launch browser
        const browser = await chrome.launch({
            headless: false
        });
        const page = await browser.newPage();

        const returnArray = [];

        // for each item in url list
        for (let i = 0; i < urlTable.length; i += 1) {
            // assemble current index path
            const indexI = `${i + 1}/${urlTable.length}`;
            console.log(`\n${indexI}\n`);

            // load page in browser
            await page.goto(urlTable[i][3]);

            // get list of current indexes from input: '2. Indicatori'
            const indexList = await getItemList(page, '_paramsP_INDIC');

            //for each indicator
            for (let j = 0; j < indexList.length; j += 1) {

                // select indicator item
                const currentIndex = await mcSelectItem(page, '_paramsP_INDIC', j);
                const indexId = currentIndex.split(' ')[0];

                // get list of 'Dezagregare 1' items
                const dez1List = await getItemList(page, '_paramsP_DEZAGREGARE1');
                // console.log(`Dezagregare 1: ${dez1List.length} elemente`);
                const dez1ListCount = dez1List.length;

                // get list of 'Dezagregare 2' items
                const dez2List = await getItemList(page, '_paramsP_DEZAGREGARE2');
                // console.log(`Dezagregare 2: ${dez2List.length} elemente`);
                const dez2ListCount = dez2List.length;

                // get list of 'Criteriu 1' items
                const crit1List = await getItemList(page, '_paramsP_CRITERIU1');
                // console.log(`Criteriu 1: ${crit1List.length} elemente`);
                const crit1ListCount = crit1List.length - 2;

                // get list of 'Criteriu 2' items
                const crit2List = await getItemList(page, '_paramsP_CRITERIU2');
                // console.log(`Criteriu 2: ${crit2List.length} elemente`);
                const crit2ListCount = crit2List.length - 2;

                // assemble current index path
                // create file path
                const indexJ = `${indexI} ${j + 1}/${indexList.length} [ ${indexId} ] `;
                console.log(`${indexJ} >>> ${currentIndex}\n`);

                // get year data from manual indexes list
                const currentManualIndex = manualIndexesList.filter((item) => {
                    const itemName = `${item[2]} - ${item[3]}`;
                    // console.log(itemName);
                    // console.log(`${currentIndex}\n`);

                    return itemName.replace(/\s{2,}/g, ' ').toLowerCase() === currentIndex.replace(/\s{2,}/g, ' ').toLowerCase()
                })[0];

                // calculate permutations data
                // calculate years_count
                const yearsCount = Number(currentManualIndex[5]) - Number(currentManualIndex[4]) + 1;
                // calculate max_years
                const columnsCount = 13;
                const maxYears = Math.round(3500 / (columnsCount * dez1ListCount * dez2ListCount * crit1ListCount * crit2ListCount));
                // calculate years_step
                const yearsStep = maxYears < yearsCount ? maxYears : yearsCount;
                // calculate uat_step
                const uatStep = Math.round(maxYears / yearsStep);


                // push index into return array
                const currentRow = [
                    urlTable[i][0],
                    urlTable[i][1],
                    urlTable[i][3],
                    indexId,
                    currentIndex,
                    currentManualIndex[4],
                    currentManualIndex[5],
                    dez1ListCount,
                    dez2ListCount,
                    crit1ListCount,
                    crit2ListCount,
                    yearsCount,
                    maxYears,
                    yearsStep,
                    uatStep,
                ];
                // console.log(currentRow);
                returnArray.push(currentRow);
                // write row to file
                fs.appendFileSync(saveIndexListPath, `${currentRow.join('#')}\n`);
            }
        }

        // close browser
        await browser.close();

        // return new array
        return returnArray;

    } catch (e) {
        console.log(e);
    }
}


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sleep
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// multiple choice check box select item
async function mcCBSelectItem(element, marker, choice, step = 1, maxChoice = choice + 1) {
    // select all items from input
    await element.click(`div#xdo\\:${marker}_div`);
    if (choice === 'all') {
        await element.check(`li#xdo\\:xdo\\:${marker}_div_li_${choice} label input`);
    } else {
        for (let i = 0; i < step; i += 1) {
            if (choice + i < maxChoice) await element.check(`li#xdo\\:xdo\\:${marker}_div_li_${choice + i} label input`);
        }
    }

    // click to register input selection
    await element.click(`label[for=${marker}]`);
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// multiple choice select item
async function mcSelectItem(element, marker, choice) {
    // select item of choice from input
    await element.click(`div#xdo\\:${marker}_div`);
    const item = await element.$(`li#xdo\\:xdo\\:${marker}_div_li_${choice}`);
    await item.click();
    return await item.innerText();
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
// get current index params
function getCurrentIndexParams(indexList, i, metadataPath, tablesPath, logsPath) {
    const currentIndexName = indexList[i][4];
    const currentIndexList = indexList.filter(item => item[0] === indexList[i][0]);

    // return current index parameters
    return {
        url: indexList[i][2],
        id: indexList[i][3],
        name: currentIndexName,
        filePath: `${tablesPath}/${currentIndexName.trim().replace('/', '-')}.csv`,
        permutationsPath: `${metadataPath}/_permutations_${currentIndexName.trim().replace('/', '-')}.json`,
        downloadingMarkerPath: `${logsPath}/_downloading_${currentIndexName.trim().replace('/', '-')}`,
        doneMarkerPath: `${logsPath}/_done_${currentIndexName.trim().replace('/', '-')}`,
        logPath: `${logsPath}/${currentIndexName.trim().replace('/', '-')}.csv`,
        list: indexList.filter(item => item[0] === indexList[i][0]),
        index: currentIndexList.map(item => item[4]).indexOf(currentIndexName),
        yearStart: Number(indexList[i][5]),
        yearEnd: Number(indexList[i][6]),
        yearsCount: Number(indexList[i][11]),
        yearsStep: Number(indexList[i][13]),
        uatStep: Number(indexList[i][14]),
    };
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get current index last log loop parameters
function getLoopParams(currentIndex) {
    // init current index loop parameters
    let logArray = [];
    let lastLog = {
        y: currentIndex.yearStart,
        k1: 0,
        k2: 0,
        j: 0,
        k4: 0,
        countyName: '',
        uat: '',
    };

    // read log file for current index download parameters
    if (fs.existsSync(currentIndex.logPath)) {
        console.log('log file found, reading data ...\n');
        logArray = readCSV(currentIndex.logPath).slice(1);

        // check for empty log
        if (logArray.length > 0) {
            // print to screen the last item
            console.log(logArray[logArray.length - 1]);

            // update current index loop parameters, last line of log array
            lastLog = {
                y: Number(logArray[logArray.length - 1][2]),
                k1: Number(logArray[logArray.length - 1][3]),
                k2: Number(logArray[logArray.length - 1][4]),
                j: Number(logArray[logArray.length - 1][5]),
                // if last message was 'OK' skip to next uat, else retry last log uat
                k4: logArray[logArray.length - 1][9] === 'OK' ? Number(logArray[logArray.length - 1][7] + 1) : Number(logArray[logArray.length - 1][7]),
                countyName: logArray[logArray.length - 1][6],
                uat: logArray[logArray.length - 1][8],
            };
        } else {
            console.log('Log is empty.\n');
        }

        // else, create log file
    } else {
        console.log('log file not found, creating ...\n');
        fs.writeFileSync(currentIndex.logPath, `${['i', 'currentIndexId', 'y', 'k1', 'k2', 'j', 'countyName', 'k4', 'uatName', 'message'].join(',')}\n`);
    }

    // return loop params
    return lastLog;
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// calculate permutations array for given index
async function calculatePermutations(indexList, currentIndex) {
    console.log('@calculatePermutations:: START\n');
    const permArr = [];

    if (fs.existsSync(currentIndex.permutationsPath)) {
        return JSON.parse(fs.readFileSync(currentIndex.permutationsPath, 'utf8'));
    } else {
        try {
            // launch browser
            const browser = await chrome.launch({
                headless: true,
            });
            const page = await browser.newPage();
            // load page in browser
            await page.goto(currentIndex.url);
            // select current index
            const currentIndexI = await mcSelectItem(page, '_paramsP_INDIC', currentIndex.index);

            // for each county
            for (let j = 0; j < 42; j += 1) {
                const countyArr = [];
                let countyPerm = 0;

                // select county
                await page.click('div#xdo\\:_paramsP_JUD_div');
                // uncheck checkbox 'all'
                await page.uncheck('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
                // check current selection checkbox
                await page.check(`input#xdo\\:xdo\\:_paramsP_JUD_div_cb_${j}`);
                // click to register county selection
                await page.click('label[for=_paramsP_MACROREG]');
                // get uat list
                const uatList = await getItemList(page, '_paramsP_MOC');
                // click to register uat selection
                await page.click('label[for=_paramsP_MACROREG]');

                // get dezagregare_1 list of items from input: '3. Dezagregare 1'
                const dez1List = await getItemList(page, '_paramsP_DEZAGREGARE1');

                // get dezagregare_2 list of items from input: '4. Dezagregare 2'
                const dez2List = await getItemList(page, '_paramsP_DEZAGREGARE2');

                // for each year of available data, for current index
                for (let y = currentIndex.yearStart; y <= currentIndex.yearEnd; y += currentIndex.yearsStep) {
                    // for each item in dezagregare 1 list
                    for (let k1 = 0; k1 < dez1List.length; k1 += 1) {
                        // for each item in dezagregare_2 list
                        for (let k2 = 0; k2 < dez2List.length; k2 += 1) {
                            // for each item in uat list
                            for (let k4 = 0; k4 < uatList.length; k4 += currentIndex.uatStep) {
                                countyArr.push([y, k1, k2, k4]);
                                // console.log([y, k1, k2, k4]);
                                // increase county permutation counter
                                countyPerm += 1;
                            }
                        }
                    }
                }
                // show number of needed permutations
                console.log(`\t> county ${j}: ${countyPerm} permutations`);

                // reset county selector, set back to all
                await page.click('div#xdo\\:_paramsP_JUD_div');
                await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
                await page.click('div#xdo\\:_paramsP_JUD_div');

                // push county array to permutations array
                permArr.push(countyArr);
            }

            // close browser
            await browser.close();


        } catch (e) {
            console.log('\n@calculatePermutations:: ERROR getting permutations data !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
            throw e;
        }
    }

    // save permutations to file
    fs.writeFileSync(currentIndex.permutationsPath, JSON.stringify(permArr));
    console.log('\n@calculatePermutations:: PERMUTATIONS file write DONE!');
    // return permutations array
    return permArr;
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// check logs for errors in downloads
function checkLogs(permArr, currentIndex) {
    console.log('\n@checkLogs:: START');
    if (fs.existsSync(currentIndex.logPath)) {
        console.log('@checkLogs:: \'done\' marker file present, checking logs ...\n');
        // load file in array
        const logArr = readCSV(currentIndex.logPath).slice(1);

        // assemble log data into array of arrays (converted to strings), similar to permutations array
        const returnArr = [];
        for (let j = 0; j < 42; j += 1) {
            const strLogArr = [];

            // filter log items for current county
            const countyArr = logArr.filter(item => item[5] === `${j}`);

            // convert log array and filter rows marking good downloads
            countyArr.forEach((item) => {
                if (item[9] === 'OK' || item[9] === 'NO DATA') strLogArr.push(`${item[2]},${item[3]},${item[4]},${item[7]}`);
            });

            // calculate new county array
            const newCountyArr = permArr[j].filter(pItem => !strLogArr.includes(pItem.join(',')));

            // push new county permutations array to return array
            returnArr.push(newCountyArr);
        }

        // return new permutations array;
        console.log('@checklogs FILTER permutations for download ERRORS: DONE!');
        let totalPerm = 0;
        for (let i = 0; i < 42; i += 1) {
            console.log(`\tcounty ${i}: ${returnArr[i].length} permutations left.`);
            totalPerm += returnArr[i].length;
        }
        console.log(`\n\tTOTAL permutations left: ${totalPerm}.`);
        return returnArr;

    } else {
        return permArr;
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get primary table data
async function getPrimaryTableData(firstYear, lastYear, indexList, metadataPath, logsPath, tablesPath) {
    console.log(`\n@getPrimaryTableData:: START\n`);
    console.log(`@getPrimaryTableData:: received [ ${indexList.length} ] items for index list`);

    // for each item in index list
    for (let i = 0; i < indexList.length; i += 1) {
        // assemble current index path
        const indexI = `i[${i + 1}/${indexList.length}]`;
        console.log('\n//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
        console.log(`// index = ${i + 1}/${indexList.length} / ${indexList[i][3]} //////////////////////////////////////////////////////////////////////////////////////////////`);
        console.log(`\n${indexI} :: ${indexList[i][0]}\n`);

        // get index variables
        const currentIndex = getCurrentIndexParams(indexList, i, metadataPath, tablesPath, logsPath);

        // if 'download' marker for current index file already exists, skip to the next index
        console.log(`@getPrimaryTableData:: current index marker file path: '${currentIndex.downloadingMarkerPath}'`);
        if (fs.existsSync(currentIndex.downloadingMarkerPath)) {
            console.log('@getPrimaryTableData:: \'downloading\' marker file present, skipping current index ...\n');
            continue;

            // else
        } else {
            console.log('@getPrimaryTableData:: marker file is not present, creating ...\n');

            // create marker file to signal dowloading
            fs.writeFileSync(currentIndex.downloadingMarkerPath, 'marker\n');

            // calculate permutations
            const permutations = await calculatePermutations(indexList, currentIndex);

            // check logs for missing data
            let loopArray = checkLogs(permutations, currentIndex);

            // init current params, for error log
            let ey = 0;
            let ek1 = 0;
            let ek2 = 0;
            let ek4 = 0;


            // for each county in array of permutations /loop array
            for (let j = 0; j < 42; j += 1) {
                console.log(`\n// county = ${j}/42 /////////////////////////////////////////////////////////////////////////////////////////////////////\n`);

                // if current list of permutations in empty, continue
                if (loopArray[j].length === 0) continue;

                try {
                    // launch browser
                    const browser = await chrome.launch({
                        headless: true,
                    });
                    const page = await browser.newPage();
                    // load page in browser
                    // console.log(`${currentIndex.url}\n`);
                    await page.goto(currentIndex.url);
                    // select second tab, no pictures only table
                    // await page.click('div.tabBGN2L a.tabLink2L');

                    // for each permutation in county
                    for (let p = 0; p < loopArray[j].length; p += 1) {
                        // load parameters for current loop
                        const [y, k1, k2, k4] = loopArray[j][p];
                        ey = y;
                        ek1 = k1;
                        ek2 = k2;
                        ek4 = k4;
                        console.log(`y= ${y}, k1= ${k1}, k2= ${k2}, k4= ${k4}\n`);

                        const indexY = `${indexI} ${currentIndex.id} y[${y}-${y + currentIndex.yearsStep - 1}/${currentIndex.yearStart}-${currentIndex.yearEnd}]`;

                        // select years from input: '1. An referinta'
                        const yearStartIndex = lastYear - y; // year index is reversed (year 2020 > #0, year 1990 > #30)
                        const yearLastIndex = (yearStartIndex - currentIndex.yearsStep) > 0 ? (yearStartIndex - currentIndex.yearsStep) : -1;
                        // await mcCBSelectItem(page, '_paramsP_AN_REF', y, currentIndex.yearsStep, lastLog.y + currentIndex.yearsCount);
                        // select all items from input
                        await page.click(`div#xdo\\:_paramsP_AN_REF_div`);
                        for (let ii = yearStartIndex; ii > yearLastIndex; ii -= 1) {
                            await page.click(`li#xdo\\:xdo\\:_paramsP_AN_REF_div_li_${ii} label input`);
                        }
                        // click to register input selection
                        await page.click(`label[for=_paramsP_AN_REF]`);

                        // get list of current indexes from input: '2. Indicatori'
                        // const currentItemIndex = ( await getItemList(page, '_paramsP_INDIC')).indexOf(currentIndexName);
                        // select current index item by name
                        const currentIndexI = await mcSelectItem(page, '_paramsP_INDIC', currentIndex.index);
                        console.log(`j[${j + 1}/42] :: ${currentIndexI}\n`);


                        // get dezagregare_1 list of items from input: '3. Dezagregare 1'
                        const dez1List = await getItemList(page, '_paramsP_DEZAGREGARE1');


                        // for each item in dezagregare 1 list
                        // assemble current index path
                        const indexK1 = `${indexY} k1[${k1 + 1}/${dez1List.length}]`;
                        console.log(`\n${indexK1}\n`);

                        // select dezagregare_1 item
                        const currentDezagregare1 = await mcSelectItem(page, '_paramsP_DEZAGREGARE1', k1);
                        console.log(`${currentDezagregare1}\n`);

                        // get dezagregare_2 list of items from input: '4. Dezagregare 2'
                        const dez2List = await getItemList(page, '_paramsP_DEZAGREGARE2');


                        // for each item in dezagregare_2 list
                        // assemble current index path
                        const indexK2 = `${indexK1} k2[${k2 + 1}/${dez2List.length}]`;
                        console.log(`\n${indexK2}\n`);

                        // select dezagregare_2 item
                        const currentDezagregare2 = await mcSelectItem(page, '_paramsP_DEZAGREGARE2', k2);
                        console.log(`${currentDezagregare2}\n`);


                        // assemble current index path
                        const indexK3 = `${indexK2} j[${j + 1}/42]`;
                        // console.log(`\n${indexK3}\n`);

                        // select county
                        await page.click('div#xdo\\:_paramsP_JUD_div');
                        // uncheck checkbox 'all'
                        await page.uncheck('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
                        // check current selection checkbox
                        await page.check(`input#xdo\\:xdo\\:_paramsP_JUD_div_cb_${j}`);
                        const county = await page.$(`li#xdo\\:xdo\\:_paramsP_JUD_div_li_${j}`);
                        const countyValueItem = await county.$('input');
                        const countyId = await countyValueItem.getAttribute('value');
                        const countyName = await county.innerText();
                        console.log(`\n${indexK3} >>> [ ${countyId}, ${countyName} ]\n`);
                        // click to register county selection
                        await page.click('label[for=_paramsP_MACROREG]');

                        // get uat list
                        const uatList = await getItemList(page, '_paramsP_MOC');

                        // for each item in uat list
                        // assemble current index path
                        const indexK4 = `${indexK3} k4[${k4 + 1}/${uatList.length}]`;
                        // console.log(`\n${indexK4}\n`);

                        // select all items from input: '5. Criteriu 1'
                        await mcCBSelectItem(page, '_paramsP_CRITERIU1', 'all');
                        // select all items from input: '6. Criteriu 2'
                        await mcCBSelectItem(page, '_paramsP_CRITERIU2', 'all');

                        // prepare arrays
                        const uats = [];

                        // select uat
                        await page.waitForSelector('div#xdo\\:_paramsP_MOC_div')
                        await page.click('div#xdo\\:_paramsP_MOC_div');
                        for (let s = 0; s < currentIndex.uatStep; s += 1) {
                            const newK4 = k4 + s;
                            if (newK4 < uatList.length) {
                                // get element for processing
                                const uat = await page.$(`li#xdo\\:xdo\\:_paramsP_MOC_div_li_${newK4}`);
                                const uatValueItem = await uat.$('input');
                                const uatId = await uatValueItem.getAttribute('value'); // SIRUTA code
                                const uatName = await uat.innerText();
                                uats.push([uatId, uatName]);
                                // check item in list
                                await page.check(`input#xdo\\:xdo\\:_paramsP_MOC_div_cb_${newK4}`);
                            }
                        }

                        console.log(`${indexK4} >>> [ ${countyId}, ${countyName} ] > [ ${uats.join('; ')} ]`);
                        // click to register uat selection
                        // await uat.click();
                        await page.click('label[for=_paramsP_MACROREG]');

                        // // save current table to file
                        // click Apply button to load table on page
                        await page.click('button[title="Apply"]');
                        sleep(3);

                        try {
                            // get html table from frame
                            const tableFrame = page.frame('xdo:docframe0');

                            // test for data
                            await tableFrame.waitForSelector('g g g text');
                            const textTags = await tableFrame.$$('g g g text');
                            console.log(`\t> text array: ${textTags.length} items\n`);

                            // if array of text has only one element, there is no data, continue to next uat
                            if (textTags.length === 1) {
                                console.log('\t> NO DATA was returned, continue to next query ...\n');
                                // save log
                                fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, y, k1, k2, j, countyName, k4, uats[0][1], 'NO DATA']}\n`);
                                // reset uat selector, set back to none
                                page.waitForSelector('div#xdo\\:_paramsP_MOC_div');
                                await page.click('div#xdo\\:_paramsP_MOC_div');
                                for (let s = 0; s < currentIndex.uatStep; s += 1) {
                                    const newK4 = k4 + s;
                                    if (newK4 < uatList.length) await page.uncheck(`input#xdo\\:xdo\\:_paramsP_MOC_div_cb_${newK4}`);
                                }
                                await page.click('label[for=_paramsP_MACROREG]');

                                // continue, skip to next query
                                continue;
                            }

                            // get table item
                            await tableFrame.waitForSelector('div.tableContainer');
                            const tableItem = await tableFrame.$('div.tableContainer');
                            // console.log(tableItem);

                            // test if item exists
                            if (tableItem) {
                                console.log('\t> ELEMENT "div.tableContainer" FOUND, processing ...');

                                // get html from table item
                                const tableHtml = await tableItem.innerHTML();
                                // console.log(tableHtml);

                                // convert html table to json
                                const converted = tabletojson.convert(tableHtml);
                                console.log(`\t>> Returned table rows = ${converted[1].length}\n`);

                                // if first uat for current index:
                                if (k1 === 0 && k2 === 0 && j === 0 && k4 === 0 && y === permutations[j][0][0]) {
                                    console.log('NEW table, creating file ...\n');

                                    // create header row
                                    const headerRow = [
                                        converted[0][0]['0'], // 'AN'
                                        converted[0][0]['2'], // 'MACROREGIUNE'
                                        converted[0][0]['4'], // 'REGIUNE'
                                        converted[0][0]['6'], // 'JUDET'
                                        'SIRUTA',
                                        converted[0][0]['8'], // 'LOCALITATE'
                                        converted[0][0]['9'], // 'EV. LOC'
                                        converted[0][0]['10'], // 'DEZAGREGARE1'
                                        converted[0][0]['12'], // 'CRITERIU 1'
                                        converted[0][0]['13'], // 'DEZAGREGARE2'
                                        converted[0][0]['15'], // 'CRITERIU 2'
                                        converted[0][0]['16'], // 'VALOARE'
                                        converted[0][0]['17'], // 'UM'
                                        converted[0][0]['18'], // 'TIP VALOARE'
                                    ];

                                    // create file for index
                                    fs.writeFileSync(currentIndex.filePath, `${headerRow.join('#')}\n`);

                                }

                                // push each item into new array
                                converted[1].forEach((row) => {
                                    // create new row element
                                    const rowUat = uats.filter(item => item[1] === row['8'])[0];
                                    const newRow = [
                                        row['0'], // 'AN'
                                        row['2'], // 'MACROREGIUNE'
                                        row['4'], // 'REGIUNE'
                                        row['6'], // 'JUDET'
                                        rowUat[0], // 'SIRUTA'
                                        row['8'], // 'LOCALITATE'
                                        row['9'], // 'EV. LOC'
                                        row['10'], // 'DEZAGREGARE1'
                                        row['12'], // 'CRITERIU 1'
                                        row['13'], // 'DEZAGREGARE2'
                                        row['15'], // 'CRITERIU 2'
                                        row['16'], // 'VALOARE'
                                        row['17'], // 'UM'
                                        row['18'], // 'TIP VALOARE'
                                    ];

                                    // append row to file
                                    // create file for index
                                    fs.appendFileSync(currentIndex.filePath, `${newRow.join('#')}\n`);

                                });

                                // save log
                                fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, y, k1, k2, j, countyName, k4, uats[0][1], 'OK'].join(',')}\n`);

                            } else {
                                // save log
                                fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, y, k1, k2, j, countyName, k4, uats[0][1], 'NO DATA'].join(',')}\n`);
                            }

                        } catch (e) {
                            console.log(`\t> ERROR getting tabel from frame: ${e.message}\n`);
                            // save log
                            fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, y, k1, k2, j, countyName, k4, uats[0][1], e.message.split('\n')[0]].join(',')}\n`);

                            // reset uat selector, set back to none
                            page.waitForSelector('div#xdo\\:_paramsP_MOC_div');
                            await page.click('div#xdo\\:_paramsP_MOC_div');
                            for (let s = 0; s < currentIndex.uatStep; s += 1) {
                                const newK4 = k4 + s;
                                if (newK4 < uatList.length) await page.uncheck(`input#xdo\\:xdo\\:_paramsP_MOC_div_cb_${newK4}`);
                            }
                            await page.click('label[for=_paramsP_MACROREG]');

                            // wait a second
                            await sleep(1);

                            continue;

                        }


                        // reset uat selector, set back to none
                        await page.click('div#xdo\\:_paramsP_MOC_div');
                        for (let s = 0; s < currentIndex.uatStep; s += 1) {
                            const newK4 = k4 + s;
                            if (newK4 < uatList.length) await page.uncheck(`input#xdo\\:xdo\\:_paramsP_MOC_div_cb_${newK4}`);
                        }
                        await page.click('label[for=_paramsP_MACROREG]');

                        // wait a second
                        await sleep(1);

                        // click to close county selection
                        // await page.click('label[for=_paramsP_MACROREG]');
                        // sleep(1);

                        // reset county selector, set back to all
                        await page.click('div#xdo\\:_paramsP_JUD_div');
                        await page.click('li#xdo\\:xdo\\:_paramsP_JUD_div_li_all label input');
                        await page.click('div#xdo\\:_paramsP_JUD_div');


                        // reset year selection
                        await page.click(`div#xdo\\:_paramsP_AN_REF_div`);
                        // select all
                        await page.click(`li#xdo\\:xdo\\:_paramsP_AN_REF_div_li_all label input`);
                        // deselect all
                        await page.click(`li#xdo\\:xdo\\:_paramsP_AN_REF_div_li_all label input`);
                        // register selection
                        await page.click(`div#xdo\\:_paramsP_AN_REF_div`);
                    }


                    // close browser
                    await browser.close();

                } catch (e) {
                    console.log(e.message);

                    // update log file
                    fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, ey, ek1, ek2, j, '', ek4, '', e.message.split('\n')[0]].join(',')}\n`);
                }
            }

            // mark file as done
            console.log('index table download DONE!\n');
            fs.writeFileSync(currentIndex.doneMarkerPath, 'done\n');

            // remove current index download marker file
            if (fs.existsSync(currentIndex.downloadingMarkerPath)) fs.unlinkSync(currentIndex.downloadingMarkerPath);
        }

    }

    console.log(`\n@getPrimaryTableData: END\n`);
}


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (today, firstYear, lastYear, manualIndexesListFilePath, manualIndexesListUrl, indexesFilePath, metadataPath, logsPath, saveIndexListPath, tablesPath) => {
    console.log(`indexesFilePath: ${indexesFilePath}`);

    // check if manual index list file exists
    if (fs.existsSync(manualIndexesListFilePath)) {
        // load manual indexes list into file
        const manualIndexesList = readCSV(manualIndexesListFilePath, ',', '"').slice(1);

        // input file is present
        if (fs.existsSync(indexesFilePath)) {
            // read file into array
            const indexesArr = readCSV(indexesFilePath, '#').slice(1);
            console.log(`indexesFilePath: CSV import >>> ${indexesArr.length} items!\n`);

            // creat list of domains for primary indexes, 13 selection boxes
            const primaryIndexesArr = indexesArr.filter(item => item[1] === 'Indicatori primari');

            // get list of indexes
            const indexList = !fs.existsSync(saveIndexListPath) ? await getIndexList(manualIndexesList, primaryIndexesArr, saveIndexListPath) : readCSV(saveIndexListPath, '#');
            console.log(`Found ${indexList.length - 1} TOTAL primary indexes\n`);

            // get data for primary indexes
            await getPrimaryTableData(firstYear, lastYear, indexList.slice(1), metadataPath, logsPath, tablesPath);


            // else
        } else {
            console.log(`ERROR: Missing input file >>> ${indexesFilePath}`);
        }

        // else print error and give download instructions
    } else {
        console.log(`ERROR: manual indexes list file '${manualIndexesListFilePath}' NOT FOUND`);
        console.log(`Download from this link '${manualIndexesListUrl}' >> Indicatori Disponibili >> @click aici`);
        console.log('Place downloaded file in "./data" folder\n');
    }
}