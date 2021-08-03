import { join, resolve } from 'path';
import { EOL } from 'os';

import { Command } from 'commander';
import { green, gray, red, bold, yellow } from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';

import { createBackyard, CreateBackyardTools } from './create';
import { writeFileSync } from 'fs';

type Options = {
  ['project-dir']: string;
  typescript?: boolean;
  template?: string;
};

const pkg = require('../package.json');
const errorLogBuffer: string[] = [];
const spin = ora('Creating Backyard');

async function main(): Promise<void> {
  let projectDir: string = '';

  const prog = new Command(pkg.name)
    .version(pkg.version)
    .usage(`${green('<project-dir>')} [options]`)
    .argument('<project-dir>')
    .option('-t, --template <template>')
    .option('-n, --npm', 'Use NPM instead of Yarn')
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
    console.log(`  ${gray(prog.name())} ${green('create-backyard')}`);
    console.log();
    console.log(`Run ${gray(`${prog.name()} --help`)} to see all options.`);
    process.exit(1);
  }

  const absoluteProjectDir = resolve(projectDir);

  spin.start();

  const tools: CreateBackyardTools = {
    spin(text: string) {
      spin.text = text;
    },
    log: console.log,
    errorLog(...args: string[]) {
      errorLogBuffer.push(...args);
    },
  };

  await createBackyard(
    {
      projectDir: absoluteProjectDir,
      template,
    },
    tools,
  );

  spin.stop();

  const table = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    style: { 'padding-left': 2, 'padding-right': 2 },
  });
  table.push(
    [''],
    [green(bold('SUCCESS!'))],
    ['Welcome to Backyard'],
    [''],
    ['Your template is installed and ready to use'],
    ['start by running:'],
    [''],
    ['yarn backyard init'],
    [' '],
    [yellow('Get some documentation:')],
    [yellow('https://github.com/elwood-technology/backyard/tree/main/docs')],
    [''],
    [yellow('Ask a question:')],
    [yellow('https://github.com/elwood-technology/backyard/discussions')],
    [''],
  );
  console.log(table.toString());
}

main().catch((err) => {
  spin.stop();

  if (errorLogBuffer.length > 0) {
    writeFileSync(
      join(process.cwd(), 'create-backyard-error.log'),
      errorLogBuffer.join(EOL),
    );
  }

  const table = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    style: { 'padding-left': 2, 'padding-right': 2 },
  });
  table.push(
    [''],
    [red(bold('Error Creating Backyard:'))],
    [red(bold('------------------------'))],
    [err.message],
    [''],
    [gray('If you think this is a bug, please report it at:')],
    [gray('https://github.com/elwood-technology/backyard/issues/new')],
    [''],
  );
  console.log(table.toString());
});
