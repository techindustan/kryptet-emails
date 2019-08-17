/*
 * Kryptet
 */

const fs = require('fs-extra');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');
const smsDir = path.join(srcDir, 'sms');
const callDir = path.join(srcDir, 'call');

function getDirectories(directory) {
  let result = [];
  const dirs = fs.readdirSync(directory);
  for (let filename of dirs) {
    const fullPath = path.join(directory, filename);
    if (fs.lstatSync(fullPath).isDirectory()) {
      result.push([directory, filename]);
    }
  }
  return result;
}

function copyMediaDirectories(directories) {
  for ([directory, filename] of directories) {
    const media = directory.split(path.sep).slice(-1)[0];
    for ([directory_, filename_] of getDirectories(path.join(directory, filename))) {
      const source = path.join(directory_, filename_);
      let dest = source.replace(srcDir, distDir).replace(`${media}${path.sep}`, '');
      dest = path.join(dest, media);
      fs.copySync(source, dest);
    }
  }
}

copyMediaDirectories(getDirectories(callDir).concat(getDirectories(smsDir)));
