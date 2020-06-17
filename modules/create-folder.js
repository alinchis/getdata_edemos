const fs = require('fs-extra')

// ////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (index, itemPath) => {

  // create path
  try {
    fs.ensureDirSync(itemPath)
    console.log(`${index} :: PATH: ${itemPath} successfully created!`)
  } catch (err) {
    console.error(err)
  }
}
