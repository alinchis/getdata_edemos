
// import libraries
const fs = require('fs-extra');
const XLSX = require('xlsx');
const { exec } = require('child_process');

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
    if (fs.existsSync(filePath)) {
        // read csv file
        const tableData = readCSV(filePath, delimiter);

        // if table has too many rows, don't try exporting
        if (tableData.length > 1000000) {
            console.warn(`INFO: File has too many rows ${tableData.length}. Limit is around 1,000,000!\n`);

        } else {
            // prepare out XLSX data
            console.log('\t> XLSX prepare workbook');
            // create new workbook
            const wb = XLSX.utils.book_new();
            // create new worksheet
            const wsName = 'data';
            // convert table data
            console.log(`\t> XLSX convert table [ ${tableData.length} lines] to sheet`);
            const wsData = XLSX.utils.aoa_to_sheet(tableData);

            // write sheet to workbook
            console.log(`\t> XLSX append sheet: ${wsName}`);
            XLSX.utils.book_append_sheet(wb, wsData, wsName);

            // save XLSX file
            console.log('\t> XLSX file write starting...');
            XLSX.writeFile(wb, saveFilePath);
            console.log('\t> XLSX file write done!');

            // libreoffice command line 'convert to' XLSX
            //const commandLine = `libreoffice --headless --convert-to xlsx --outdir ${process.cwd()}/${outpath.replace('./', '')} ${process.cwd()}/${inPath.replace('./', '')}/${fileName.replace(/ /g, '\\ ')}`;
            //console.log(process.cwd());
            //console.log(`\tcommand line: ${commandLine}`);
            //exec(commandLine, (error, stdout, stderr) => {
            //    if (error) {
            //        console.log(`error: ${error.message}`);
            //        return;
            //    }
            //    if (stderr) {
            //        console.log(`error: ${stderr.message}`);
            //        return;
            //    }
            //    console.log(`stdout: ${stdout}`);
            //});

        }

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
            exportToXlsx(index + 1, tableIndex, primaryFileArray.length, `${primaryInputPath}/${fileName}`, '#', `${primaryOutputPath}/${fileName.replace('.csv', '.xlsx')}`);
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
            exportToXlsx(index + 1, tableIndex, performanceFileArray.length, `${primaryInputPath}/${fileName}`, '#', `${primaryOutputPath}/${fileName.replace('.csv', '.xlsx')}`);
        });
     }


    console.log('\n@exportToXlsx:: END\n');
};
