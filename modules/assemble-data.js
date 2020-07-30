// import libraries
const fs = require('fs-extra');

// ////////////////////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// load csv file


// /////////////////////////////////////////////////////////////////////
// clean current table file
function assembleIndexData(inPath, fileName) {
    console.log(`\t\t>>> @cleanCSV: START...`);

    // create index folder path
    const inFolderPath = `${inPath}/${fileName}`;

    // create outArray
    const outArray = [];

    // if folder is found in path
    if (fs.existsSync(inFolderPath)) {
        
        // for each county folder in index folder
        for (let j = 0; j < 42; j += 1) {
            const currentCountyFolder = `${inFolderPath}/${j}`;

            // if county folder exists
            if (fs.existsSync(currentCountyFolder)) {

                // read folder content
                const fileArr = fs.readdirSync(currentCountyFolder);

                // for each file in fileArr
                for(let p = 0; p < fileArr.length; p += 1) {
                    const filePath = `${currentCountyFolder}/${fileArr[p]}`
                    // read permutation file
                    fileLines = fs.readFileSync(filePath, 'utf-8').split('\n');
                    // push lines to out array
                    for(let l = 0; l < fileLines.length; l += 1) {
                        // if header line, continue
                        if (l === 0 && outArray[0] && fileLines[l] === outArray[0]) continue;

                        // push line to out array
                        outArray.push(fileLines[l]);
                    }
                }
            }
        }

    } else {
        // else show error message
        console.log('\x1b[31m%s\x1b[0m', `ERROR: \'${inFolderPath}\' folder NOT found!`);
    }

    console.log(`\t\t>>> @cleanCSV: END`);

    // return new array
    return outArray;
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (downloadsPath, tablesPath) => {
    console.log('\n@assembleData:: START...\n');

    // prepare performance paths
    const performanceInputPath = `${downloadsPath}/performance`;
    const performanceOutputPath = `${tablesPath}/performance`;

    // read input directory
    const performanceFileArray = fs.readdirSync(performanceInputPath);
    console.log(`TOTAL = ${performanceFileArray.length} files found.`);

    performanceFileArray.forEach((fileName, index) => {
        // assemble index data
        console.log(`\t[ ${index + 1}/${performanceFileArray.length} ] > assemble new index: ${fileName.split(' ')[0]}`);
        const outIndex = assembleIndexData(performanceInputPath, fileName);

        // save new index to file
        console.log(`\t[ ${index + 1}/${performanceFileArray.length} ] > write new index to file: ${fileName.split(' ')[0]}`);
        fs.writeFileSync(`${performanceOutputPath}/${fileName}.csv`, outIndex.join('\n'));
    });

    console.log('\n@assembleData:: END\n');
};
