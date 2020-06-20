// get exams data from website [http://static.bacalaureat.edu.ro/2018/rapoarte_sept/index.html]

const fs = require('fs-extra');
// const glob = require('glob');

// import local modules
const createFolder = require('./modules/create-folder');
const getIndexList = require('./modules/get-index-list');
const getIndex = require('./modules/get-index-params');
const exportToCsv = require('./modules/export-to-csv');

// local paths
const dataPath = './data';
const localPaths = {
    metadata: 'metadata',
    tables: 'tables',
    exports: 'exports',
    logs: 'logs',
};
const saveFilePath = './data/today/metadata/indexesPaths.csv';
const saveUatPath = './data/today/metadata/uatList.csv';

// remote paths



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
    // create folder paths variables
    const metadataPath = `${dataPath}/${today}/${localPaths['metadata']}`;
    const tablesPath = `${dataPath}/${today}/${localPaths['tables']}`;
    const exportsPath = `${dataPath}/${today}/${localPaths['exports']}`;
    const logsPath = `${dataPath}/${today}/${localPaths['logs']}`;
    // create save files paths variables
    const countiesSavePath = `${metadataPath}/year_counties.json`;
    const ecSavePath = `${metadataPath}/year_exam-centers.json`;
    const studentsSavePath = `${tablesPath}/year_students.json`;
    const logFilePath = `${logsPath}/year.csv`;

    // help text
    const helpText = `\n Available commands:\n\n\
  1. -h  : display help text\n\
  2. -d  : download index list\n\
  3. -dd : download indexes\n`;

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
        getIndexList(today, saveFilePath.replace('today', today));


        // 3. else if argument is 'dd'
    } else if (mainArg === '-dd') {

        // stage 3: get localities DATA
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 2: Download indexes\n');
        getIndex(today, saveFilePath.replace('today', today), saveUatPath.replace('today', today));



        // else print help
    } else {
        console.log(helpText);
    }

}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN
main();
