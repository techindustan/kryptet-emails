/*
 * Kryptet
 */

const fs = require('fs-extra');
const path = require('path');
const replace = require('replace-in-file');

const LANGUAGE_MAPPINGS = {
  en: 'en',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'et-EE': 'et',
  'lt-LT': 'lt',
  'ru-RU': 'ru',
};

const IGNORE = [...new Set(Object.keys(LANGUAGE_MAPPINGS).concat(Object.values(LANGUAGE_MAPPINGS)))];
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');
const pagesDir = path.join(srcDir, 'pages');
const partialsDir = path.join(srcDir, 'partials');
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

function checkLocaleDirectory(directory, filename) {
  fullPath = path.join(directory, filename);
  if (!IGNORE.includes(filename) && fs.lstatSync(fullPath).isDirectory()) {
    console.log('Removing unsupported locale', directory, filename);
    fs.removeSync(fullPath);
    return false;
  }
  return true;
}

function renameLocaleDirectory(directory, filename) {
  if (filename in LANGUAGE_MAPPINGS && filename == LANGUAGE_MAPPINGS[filename]) {
    return;
  }
  if (filename in LANGUAGE_MAPPINGS) {
    source = path.join(directory, filename);
    dest = path.join(directory, LANGUAGE_MAPPINGS[filename]);
    if (!fs.existsSync(source)) {
      return;
    }
    if (fs.existsSync(dest)) {
      fs.removeSync(dest);
    }
    fs.moveSync(source, dest);
  }
}

const allDirs = getDirectories(pagesDir)
  .concat(getDirectories(partialsDir))
  .concat(getDirectories(smsDir))
  .concat(getDirectories(callDir));

for ([directory, filename] of allDirs) {
  if (checkLocaleDirectory(directory, filename)) {
    renameLocaleDirectory(directory, filename);

    // Rename partials locale automatically
    if (filename !== 'en') {
      const options = {
        files: `${path.join(directory, filename)}${path.sep}**${path.sep}*.html`,
        from: /\{\{> en\//g,
        to: `{{> ${filename}/`,
      };
      try {
        const changes = replace.sync(options);
      } catch (error) {
        console.error('Error while replacing partial locale paths:', error);
      }
    }
  }
}
