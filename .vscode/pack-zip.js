const path = require('path');
const fs = require('fs');
const jszip = require('jszip');

const iconFile = path.join(__dirname, '../icon.png');
const pluginJSON = path.join(__dirname, '../plugin.json');
const distFolder = path.join(__dirname, '../dist');
let readmeDotMd = path.join(__dirname, '../readme.md');
let changelogDotMd = path.join(__dirname, '../changelogs.md');

if (!fs.existsSync(readmeDotMd)) {
  readmeDotMd = path.join(__dirname, '../README.md');
}

// create zip file of dist folder

const zip = new jszip();

zip.file('icon.png', fs.readFileSync(iconFile));
zip.file('plugin.json', fs.readFileSync(pluginJSON));
zip.file('readme.md', fs.readFileSync(readmeDotMd));
zip.file('changelogs.md', fs.readFileSync(changelogDotMd));

loadFile('', distFolder);
loadFile('dictionaries', path.join(__dirname, "../node_modules/typo-js/dictionaries"));

zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fs.createWriteStream(path.join(__dirname, '../dist.zip')))
  .on('finish', () => {
    console.log('Plugin dist.zip written.');
  });

function loadFile(root, folder) {
  const distFiles = fs.readdirSync(folder);
  distFiles.forEach((file) => {
    const fullPath = path.join(folder, file);
    const stat = fs.statSync(fullPath);

    console.log({ fullPath, root, file, rootStruction: path.join(root, file) })
    if (stat.isDirectory()) {
      loadFile(path.join(root, file), fullPath);
    } else if (!/LICENSE.txt/.test(file)) {
      zip.file(path.join(root, file), fs.readFileSync(fullPath));
    }
  });
}
