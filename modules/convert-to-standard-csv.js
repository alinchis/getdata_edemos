
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
// save to standard CSV format
function exportToCSV(index, totalItems,tableIndex, filePath, delimiter, saveFilePath) {
    const printIndex = `${index}/${totalItems} [ ${tableIndex} ]`;
    console.log(`\n${printIndex} >>> @standardizeCSV: START...`);
    // if file is found in path
    if (fs.existsSync(filePath)) {
        // create new file
        fs.writeFileSync(saveFilePath, '');

        // read csv file
        const tableData = readCSV(filePath, delimiter);

        // save table to new file
        tableData.forEach((row, rIndex) => {
           const saveRow = `"${row.join('","')}"\n`;
           fs.appendFileSync(saveFilePath, saveRow);
        });

    } else {
        // else show error message
        console.log('\x1b[31m%s\x1b[0m',`${printIndex} >>> ERROR: ${filePath} file NOT found!`);
    }

    console.log(`${printIndex} >>> @standardizeCSV: END`);
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (inPath, outPath) => {
    console.log('\n@standardizeCSV:: START\n');

    // prepare primary paths
    const primaryInputPath = `${inPath}/primary`;
    const primaryOutputPath = `${outPath}/primary`;

    // if primary folders exists
    if (fs.existsSync(primaryInputPath) && fs.existsSync(primaryOutputPath)) {
        console.log('\n\t> Primary folders found, starting process...\n');
        // read input directory
        const primaryFileArray = fs.readdirSync(primaryInputPath);
        console.log(`TOTAL = ${primaryFileArray.length} files found.`);

        primaryFileArray.forEach((fileName, index) => {
            const tableIndex = fileName.split(' ')[0];
            exportToCSV(index + 1, primaryFileArray.length, tableIndex, `${primaryInputPath}/${fileName}`, '#', `${primaryOutputPath}/${fileName}`);
        });
    }

     // prepare performance paths
     const performanceInputPath = `${inPath}/performance`;
     const performanceOutputPath = `${outPath}/performance`;
 
     // if performance folders exists
     if (fs.existsSync(performanceInputPath) && fs.existsSync(performanceOutputPath)) {
         console.log('\n\t> Performance folders found, starting process...\n');
         // read input directory
         const performanceFileArray = fs.readdirSync(performanceInputPath);
         console.log(`TOTAL = ${performanceFileArray.length} files found.`);
 
         performanceFileArray.forEach((fileName, index) => {
             const tableIndex = fileName.split(' ')[0];
             exportToCSV(index + 1, performanceFileArray.length, tableIndex, `${performanceInputPath}/${fileName}`, '#', `${performanceOutputPath}/${fileName}`);
         });
     }


    

    console.log('\n@standardizeCSV:: END\n');
};
