// import libraries
const {
    chromium: chrome,
    firefox
} = require('playwright'); // Or 'chromium' or 'webkit'.
// const axios = require('axios');
// const cheerio = require('cheerio');
const fs = require('fs-extra');


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
// multiple choice select item
async function mcSelectItem(element, marker, choice) {
    // select item of choice from input
    await element.click(`div#xdo\\:${marker}_div`);
    const item = await element.$(`li#xdo\\:xdo\\:${marker}_div_li_${choice}`);
    await item.click();
    return await item.innerText();
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get list of indexes
async function getIndexList(manualIndexesList, urlTable, savePath) {
    console.log(`\n@getIndexList: START`);

    // start write file
    const listHeader = ['domeniu', 'tip_indicator', 'url', 'indicator_cod', 'indicator_nume', 'an_prim', 'an_ultim', 'dezagregare1', 'dezagregare2', 'criteriu1', 'criteriu2', 'years_count', 'max_years', 'years_step', 'uat_step'];
    fs.writeFileSync(savePath, `${listHeader.join('#')}\n`);

    try {
        // launch browser
        const browser = await firefox.launch({
            headless: false
        });
        const page = await browser.newPage();

        const returnArray = [];

        // for each item in url list
        for (let i = 0; i < urlTable.length; i += 1) {
            // assemble current index path
            const indexI = `${i + 1}/${urlTable.length}`;
            console.log(`\n*** Domain ${indexI} *****************************************`);

            // load page in browser
            await page.goto(urlTable[i][3]);

            // get list of current indexes from input: '2. Indicatori'
            const indexList = await getItemList(page, '_paramsP_INDIC');

            //for each indicator
            for (let j = 0; j < indexList.length; j += 1) {

                // select indicator item
                const currentIndex = await mcSelectItem(page, '_paramsP_INDIC', j);
                const indexId = currentIndex.split(' ')[0];

                // assemble current index path
                const indexJ = `d[${indexI}] i[${j + 1}/${indexList.length}] [${indexId}]`;
                console.log(`\n${indexJ} >>> ${currentIndex}`);

                // get list of 'Dezagregare 1' items
                const dez1List = await getItemList(page, '_paramsP_DEZAGREGARE1');
                console.log(`\t> Dezagregare 1: ${dez1List.length} elemente`);
                const dez1ListCount = dez1List.length;

                // get list of 'Dezagregare 2' items
                let dez2ListCount = 1;
                if (await page.$('div #xdo\\:_paramsP_DEZAGREGARE2_div') !== null) {
                    const dez2List = await getItemList(page, '_paramsP_DEZAGREGARE2');
                    console.log(`\t> Dezagregare 2: ${dez2List.length} elemente`);
                    dez2ListCount = dez2List.length;
                };

                // get list of 'Criteriu 1' items
                const crit1List = await getItemList(page, '_paramsP_CRITERIU1');
                console.log(`\t> Criteriu 1: ${crit1List.length - 2} elemente`);
                const crit1ListCount = crit1List.length - 2;

                // get list of 'Criteriu 2' items
                let crit2ListCount = 1;
                if (await page.$('div #xdo\\:_paramsP_CRITERIU2_div') !== null) {
                    const crit2List = await getItemList(page, '_paramsP_CRITERIU2');
                    console.log(`\t> Criteriu 2: ${crit2List.length - 2} elemente`);
                    const crit2ListCount = crit2List.length - 2;
                };

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
                let maxYears = Math.round(3500 / (columnsCount * dez1ListCount * dez2ListCount * crit1ListCount * crit2ListCount));
                console.log(`\t> yearsCount = ${yearsCount}, maxYears = ${maxYears}`);
                // if maximum number of years for possible download request
                // is bigger than the available maximum years count available
                // set maxYears = yearsCount
                // maxYears = maxYears > yearsCount ? yearsCount : maxYears;
                // calculate years step
                // const yearsStep = maxYears < yearsCount ? maxYears : yearsCount; // removed, it seems they influence the limit differently than UATs selector
                const yearsStep = 1;
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
                fs.appendFileSync(savePath, `${currentRow.join('#')}\n`);
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
// // EXPORTS
module.exports = async (manualIndexesListFilePath, indexesFilePath, metadataPath) => {
    console.log(`\n************************************************************************`);
    console.log(`@splitIndexesList: START...`);

    // create path variables
    const primaryIndexListPath = `${metadataPath}/primaryIndexList.csv`;
    const performanceIndexesListPath = `${metadataPath}/performanceIndexList.csv`;

    // check if manual index list file exists
    if (fs.existsSync(manualIndexesListFilePath)) {
        // load manual indexes list into file
        const manualIndexesList = readCSV(manualIndexesListFilePath, ',', '"').slice(1);

        // input file is present
        if (fs.existsSync(indexesFilePath)) {
            // read file into array
            const indexesArr = readCSV(indexesFilePath, '#').slice(1);
            console.log(`\tindexes file FOUND... CSV import >>> ${indexesArr.length} items!\n`);

            // creat list of domains for primary indexes, 13 selection boxes
            console.log('\tPROCESS > primary indexes...');
            const primaryIndexesArr = indexesArr.filter(item => item[1] === 'Indicatori primari');
            // get list of indexes
            const primaryIndexList = !fs.existsSync(primaryIndexListPath) ? await getIndexList(manualIndexesList, primaryIndexesArr, primaryIndexListPath) : readCSV(primaryIndexListPath, '#').slice(1);
            console.log(`\n\t>> Found ${primaryIndexList.length} TOTAL primary indexes\n`);

            // creat list of domains for performance indexes, 13 selection boxes
            console.log('\tPROCESS > performance indexes...');
            const performanceIndexesArr = indexesArr.filter(item => item[1] === 'Indicatori de performanță');
            // get list of indexes
            const performanceIndexList = !fs.existsSync(performanceIndexesListPath) ? await getIndexList(manualIndexesList, performanceIndexesArr, performanceIndexesListPath) : readCSV(performanceIndexesListPath, '#').slice(1);
            console.log(`\n\t>> Found ${performanceIndexList.length} TOTAL performance indexes\n`);


            // else
        } else {
            console.log(`ERROR: Missing input file >>> ${indexesFilePath}`);
            console.log(`run program with '-d' parameter to build index file\n`);
        }

        // else print error and give download instructions
    } else {
        console.log(`ERROR: manual indexes list file '${manualIndexesListFilePath}' NOT FOUND`);
        console.log(`Download from this link '${manualIndexesListUrl}' >> Indicatori Disponibili >> @click aici`);
        console.log('Place downloaded file in "./data" folder\n');
    }

    console.log(`\n@splitIndexesList: END!\n`);
}
