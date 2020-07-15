// get exams data from website [http://static.bacalaureat.edu.ro/2018/rapoarte_sept/index.html]

const fs = require('fs-extra');
// const glob = require('glob');

// import local modules
const createFolder = require('./modules/create-folder');
const getIndexList = require('./modules/get-index-list');
const getPrimaryData = require('./modules/get-primary-data');
const getPerformanceData = require('./modules/get-performance-data');

// constants
const eDemosFirstYear = 1990;
const eDemosLastYear = 2020;

// local paths
const dataPath = './data';
const localPaths = {
    metadata: 'metadata',
    tables: 'tables',
    exports: 'exports',
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
    // create folder paths variables
    const metadataPath = `${dataPath}/${today}/${localPaths.metadata}`;
    const tablesPath = `${dataPath}/${today}/${localPaths.tables}`;
    const exportsPath = `${dataPath}/${today}/${localPaths.exports}`;
    const logsPath = `${dataPath}/${today}/${localPaths.logs}`;

    // help text
    const helpText = `\n Available commands:\n\n\
  1. -h  : display help text\n\
  2. -d  : download index list\n\
  3. -d1 : download primary data\n\
  4. -d2 : download performance data\n`;

    // get command line arguments
    const arguments = process.argv;
    console.log('\x1b[34m%s\x1b[0m', '\n@START: CLI arguments >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.table(arguments);
    console.log('\n');

    // get third command line argument
    // if argument is missing, -h is set by default
    const mainArg = process.argv[2] || '-h';
    // const secondaryArg = process.argv[3] || '';
    // manual select list of counties for download, leave active only the ones you want to download


    // run requested command
    // 1. if argument is 'h' or 'help' print available commands
    if (mainArg === '-h') {
        console.log(helpText);

        // 2. else if argument is 'd'
    } else if (mainArg === '-d') {

        // prepare folders // folders are not written over
        createFolder(1, metadataPath);
        createFolder(2, tablesPath);
        createFolder(3, exportsPath);
        createFolder(4, logsPath);

        // stage 1: get counties info
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 1: get indexes list\n');
        getIndexList(today, indexesFilePath.replace('today', today));


        // 3. else if argument is 'd1'
    } else if (mainArg === '-d1') {

        // stage 3: get uat primany DATA
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 2: Download primary data\n');

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
            tablesPath
        );



        // 4. else if argument is 'd2'
    } else if (mainArg === '-d2') {

        // stage 3: get uat performance DATA
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 2: Download performance data\n');

        getPerformanceData(
            today,
            indexesFilePath.replace('today', today),
            saveUatPath.replace('today', today),
            logsPath,
            performanceIndexListPath.replace('today', today),
            tablesPath
        );




        // else print help
    } else {
        console.log(helpText);
    }

}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN
main();