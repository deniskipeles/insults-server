var multer = require('multer');
var fs = require('fs');
const path = require('path');



function mkDirByPathSync(targetDir, {
  isRelativeToScript = false
} = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep: '';
  const baseDir = isRelativeToScript ? __dirname: '.';

  return targetDir.split(sep).reduce((parentDir,
    childDir) => {
    const curDir = path.resolve(baseDir,
      parentDir,
      childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') {
        // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') {
        // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ['EACCES',
        'EPERM',
        'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  },
    initDir);
}



var pat = new Date().toISOString().split(/T/)[0].toString().split('-').join('/');
var pathh = `./uploads/${pat}`


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //console.log('filw',file);
    mkDirByPathSync(pathh);
    mkDirByPathSync(pathh+'/resized');
    fs.mkdir(pathh, (err)=> {
      cb(null, pathh);
    });
  },
  filename: (req, file, cb) => {
    var ext = file.originalname.split('.')
    cb(null, file.fieldname +Date.now()+'.'+ext.slice(-1))
  }
});

var upload = multer({
  storage: storage
});




module.exports = upload;