import { JsonObject } from '@backyard/types';
import { Block, Argument, Attribute } from 'terraform-generator';

export class TerraformBlock extends Block {
  readonly type: string;

  constructor(args: JsonObject) {
    super('terraform', [], args);
    this.type = 'terraform';
  }

  asArgument(): Argument {
    if (this.getArgument('alias')) {
      return new Argument(`${this.type}.${this.getArgument('alias')}`);
    }
    throw new Error('Provider has no alias.');
  }

  attr(_name: string): Attribute {
    throw new Error('Inaccessible method.');
  }
}
