import { basename, resolve } from 'path';

import { Command } from 'commander';
import { green, cyan, red } from 'chalk';

import { createBackyard } from './create';

type Options = {
  ['project-dir']: string;
  typescript?: boolean;
};

const pkg = require('../package.json');

async function main(): Promise<void> {
  let projectDir: string = '';

  const prog = new Command(pkg.name)
    .version(pkg.version)
    .usage(`${green('<project-dir>')} [options]`)
    .arguments('<project-dir>')
    .option('-ts, --typescript')
    .option('-n, --name [name]', 'Project Name')
    .action((dir) => {
      projectDir = dir;
    })
    .parse(process.argv);

  const { typescript } = prog.opts() as Options;

  if (!projectDir) {
    console.log();
    console.log('Please specify the project directory:');
    console.log(`  ${cyan(prog.name())} ${green('<project-dir>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${cyan(prog.name())} ${green('by')}`);
    console.log();
    console.log(`Run ${cyan(`${prog.name()} --help`)} to see all options.`);
    process.exit(1);
  }

  const absoluteProjectDir = resolve(projectDir);
  const projectName = basename(absoluteProjectDir);

  await createBackyard({
    projectDir: absoluteProjectDir,
    projectName,
    template: typescript ? 'typescript' : 'default',
  });
}

main().catch((err) => {
  console.log(red('Unexpected error. Please report it as a bug:'));
  console.log(err.message);
});
