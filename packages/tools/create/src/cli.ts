import { resolve } from 'path';

import { Command } from 'commander';
import { green, gray, red, bold } from 'chalk';
import Table from 'cli-table3';

import { createBackyard } from './create';

type Options = {
  ['project-dir']: string;
  typescript?: boolean;
  template?: string;
};

const pkg = require('../package.json');

async function main(): Promise<void> {
  let projectDir: string = '';

  const prog = new Command(pkg.name)
    .version(pkg.version)
    .usage(`${green('<project-dir>')} [options]`)
    .arguments('<project-dir> <template>')
    .action((dir) => {
      projectDir = dir;
    })
    .parse(process.argv);

  const { template = 'default' } = prog.opts() as Options;

  if (!projectDir) {
    console.log();
    console.log('Please specify the project directory:');
    console.log(`  ${gray(prog.name())} ${green('<project-dir>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${gray(prog.name())} ${green('by')}`);
    console.log();
    console.log(`Run ${gray(`${prog.name()} --help`)} to see all options.`);
    process.exit(1);
  }

  const absoluteProjectDir = resolve(projectDir);

  await createBackyard({
    projectDir: absoluteProjectDir,
    template,
  });

  const table = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    style: { 'padding-left': 2, 'padding-right': 2 },
  });
  table.push(
    [''],
    [green(bold('Done!'))],
    ['Welcome to Backyard'],
    [''],
    ['Your template is installed and ready to use'],
    ['start by running:'],
    [''],
    ['yarn backyard init'],
    [' '],
    [gray('Get some documentation:')],
    [gray('https://github.com/elwood-technology/backyard/tree/main/docs')],
    [''],
    [gray('Ask a question:')],
    [gray('https://github.com/elwood-technology/backyard/discussions')],
    [''],
  );
  console.log(table.toString());
}

main().catch((err) => {
  const table = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    style: { 'padding-left': 2, 'padding-right': 2 },
  });
  table.push(
    [''],
    [red(bold('Error:'))],
    [err.message],
    [''],
    [gray('Please report it as a bug at ')],
    [gray('https://github.com/elwood-technology/backyard/issues/new')],
    [''],
  );
  console.log(table.toString());
});
