export class WriteAccessError extends Error {
  constructor(public path: string) {
    super();
  }

  get message() {
    return `Unable to write to path: "${this.path}"`;
  }
}

export class InvalidateTemplate extends Error {
  constructor(public template: string) {
    super();
  }

  get message() {
    return `Unable to find template "${this.template}"`;
  }
}
