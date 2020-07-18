// import libraries
const fs = require('fs-extra');
const XLSX = require('xlsx');

// ////////////////////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// load csv file
function readCsvLine(filePath) {
    // if file is found in path
    if (fs.existsSync(filePath)) {
        // break into lines
        const newArray = fs.readFileSync(filePath, 'utf8').split('\n');
        // return parsed file
        return newArray.filter(line => line);
    }
    // else return empty object
    console.log('\x1b[31m%s\x1b[0m', `ERROR: ${filePath} file NOT found!`);
    return [];
}

// /////////////////////////////////////////////////////////////////////
// clean current table file
function checkCleanCsv(index, tableIndex, totalItems, filePath, tempFilePath, downloadingFilePath) {
    const printIndex = `${index}/${totalItems} [ ${tableIndex} ]`;
    console.log(`\n${printIndex} >>> @cleanCSV: START...`);

    // if file is found in path
    if (fs.existsSync(filePath) && !fs.existsSync(downloadingFilePath)) {
        // read csv file
        console.log('\t> read array from CSV file');
        const rowsArray = readCsvLine(filePath);
        console.log(`\t>> array has ${rowsArray.length}`);

        // create new array
        console.log('\t> create new array...');
        const newArray = rowsArray.filter((row, index) => {
            const indexPercent = index * 100 / rowsArray.length;
            console.log(`\t\t>>> ${indexPercent.toFixed(2)} % :: [ ${index}/${rowsArray.length} ]`);
            return rowsArray.indexOf(row) == index;
        });

        // create temp file
        console.log('\t> create temp file');
        fs.writeFileSync(tempFilePath, newArray.join('\n'));
        // delete old file
        console.log('\t> delete original file');
        fs.unlinkSync(filePath);
        // rename temp file
        console.log('\t> rename temp file');
        fs.renameSync(tempFilePath, filePath);

    } else {
        // else show error message
        console.log('\x1b[31m%s\x1b[0m', `${printIndex} >>> ERROR: ${filePath} file NOT found! or DOWNLOADING`);
    }

    console.log(`${printIndex} >>> @cleanCSV: END`);
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (inPath, logsPath) => {
    console.log('\n@cleanCSV:: START\n');
    // read input directory
    const fileArray = fs.readdirSync(inPath);
    console.log(`TOTAL = ${fileArray.length} files found.`);

    fileArray.forEach((fileName, index) => {
        const tableIndex = fileName.split(' ')[0];
        console.log(`\n${index + 1}/${fileArray.length} >>> ${fileName}`);
        const filePath = `${inPath}/${fileName}`;
        console.log(`\t> ${filePath}`);
        const tempFilePath = `${inPath}/tempfile_${index}.csv`;
        console.log(`\t> ${tempFilePath}`);
        const downloadingFilePath = `${logsPath}/_downloading_${fileName.replace('.csv', '')}`;
        console.log(`\t> ${downloadingFilePath}`);
        const cleaningFilePath = `${logsPath}/_cleanining_${fileName.replace('.csv', '')}`;
        console.log(`\t> ${cleaningFilePath}`);
        const cleanedFilePath = `${logsPath}/_cleaned_${fileName.replace('.csv', '')}`;
        console.log(`\t> ${cleanedFilePath}`);

        // clean CSV file
        checkCleanCsv(index + 1, tableIndex, fileArray.length, filePath, tempFilePath, downloadingFilePath);
    });

    console.log('\n@cleanCSV:: END\n');
};
