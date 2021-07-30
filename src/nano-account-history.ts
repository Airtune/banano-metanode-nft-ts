import {
  INanoAccountHistory,
  INanoAccountInfo,
  INanoAccountIterable,
  INanoBlock
} from './interfaces/nano-interfaces';

// Variant of NanoAccountCrawler for when you already have the whole account history
// and account info available locally.
export class NanoAccountHistory implements INanoAccountIterable {
  public account: string;
  private accountHistory: INanoAccountHistory;
  private confirmationHeight: BigInt;

  constructor(account: string, accountHistory: INanoAccountHistory, accountInfo: INanoAccountInfo) {
    this.account = account;
    this.accountHistory = accountHistory;
    this.confirmationHeight = BigInt('' + accountInfo.confirmation_height);
  }

  async initialize() {
    // do nothing
  }

  firstBlock(): INanoBlock {
    const block: INanoBlock = this.accountHistory.history[0];
    const blockHeight = BigInt('' + block.height);

    if (blockHeight <= BigInt('0') || blockHeight > this.confirmationHeight) {
      throw Error(`NotConfirmed: first block in account history not confirmed for account: ${this.account}`);
    }

    return block;
  }

  [Symbol.asyncIterator](): AsyncIterator<INanoBlock> {
    if (this.confirmationHeight <= BigInt('0')) {
      throw Error(`UnconfirmedAccount: confirmationHeight for account is: ${this.confirmationHeight}`);
    }

    let history = this.accountHistory.history;
    let historyIndex = 0;

    return {
      next: async () => {
        const block: INanoBlock = history[historyIndex];
        const blockHeight = BigInt('' + block.height);

        if (blockHeight <= BigInt('0') || historyIndex >= history.length) {
          return { value: undefined, done: true };
        }

        historyIndex += 1;
        return { value: block, done: false };
      }
    };
  }
}
