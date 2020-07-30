// get indexes list
'use strict';

// import libraries
const path = require('path');
const createFolder = require('./create-folder');
const readCSV = require('./read-csv');
const {
    chromium: chrome,
    firefox
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
// replace RO characters
function replaceRoChars (inString) {
    return inString
        .replace(/\s+/g, ' ')

        .replace(/î/g, 'i')
        .replace(/ă/g, 'a')
        .replace(/ș/g, 's')
        .replace(/ț/g, 't')
        
        .replace(/î/g, 'i')
        .replace(/Î/g, 'I')
        .replace(/â/g, 'a')
        .replace(/ă/g, 'a')
        .replace(/ş/g, 's')
        .replace(/ţ/g, 't')
        
        .replace(/î/g, 'i')
        .replace(/ă/g, 'a')
        .replace(/ş/g, 's')
        .replace(/ţ/g, 't');
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get current index params
function getCurrentIndexParams(indexList, i, permutationsPath, logsPath, downloadsPath) {
    const currentIndexName = indexList[i][4];
    const currentIndexList = indexList.filter(item => item[0] === indexList[i][0]);

    // clean index name of unusable characters
    const cleanIndexName = replaceRoChars(currentIndexName).trim()
        .replace(/\/ de/g, ' - de')
        .replace(/\//g, ' per ')
        .replace(/\s+/g, ' ');

    console.log(`cleanIndexName = \'${cleanIndexName}\'`);

    // create current index downloads path
    const currentDownloadsPath = `${downloadsPath}/performance/${cleanIndexName}`;
    // create downloads folder
    createFolder(i, currentDownloadsPath);

    // remove romanian charecters from permutations file names
    // console.log('\n//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
    // const permutationsFileList = fs.readdirSync(`${permutationsPath}/performance`);
    // try {
    //     permutationsFileList.forEach((fileName, fIndex) => {
    //         const newFileName = replaceRoChars(fileName);
    //         console.log(`${fIndex} :: newFileName = ${newFileName}`);
    //         fs.renameSync(`${permutationsPath}/performance/${fileName}`, `${permutationsPath}/performance/${newFileName}`);
    //     });
    // } catch (err) {
    //     console.log(err);
    // }

    // remove romanian charecters from logs file names
    // console.log('\n//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
    // const logsFileList = fs.readdirSync(`${logsPath}/performance`);
    // try {
    //     logsFileList.forEach((fileName, fIndex) => {
    //         const newFileName = replaceRoChars(fileName);
    //         console.log(`${fIndex} :: newFileName = ${newFileName}`);
    //         fs.renameSync(`${logsPath}/performance/${fileName}`, `${logsPath}/performance/${newFileName}`);
    //     });
    // } catch (err) {
    //     console.log(err);
    // }

    // remove romanian charecters from downloads folder names
    // console.log('\n//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
    // const downloadsFolderList = fs.readdirSync(`${downloadsPath}/performance`);
    // try {
    //     downloadsFolderList.forEach((folderName, fIndex) => {
    //         const newFolderName = replaceRoChars(folderName);
    //         console.log(`${fIndex} :: newFolderName = ${newFolderName}`);
    //         fs.renameSync(`${downloadsPath}/performance/${folderName}`, `${downloadsPath}/performance/${newFolderName}`);
    //     });
    // } catch (err) {
    //     console.log(err);
    // }
    

    // return current index parameters
    return {
        url: indexList[i][2],
        id: indexList[i][3],
        name: currentIndexName,
        downloadsPath: currentDownloadsPath,
        permutationsPath: `${permutationsPath}/performance/${cleanIndexName}.json`,
        downloadingMarkerPath: `${logsPath}/performance/_downloading_${cleanIndexName}`,
        doneMarkerPath: `${logsPath}/performance/_done_${cleanIndexName}`,
        logPath: `${logsPath}/performance/${cleanIndexName}.csv`,
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
// check logs for errors in downloads
function checkLogs(permArr, currentIndex) {
    console.log('\n@checkLogs:: START');
    if (fs.existsSync(currentIndex.logPath)) {
        console.log('@checkLogs:: \'done\' marker file present, checking logs ...\n');
        // load file in array
        const logArr = readCSV(currentIndex.logPath);

        // assemble log data into array of arrays (converted to strings), similar to permutations array
        const returnArr = [];
        for (let j = 0; j < 42; j += 1) {
            const strLogArr = [];

            // filter log items for current county
            const countyArr = logArr.filter(item => item[7] === `${j}`);

            // convert log array and filter rows marking good downloads
            countyArr.forEach((item) => {
                if (item[11] === 'OK' || item[11] === 'NO DATA') strLogArr.push(`${item[2]},${item[3]},${item[4]},${item[5]},${item[6]},${item[9]}`);
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
        return [returnArr, totalPerm];

    } else {
        // calculate total permutation
        let totalPerm = 0;
        for (let i = 0; i < 42; i += 1) {
            console.log(`\tcounty ${i}: ${permArr[i].length} permutations left.`);
            totalPerm += permArr[i].length;
        }
        return [permArr, totalPerm];
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get performance table data
async function getPerformanceTableData(firstYear, lastYear, indexList, metadataPath, permutationsPath, logsPath, downloadsPath) {
    console.log(`\n@getPerformanceTableData:: START\n`);
    console.log(`@getPerformanceTableData:: received [ ${indexList.length} ] items for index list`);

    // for each item in index list
    for (let i = 0; i < indexList.length; i += 1) {

        // assemble current index path
        const indexI = `\ti[${i + 1}/${indexList.length}]`;
        console.log('\n//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
        console.log(`// index = ${i + 1}/${indexList.length} / ${indexList[i][3]} //////////////////////////////////////////////////////////////////////////////////////////////`);
        console.log(`\n${indexI} :: ${indexList[i][0]}\n`);

        // get index variables
        const currentIndex = getCurrentIndexParams(indexList, i, permutationsPath, logsPath, downloadsPath);

        // if 'download' marker for current index file already exists, skip to the next index
        console.log(`@getPerformanceTableData:: current index \'downloading\' marker file path:\n'${currentIndex.downloadingMarkerPath}'\n`);
        if (fs.existsSync(currentIndex.downloadingMarkerPath)) {
            console.log('\t> marker file present, skipping current index ...\n');
            continue;

            // else
        } else if (fs.existsSync(currentIndex.permutationsPath, 'us-ascii')) {
            console.log('\t> marker file is not present, creating ...\n');

            // create marker file to signal dowloading
            fs.writeFileSync(currentIndex.downloadingMarkerPath, 'marker\n');

            // calculate permutations
            const permutations = JSON.parse(fs.readFileSync(currentIndex.permutationsPath));

            // for testing purposes
            // continue; // enable to get only permutations for each index

            // check logs for missing data
            let [loopArray, totalPermutations] = checkLogs(permutations, currentIndex);

            // init current params, for error log
            let ecc = 0;        // current county (from permutation)
            let ecp = 0;        // current permutation in county
            let ey = 0;         // year
            let ek1 = 0;        // 'dezagregare1'
            let ek2 = 0;        // 'dezagregare2'
            let ek4 = 0;        // UAT

            // init permutations counter
            let currentPermutation = 0;

            // for each county in array of permutations /loop array
            for (let j = 0; j < 42; j += 1) {
                console.log(`\n// county = ${j}/42 /////////////////////////////////////////////////////////////////////////////////////////////////////\n`);

                // if current list of permutations in empty, continue
                if (loopArray[j].length === 0) continue;

                // create current county permutations folder
                const currentDownloadsPath = `${currentIndex.downloadsPath}/${j}`;
                createFolder(j, currentDownloadsPath);

                try {
                    // launch browser
                    const browser = await firefox.launch({
                        headless: true,
                    });
                    const page = await browser.newPage();
                    page.setDefaultTimeout(120000);

                    // load page in browser
                    await page.goto(currentIndex.url);

                    // for each permutation in county
                    for (let p = 0; p < loopArray[j].length; p += 1) {

                        // increase current permutation index
                        currentPermutation += 1;
                        const permPercent = (currentPermutation / totalPermutations) * 100;
                        const permIndex = `${currentPermutation}/${totalPermutations} [ ${permPercent.toFixed(2)} % ]`;
                        // console.log(`${permIndex}   ////////////////////////////////////////////////////////////////////////////////////////////////`);

                        // load parameters for current loop
                        const [cc, cp, y, k1, k2, k4] = loopArray[j][p];
                        ecc = cc;       // current county
                        ecp = cp;       // current permutation in county
                        ey = y;         // year
                        ek1 = k1;       // 'dezagregare1'
                        ek2 = k2;       // 'dezagregare2'
                        ek4 = k4;       // UAT
                        console.log(`${permIndex} >>>>>> [ cc = ${cc}, cp = ${cp}, y = ${y}, k1 = ${k1}, k4 = ${k4} ] \n`);

                        const indexY = `${indexI} ${currentIndex.id} y[${y}-${y + currentIndex.yearsStep - 1}/${currentIndex.yearStart}-${currentIndex.yearEnd}]`;

                        // select years from input: '1. An referinta'
                        const yearStartIndex = lastYear - y; // year index is reversed (year 2020 > #0, year 1990 > #30)
                        const yearLastIndex = (yearStartIndex - currentIndex.yearsStep) > 0 ? (yearStartIndex - currentIndex.yearsStep) : -1;
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
                        console.log(`\t> Current Index = ${currentIndexI}\n`);


                        // get dezagregare_1 list of items from input: '3. Dezagregare 1'
                        const dez1List = await getItemList(page, '_paramsP_DEZAGREGARE1');


                        // for each item in dezagregare 1 list
                        // assemble current index path
                        const indexK1 = `${indexY} k1[${k1 + 1}/${dez1List.length}]`;
                        console.log(`\n${indexK1}`);

                        // select dezagregare_1 item
                        const currentDezagregare1 = await mcSelectItem(page, '_paramsP_DEZAGREGARE1', k1);
                        console.log(`\t> dezagregare1 = ${currentDezagregare1}\n`);

                        // select urban /rural checkboxes
                        await page.click(`div#xdo\\:_paramsP_M_R_div`);
                        await page.check(`li#xdo\\:xdo\\:_paramsP_M_R_div_li_0 label input`);
                        await page.check(`li#xdo\\:xdo\\:_paramsP_M_R_div_li_1 label input`);
                        await page.click(`div#xdo\\:_paramsP_M_R_div`);
                        // click to register input selection
                        await page.click('label[for=_paramsP_MACROREG]');
                        // await sleep(60);


                        // assemble current index path
                        const indexK3 = `${indexK1} j[${j + 1}/42]`;
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
                        console.log(`\t>>>>>> ${indexK3} >>> [ ${countyId}, ${countyName} ]\n`);
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
                        // await mcCBSelectItem(page, '_paramsP_CRITERIU2', 'all');

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

                        console.log(`${indexK4} >>> [ ${countyId}, ${countyName} ]\n\tUAT(s): [ ${uats.join('; ')} ]`);
                        // click to register uat selection
                        // await uat.click();
                        await page.click('label[for=_paramsP_MACROREG]');

                        // // save current table to file
                        // click Apply button to load table on page
                        console.log(`\tREQUEST data...`);
                        await page.click('button[title="Apply"]');
                        sleep(3);

                        try {
                            // get html table from frame
                            console.log(`\tREAD data...`);
                            const tableFrame = page.frame('xdo:docframe0');

                            // test for data
                            console.log(`\tTEST data...`);
                            await tableFrame.waitForSelector('g g g text');
                            const textTags = await tableFrame.$$('g g g text');
                            console.log(`\t\t> text array: ${textTags.length} items\n`);

                            // if array of text has only one element, there is no data, continue to next uat
                            if (textTags.length === 1) {
                                console.log('\t\t> NO DATA was returned, continue to next query ...\n');
                                // save log
                                fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, cc, cp, y, k1, k2, j, countyName, k4, uats[0][1], 'NO DATA']}\n`);
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
                                console.log('\t\t> ELEMENT "div.tableContainer" FOUND, processing ...');

                                // get html from table item
                                const tableHtml = await tableItem.innerHTML();
                                // console.log(tableHtml);

                                // convert html table to json
                                const converted = tabletojson.convert(tableHtml);
                                console.log(`\t\t>> Returned table rows = ${converted[1].length}\n`);

                                // prepare download file path
                                const downloadFilePath = `${currentDownloadsPath}/${cc}-${cp}.csv`;

                                // if first permutation for current county:
                                let headerRow = [];
                                if (cp == 0) {
                                    console.log('\t\t>>> First permutation, creating file with header ...\n');
                                    // console.log(converted);

                                    // create header row
                                    headerRow = [
                                        converted[0][0]['0'], // 'AN'
                                        converted[0][0]['2'], // 'MACROREGIUNE'
                                        converted[0][0]['4'], // 'REGIUNE'
                                        converted[0][0]['5'], // 'MEDIU'
                                        converted[0][0]['7'], // 'JUDET'
                                        'SIRUTA',
                                        converted[0][0]['9'], // 'LOCALITATE'
                                        converted[0][0]['10'], // 'EV. LOC'
                                        converted[0][0]['11'], // 'DEZAGREGARE1'
                                        converted[0][0]['13'], // 'CRITERIU 1'
                                        converted[0][0]['14'], // 'VALOARE'
                                        converted[0][0]['15'], // 'SCOR'
                                    ];

                                    // create file for index
                                    fs.writeFileSync(downloadFilePath, `${headerRow.join('#')}\n`);

                                }

                                // push each item into new array
                                converted[1].forEach((row) => {
                                    // create new row element
                                    const rowUat = uats.filter(item => item[1] === row['9'])[0];
                                    const newRow = [
                                        row['0'], // 'AN'
                                        row['2'], // 'MACROREGIUNE'
                                        row['4'], // 'REGIUNE'
                                        row['5'], // 'MEDIU'
                                        row['7'], // 'JUDET'
                                        rowUat[0], // 'SIRUTA'
                                        row['9'], // 'LOCALITATE'
                                        row['10'], // 'EV. LOC'
                                        row['11'], // 'DEZAGREGARE1'
                                        row['13'], // 'CRITERIU 1'
                                        row['14'], // 'VALOARE'
                                        row['15'], // 'SCOR'
                                    ];

                                    // append row to file
                                    // create file for index
                                    fs.appendFileSync(downloadFilePath, `${newRow.join('#')}\n`);

                                });

                                // save log
                                fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, cc, cp, y, k1, k2, j, countyName, k4, uats[0][1], 'OK'].join(',')}\n`);

                            } else {
                                // save log
                                fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, cc, cp, y, k1, k2, j, countyName, k4, uats[0][1], 'NO DATA'].join(',')}\n`);
                            }

                        } catch (e) {
                            console.log(`\t\t> ERROR getting table from frame: ${e.message}\n`);
                            // save log
                            fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, cc, cp, y, k1, k2, j, countyName, k4, uats[0][1], e.message.split('\n')[0]].join(',')}\n`);

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
                    // close browser
                    await browser.close();

                    // update log file
                    fs.appendFileSync(currentIndex.logPath, `${[i, currentIndex.id, ecc, ecp, ey, ek1, ek2, j, '', ek4, '', e.message.split('\n')[0]].join(',')}\n`);
                }
            }

            // mark file as done
            console.log('\tindex table download DONE!\n');
            fs.writeFileSync(currentIndex.doneMarkerPath, 'done\n');

            // remove current index download marker file
            if (fs.existsSync(currentIndex.downloadingMarkerPath)) fs.unlinkSync(currentIndex.downloadingMarkerPath);
        } else {
            console.error(`\nERROR: permutation file > \'${currentIndex.permutationsPath}\' NOT FOUND!\n`);
        }

    }

    console.log(`\n@getPerformanceTableData: END\n`);
}


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (firstYear, lastYear, indexListPath, metadataPath, permutationsPath, logsPath, downloadsPath) => {
    console.log(`indexesFilePath: ${indexListPath}`);
    // console.log(firstYear, lastYear, indexListPath, metadataPath, permutationsPath, logsPath, downloadsPath);

    // check if input file is present
    if (fs.existsSync(indexListPath)) {
        // get list of indexes
        const indexList = readCSV(indexListPath, '#').slice(1);
        console.log(`Found ${indexList.length} TOTAL performance indexes\n`);

        // set first and last index for download
        const firstIndex = 0;
        const lastIndex = indexList.length;       // not included

        // if first and last indexes are in range
        if (firstIndex >= 0 && lastIndex >= firstIndex && lastIndex <= indexList.length) {
            // filter array of indexes
            const filteredIndexList = indexList.slice(firstIndex, lastIndex);
            console.log(`\nFiltered index list ( ${filteredIndexList.length} items ):`);
            filteredIndexList.forEach((item, index) => {
                console.log(`\t[ ${firstIndex + index} ] : ${item[3]} >>> ${item[1]} : ${item[0]}`);
            })

            // get data for performance indexes
            await getPerformanceTableData(firstYear, lastYear, filteredIndexList, metadataPath, permutationsPath, logsPath, downloadsPath);

        } else {
            console.log(`ERROR: first or/and last index not in range: 0 <= fi[${firstIndex}] <= li[${lastIndex}] <= ${indexList.length - 1}\n`);
        }

        // else
    } else {
        console.log(`ERROR: Missing input file >>> ${indexListPath}`);
    }

}