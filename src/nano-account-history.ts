import { NanoBlockInterface } from './interfaces/nano-block-interface'
import { NanoAccountIterableInterface } from './interfaces/nano-account-iterable-interface'

// Variant of NanoAccountCrawler for when you already have the whole account history
// and account info available locally.
export class NanoAccountHistory implements NanoAccountIterableInterface {
  public account: string;
  private accountHistory;
  private confirmationHeight: BigInt;

  constructor(account: string, accountHistory: any, accountInfo: any) {
    this.account = account;
    this.accountHistory = accountHistory;
    this.confirmationHeight = BigInt('' + accountInfo['confirmation_height']);
  }

  async initialize() {
    // do nothing
  }

  firstBlock(): NanoBlockInterface {
    const block = this.accountHistory['history'][0];
    const blockHeight = BigInt('' + block['height']);

    if (blockHeight <= BigInt('0') || blockHeight > this.confirmationHeight) {
      throw Error(`NotConfirmed: first block in account history not confirmed for account: ${this.account}`);
    }

    return block;
  }

  [Symbol.asyncIterator](): AsyncIterator<NanoBlockInterface> {
    if (this.confirmationHeight <= BigInt('0')) {
      throw Error(`UnconfirmedAccount: confirmationHeight for account is: ${this.confirmationHeight}`);
    }

    let history = this.accountHistory['history'];
    let historyIndex = 0;

    return {
      next: async () => {
        const block = history[historyIndex];
        const blockHeight = BigInt('' + block['height']);

        if (blockHeight <= BigInt('0') || historyIndex >= history.length) {
          return { value: undefined, done: true };
        }

        historyIndex += 1;
        return { value: block, done: false };
      }
    };
  }
}
