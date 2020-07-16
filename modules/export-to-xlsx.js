
// import libraries
const fs = require('fs-extra');
const XLSX = require('xlsx');

// ////////////////////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// load csv file
function readCSV(filePath, delimiter) {
    // if file is found in path
    if (fs.existsSync(filePath)) {
        // break into lines
        const newArray = fs.readFileSync(filePath, 'utf8').split('\n');
        // return parsed file
        return newArray
            .filter(line => line)
            .map(line => line
                    // .split('"')
                    // .map(item => item.split(delimiter || ',')
                    //     .filter(item => item !== '')
                    // )
                    .split(delimiter || ',')
                // .filter(item => item !== '')
            );
    };
    // else return empty object
    console.log('\x1b[31m%s\x1b[0m',`ERROR: ${filePath} file NOT found!`);
    return [];
}

// /////////////////////////////////////////////////////////////////////
// export to xlsx
function exportToXlsx(index, tableIndex, totalItems, filePath, delimiter, saveFilePath) {
    const printIndex = `${index}/${totalItems} [ ${tableIndex} ]`;
    console.log(`\n${printIndex} >>> @exportToXlsx: START...`);
    // if file is found in path
    if (fs.existsSync(filePath) && tableIndex !== 'POP107D' && tableIndex !== 'POP108D') {
        // read csv file
        const tableData = readCSV(filePath, delimiter);

        // prepare out XLSX data
        console.log('\t@exportToXlsx: XLSX prepare workbook');
        // create new workbook
        const wb = XLSX.utils.book_new();
        // create new worksheet
        const wsName = 'data';
        // convert table data
        const wsData = XLSX.utils.aoa_to_sheet(tableData);

        // write sheet to workbook
        console.log(`\t@exportToXlsx: XLSX append sheet: ${wsName}`);
        XLSX.utils.book_append_sheet(wb, wsData, wsName);

        // save XLSX file
        console.log('\t@exportToXlsx: XLSX file write starting...');
        XLSX.writeFile(wb, saveFilePath);
        console.log('\t@exportToXlsx: XLSX file write done!');

    } else {
        // else show error message
        console.log('\x1b[31m%s\x1b[0m',`${printIndex} >>> ERROR: ${filePath} file NOT found!`);
    }

    console.log(`${printIndex} >>> @exportToXlsx: END`);
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (inPath, outPath) => {
    console.log('\n@exportToXlsx:: START\n');
    // read input directory
    const fileArray = fs.readdirSync(inPath);
    console.log(`TOTAL = ${fileArray.length} files found.`);
    
    fileArray.forEach((fileName, index) => {
        const tableIndex = fileName.split(' ')[0];
        exportToXlsx(index + 1, tableIndex, fileArray.length, `${inPath}/${fileName}`, '#', `${outPath}/${fileName.replace('.csv', '.xlsx')}`);
    });

    console.log('\n@exportToXlsx:: END\n');
};
