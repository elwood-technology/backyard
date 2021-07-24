import { build } from 'gluegun';

build('backyard')
  .src(__dirname, {
    commandFilePattern: [`*.{js,ts}`, `!*.test.{js,ts}`, `!*.d.{js,ts}`],
    extensionFilePattern: [`*.{js,ts}`, `!*.test.{js,ts}`, `!*.d.{js,ts}`],
  })
  .help()
  .version()
  .defaultCommand()
  .create()
  .run();
