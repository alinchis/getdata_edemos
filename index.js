// get exams data from website [http://static.bacalaureat.edu.ro/2018/rapoarte_sept/index.html]

const fs = require('fs-extra');
// const glob = require('glob');

// import local modules
const createFolder = require('./modules/create-folder');
const getIndexList = require('./modules/get-index-list');
const splitIndexesList = require('./modules/split-indexes-list');
const calculatePermutations = require('./modules/permutations');
const getPrimaryData = require('./modules/get-primary-data');
const getPerformanceData = require('./modules/get-performance-data');
const standardizeCsv = require('./modules/convert-to-standard-csv');
const exportToXlsx = require('./modules/export-to-xlsx');

// constants
const eDemosFirstYear = 1990;
const eDemosLastYear = 2020;

// local paths
const dataPath = './data';
const localPaths = {
    metadata: 'metadata',
    dowloads: 'downloads', // dowloaded data, one file/permutation
    permutations: 'permutations',
    tables: 'tables', // CSV with '#' delimiter
    stables: 'stables', // standard tables, CSV with ',' delimiter
    exports: 'exports', // XLSX files
    logs: 'logs',
};
const indexesFilePath = './data/today/metadata/indexesPaths.csv';
const saveUatPath = './data/today/metadata/uatList.csv';
// const saveLogPath = './data/today/logs/logsType.csv';
const primaryIndexListPath = './data/today/metadata/primaryIndexList.csv';
const performanceIndexListPath = './data/today/metadata/performanceIndexList.csv';
const manualIndexesListFilePath = './data/export_available_indicators.csv';

