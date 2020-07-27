// import libraries
const fs = require('fs-extra');


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (filePath, colDelimiter = ',', strDelimiter = '') => {
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