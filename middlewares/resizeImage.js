const sharp = require("sharp");
const path = require('path')
const fs = require('fs')





async function resizeImage(input,output) {
  try {
    await sharp(input)
      .resize({
        width: 150,
        height: 97
      })
      .toFormat("jpeg", { mozjpeg: true })
      .toFile(output);
  } catch (error) {
    console.log(error);
  }
}

module.exports=resizeImage;