import { gray, red, bold } from 'chalk';
import Table from 'cli-table3';

import type { Toolbox } from '../types';

export default async function errorBox(tools: Toolbox): Promise<void> {
  tools.errorBox = async (err: Error) => {
    const { print } = tools;

    const table = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: { 'padding-left': 2, 'padding-right': 2 },
    });
    table.push(
      [''],
      [red(bold('Error:'))],
      [red(bold('--------'))],
      [err.message],
      [''],
      [gray('If you think this is a bug, please report it at:')],
      [gray('https://github.com/elwood-technology/backyard/issues/new')],
      [gray('Use `DEBUG=backyard:*` for more information')],
      [''],
    );

    print.info(table.toString());
  };
}
