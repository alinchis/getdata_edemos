// import libraries
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
// replace RO characters
function replaceRoChars(inString) {
    return inString
        .replace(/-/g, ' - ')
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
        .replace(/ţ/g, 't')
        
        .replace(/Î/g, 'I')
        .replace(/â/g, 'a')
        .replace(/ș/g, 's')
        .replace(/ț/g, 't');
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get current index params
function getCurrentIndexParams(indexList, i, permutationsPath) {
    const currentIndexName = indexList[i][4];
    const currentIndexList = indexList.filter(item => item[0] === indexList[i][0]);

    // clean index name of unusable characters
    const cleanIndexName = replaceRoChars(currentIndexName).trim()
        .replace(/\/ de/g, ' - de')
        .replace(/\//g, ' per ')
        .replace(/-/g, ' - ')
        .replace(/\s+/g, ' ');

    console.log(`cleanIndexName = \'${cleanIndexName}\'`);

    // return current index parameters
    return {
        url: indexList[i][2],
        id: indexList[i][3],
        name: currentIndexName,
        cleanName: cleanIndexName,
        permutationsPath: `${permutationsPath}/${cleanIndexName}.json`,
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
// calculate permutations array for given index
async function calculatePermutations(indexList, outPath, includeList, skipList, primary = true) {
    console.log(`\n************************************************************************`);
    console.log(`@calculatePermutations:: ${primary ? 'primary' : 'performance'} indexes START...\n`);

    // some primary indexes don't have 'DEZAGREGARE2'
    // in this case, the branch must shift to performance branch for permutations
    let primarySwitch = false;

    for (let i = 0; i < indexList.length; i += 1) {
        console.log(`\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
        console.log(`[ ${i + 1} / ${indexList.length} ] >> ${primary ? 'primary' : 'performance'}\n`);

        // prepare current index parameters
        const currentIndex = getCurrentIndexParams(indexList, i, outPath);
        // console.log(`i[${i + 1}/${indexList.length}] ${currentIndex.id}`);
        // console.log(currentIndex);
        console.log(`${primary ? 'Prim' : 'Perf'} [ ${i + 1} / ${indexList.length} ] >> ${currentIndex.id}\n`);

        if (includeList.length > 0 && !includeList.includes(currentIndex.id)) continue;

        // init current index permutation array
        const permArr = [];

        // if permutation file is present, skip to next index
        if (fs.existsSync(currentIndex.permutationsPath)) {
            console.log('\n\t\t>> permutations file found! skipping...\n');
            continue;

        // else, calculate permutations for current index
        } else {
            try {
                console.log('\n\t>> permutations file NOT found! processing...\n');
                // launch browser
                const browser = await chrome.launch({
                    headless: false,
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
    
                    // for performance indexes check both 'urban' and 'rural' checkboxes
                    if (!primary) {
                        // select urban /rural checkboxes
                        await page.click(`div#xdo\\:_paramsP_M_R_div`);
                        await page.check(`li#xdo\\:xdo\\:_paramsP_M_R_div_li_0 label input`);
                        await page.check(`li#xdo\\:xdo\\:_paramsP_M_R_div_li_1 label input`);
                        await page.click(`div#xdo\\:_paramsP_M_R_div`);
                        // click to register input selection
                        await page.click('label[for=_paramsP_MACROREG]');
                    };
    
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
                    console.log(`\t\t> UATs: ${uatList.length} items`);
                    // click to register uat selection
                    await page.click('label[for=_paramsP_MACROREG]');
    
                    // get dezagregare_1 list of items from input: '3. Dezagregare 1'
                    const dez1List = await getItemList(page, '_paramsP_DEZAGREGARE1');
    
                    // for primary indexes check item 'Dezagregare 2'
                    if (primary && !primarySwitch) {
                        try {
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
                                            countyArr.push([j, countyPerm, y, k1, k2, k4]);
                                            console.log('\t\t', [j, countyPerm, y, k1, k2, k4]);
                                            // increase county permutation counter
                                            countyPerm += 1;
                                        }
                                    }
                                }
                            }
                        } catch (err) {
                            // switch primary index to performance branch
                            // primarySwitch = true;
                            // // for each year of available data, for current index
                            // for (let y = currentIndex.yearStart; y <= currentIndex.yearEnd; y += currentIndex.yearsStep) {
                            //     // for each item in dezagregare 1 list
                            //     for (let k1 = 0; k1 < dez1List.length; k1 += 1) {
                            //         // for each item in uat list
                            //         for (let k4 = 0; k4 < uatList.length; k4 += currentIndex.uatStep) {
                            //             countyArr.push([j, countyPerm, y, k1, 0, k4]);
                            //             console.log('\t', [j, countyPerm, y, k1, 0, k4]);
                            //             // increase county permutation counter
                            //             countyPerm += 1;
                            //         }
                            //     }
                            // }
                        }
                        
    
                        // else, for performance indexes, omit item 'Dezagregare 2'
                    } else {
                        // for each year of available data, for current index
                        for (let y = currentIndex.yearStart; y <= currentIndex.yearEnd; y += currentIndex.yearsStep) {
                            // for each item in dezagregare 1 list
                            for (let k1 = 0; k1 < dez1List.length; k1 += 1) {
                                // for each item in uat list
                                for (let k4 = 0; k4 < uatList.length; k4 += currentIndex.uatStep) {
                                    countyArr.push([j, countyPerm, y, k1, 0, k4]);
                                    console.log('\t\t', [j, countyPerm, y, k1, 0, k4]);
                                    // increase county permutation counter
                                    countyPerm += 1;
                                }
                            }
                        }
                    }
    
                    // show number of needed permutations
                    console.log(`\t\t>>> county ${j}: ${countyPerm} permutations\n`);
    
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
        console.log('save to file: ', currentIndex.permutationsPath);
        fs.writeFileSync(currentIndex.permutationsPath, JSON.stringify(permArr));
        console.log('\n\t> PERMUTATIONS file write DONE!');
    }

    

    console.log(`\n@calculatePermutations:: ${primary ? 'primary indexes' : 'performance indexes'} END!\n`);
}


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (inPath, outPath) => {
    console.log(`\n************************************************************************`);
    console.log('@createPermutations: START...');

    // create include list
    const includeList = [
        // 'DER106A',
        // 'DER121A',
        // 'DER146A',
        // 'DER152A',
        'WEB5',
        'WEB13',
        'WEB14',
        'WEB15',
        'WEB16',
        'WEB19',
        'WEB20',
        'JUS105C',
        'JUS109A',
    ];
    
    // create skip list
    const skipList = [
        // 'DER106A',
        // 'DER107A',
        // 'DER121A',
        // 'DER146A',
        // 'DER152A',
        // 'DER2001',
        // 'DER129A',
    ];


    // create input paths
    const primaryListPath = `${inPath}/primaryIndexList.csv`;
    const performanceListPath = `${inPath}/performanceIndexList.csv`;

    // check if manual index list file exists
    if (fs.existsSync(primaryListPath) && fs.existsSync(performanceListPath)) {
        console.log('\t> primary and performance indexes list files FOUND! processing...');

        // process primary indexes
        const primaryList = readCSV(primaryListPath, '#').slice(1);
        console.log(`\n\t> primary indexes files read! found ${primaryList.length} indexes\n`);
        await calculatePermutations(primaryList, `${outPath}/primary`, includeList, skipList, true);

        // process performance indexes
        const performanceList = readCSV(performanceListPath, '#').slice(1);
        console.log(`\n\t> primary indexes files read! found ${performanceList.length} indexes\n`);
        await calculatePermutations(performanceList, `${outPath}/performance`, includeList, skipList, false);

        // else print error and give download instructions
    } else {
        console.log('\nERROR: primary or/and performance indexes files NOT FOUND');
        console.log('Run `node [path] -d to download and create indexes.\n');
    }

    console.log('\n@createPermutations: END!\n');
}