// remote paths
const manualIndexesListUrl = 'http://edemos.insse.ro/portal/faces/oracle/webcenter/portalapp/pages/report-access.jspx?_adf.ctrl-state=11ci4hxqyw_4&_afrLoop=2928625242659429&_afrWindowMode=0&_afrWindowId=11ci4hxqyw_1';


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// get current date - formatted
function getCurrentDate() {
    const today = new Date().toISOString();
    const regex = /^(\d{4}-\d{2}-\d{2})/g;
    // return formatted string
    return today.match(regex)[0];
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN function
async function main() {
    // get current date
    const today = getCurrentDate();
    console.log(`@index:main >>> current date = ${today}`);

    // help text
    const helpText = `\n Available commands:\n\n\
  1. -h         : display help text\n\
  2. -d         : download index list\n\
  3. -p         : create permutations files\n\
  4. -d1 [date] : download primary data. if date parameter is omitted, current date is applied\n\
  5. -d2 [date] : download performance data. if date parameter is omitted, current date is applied\n\
  6. -c  [date] : combine dowloaded data into CSV files, date is necessary. ex: '2020-03-01'\\n\`;
  7. -s  [date] : save data to standard CSV (',' delimiter), date is necessary. ex: '2020-03-01'\\n\`;
  8. -e  [date] : export tables to xlsx, date is necessary. ex: '2020-03-01'\n`;

    // get command line arguments
    const arguments = process.argv;
    console.log('\x1b[34m%s\x1b[0m', '\n@START: CLI arguments >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.table(arguments);
    console.log('\n');

    // get third command line argument
    // if argument is missing, -h is set by default
    const mainArg = process.argv[2] || '-h';
    const secondaryArg = process.argv[3] || today;

    // create folder paths variables
    let metadataPath = `${dataPath}/${secondaryArg}/${localPaths.metadata}`;
    let permutationsPath = `${dataPath}/${secondaryArg}/${localPaths.permutations}`;
    let downloadsPath = `${dataPath}/${secondaryArg}/${localPaths.dowloads}`;
    let tablesPath = `${dataPath}/${secondaryArg}/${localPaths.tables}`;
    let sTablesPath = `${dataPath}/${secondaryArg}/${localPaths.stables}`;
    let exportsPath = `${dataPath}/${secondaryArg}/${localPaths.exports}`;
    let logsPath = `${dataPath}/${secondaryArg}/${localPaths.logs}`;

    // run requested command
    // 1. if argument is 'h' or 'help' print available commands
    if (mainArg === '-h') {
        console.log(helpText);


        // 2. else if argument is 'd'
    } else if (mainArg === '-d') {

        // prepare folders // folders are not written over
        createFolder(1, metadataPath);
        createFolder(2, permutationsPath);
        createFolder(2, `${permutationsPath}/primary`);
        createFolder(2, `${permutationsPath}/performance`);
        createFolder(3, downloadsPath);
        createFolder(3, `${downloadsPath}/primary`);
        createFolder(3, `${downloadsPath}/performance`);
        createFolder(4, tablesPath);
        createFolder(4, `${tablesPath}/primary`);
        createFolder(4, `${tablesPath}/performance`);
        createFolder(5, sTablesPath);
        createFolder(5, `${sTablesPath}/primary`);
        createFolder(5, `${sTablesPath}/performance`);
        createFolder(6, exportsPath);
        createFolder(6, `${exportsPath}/primary`);
        createFolder(6, `${exportsPath}/performance`);
        createFolder(7, logsPath);
        createFolder(7, `${logsPath}/primary`);
        createFolder(7, `${logsPath}/performance`);

        // stage 1: get counties info
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 1: get indexes list\n');
        await getIndexList(indexesFilePath.replace('today', today));

        // prepare indexes lists
        await splitIndexesList(
            manualIndexesListFilePath,
            indexesFilePath.replace('today', today),
            `${dataPath}/${today}/${localPaths.metadata}`
        );


        // 3. else if argument is 'p'
    } else if (mainArg === '-p') {

        // stage 2: calculate permutations
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 2: calculate download permutations\n');

        if (fs.existsSync(metadataPath) && fs.existsSync(permutationsPath)) {
            calculatePermutations(
                metadataPath,
                permutationsPath
            );
        } else {
            console.log(`ERROR: PATH '${metadataPath}' or '${permutationsPath}' not found!`)
        }


        // 4. else if argument is 'd1'
    } else if (mainArg === '-d1') {

        // stage 4: get uat primany DATA
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 2: Download primary data\n');

        if (secondaryArg !== '' && fs.existsSync(`${dataPath}/${secondaryArg}/${localPaths.exports}`)) {
            getPrimaryData(
                secondaryArg,
                eDemosFirstYear,
                eDemosLastYear,
                manualIndexesListFilePath,
                manualIndexesListUrl,
                indexesFilePath.replace('today', secondaryArg),
                `${dataPath}/${secondaryArg}/${localPaths.metadata}`,
                `${dataPath}/${secondaryArg}/${localPaths.logs}`,
                primaryIndexListPath.replace('today', secondaryArg),
                `${dataPath}/${secondaryArg}/${localPaths.downloads}`
            );
        } else {
            getPrimaryData(
                today,
                eDemosFirstYear,
                eDemosLastYear,
                manualIndexesListFilePath,
                manualIndexesListUrl,
                indexesFilePath.replace('today', today),
                metadataPath,
                logsPath,
                primaryIndexListPath.replace('today', today),
                downloadsPath
            );
        }


        // 5. else if argument is 'd2'
    } else if (mainArg === '-d2') {

        // stage 5: get uat performance DATA
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 2: Download performance data\n');

        if (fs.existsSync(`${dataPath}/${secondaryArg}`)) {
            getPerformanceData(
                eDemosFirstYear,
                eDemosLastYear,
                performanceIndexListPath.replace('today', secondaryArg),
                `${dataPath}/${secondaryArg}/${localPaths.metadata}`,
                `${dataPath}/${secondaryArg}/${localPaths.logs}`,
                `${dataPath}/${secondaryArg}/${localPaths.downloads}`
            );
        }



        // 6. else if argument is 'c'
    } else if (mainArg === '-c') {

        // stage 6: verify done tables for double data
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 3: combine dowloaded data into csv files\n');

        // const downloadsPath = `${dataPath}/${secondaryArg}/${localPaths.downloads}`;
        // const tablesPath = `${dataPath}/${secondaryArg}/${localPaths.tables}`;
        // const exportsPath = `${dataPath}/${secondaryArg}/${localPaths.exports}`;

        // if (fs.existsSync(tablesPath) && fs.existsSync(exportsPath)) {
        //     console.log('PATHS found...');
        //     cleanCsv(tablesPath, `${dataPath}/${secondaryArg}/${localPaths.logs}`);
        // } else {
        //     console.log(`ERROR: Provided data path ${secondaryArg} not found!`);
        // }

        // 7. else if argument is 's'
    } else if (mainArg === '-s') {

        // stage 7: verify done tables for double data
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 4: covert CSV to standard CSV\n');

        const tablesPath = `${dataPath}/${secondaryArg}/${localPaths.tables}`;
        const sTablesPath = `${dataPath}/${secondaryArg}/${localPaths.stables}`;

        if (fs.existsSync(tablesPath) && fs.existsSync(sTablesPath)) {
            console.log('PATHS found...');
            standardizeCsv(tablesPath, sTablesPath);
        } else {
            console.log(`ERROR: Provided data path ${secondaryArg} not found!`);
        }

        // 8. else if argument is 'e'
    } else if (mainArg === '-e') {

        // stage 8: export csv files to xlsx
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 5: Export data to XLSX files\n');

        const tablesPath = `${dataPath}/${secondaryArg}/${localPaths.tables}`;
        const exportsPath = `${dataPath}/${secondaryArg}/${localPaths.exports}`;

        if (fs.existsSync(tablesPath) && fs.existsSync(exportsPath)) {
            console.log('PATHS found...');
            exportToXlsx(tablesPath, exportsPath);
        } else {
            console.log(`ERROR: Provided data path ${secondaryArg} not found!`);
        }



        // else print help
    } else {
        console.log(helpText);
    }

}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN
main();