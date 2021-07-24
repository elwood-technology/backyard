#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const { existsSync, readFileSync, writeFileSync, statSync } = require("fs");
const { resolve, basename, extname, relative, dirname } = require("path");

const yargs = require('yargs/yargs');
const { hideBin } = require("yargs/helpers");
const glob = require("glob");
const { render } = require("ejs");
const { ensureDirSync } = require('fs-extra')

function fatal(err) {
  process.stderr.write(`${err.msg}\n`);
  process.stderr.write(`${err.stack}\n`);
  process.exit(1);
}

const { type, name, dest = undefined, dryRun = false, overwrite = false, ...args } = yargs(hideBin(process.argv)).argv

if (!type) {
  fatal(new Error("No --type provided"))
}
if (!name) {
  fatal(new Error("No --name provided"));
}

const tplPath = resolve(__dirname, '../templates', type);
const rootPath = resolve(__dirname, '../../../../')
const packagesPath = resolve(rootPath, './packages')
const destPath = dest || process.env.INIT_CWD || process.cwd();

if (!existsSync(tplPath)) {
  fatal(`Unable to load template path "${tplPath}"\n`)
}

console.log(`Destination Path: ${destPath}`);
console.log(`Template Path: ${tplPath}`);

glob(`${tplPath}/**/*`, (err, files) => {
  if (err) {
    fatal(err);
  }

  Promise.all(files.map(async (file) => {
    console.log(`- ./${relative(tplPath, file)}`);

    const folderNameRelativeToDest = relative(tplPath, dirname(file));
    const fileName = basename(file, extname(file));
    const filePath = resolve(destPath, folderNameRelativeToDest, fileName);
    const fileFolder = dirname(filePath);

    if (existsSync(filePath) && !overwrite) {
      console.log(`  file already exists. skipping...\n`);
      return;
    }

    if (dryRun === false) {
      ensureDirSync(fileFolder);
    }

    if (statSync(file).isDirectory()) {
      console.log(`  file is a directory. skipping...\n`);
      return;
    }

    if (fileName === '.gitkeep') {
      console.log(' - is gitkeep, skipping...\n');
      return;
    }

    const fileFolderRelativeToRoot = relative(fileFolder, rootPath);
    const fileFolderRelativeToPackages = relative(fileFolder, packagesPath);

    const content = readFileSync(file).toString();

    if (dryRun === false) {
      writeFileSync(filePath, render(content, {
        fileName,
        name,
        fileFolderRelativeToRoot,
        fileFolderRelativeToPackages,
        ...args
      }))
    }

    console.log(`  wrote\n`);

  })).then(() => {
    process.stdout.write("Generate Complete!\n");
    process.exit(0)
  }).catch(err => fatal(err))

})
