import {
  INanoAccountHistory,
  INanoAccountInfo,
  INanoAccountForwardIterable,
  INanoAccountBackwardIterable,
  INanoBlock
} from './interfaces/nano-interfaces';

// Variant of NanoAccountCrawler for when you already have the whole account history
// and account info available locally.
export class NanoAccountHistory {
  public account: string;
  private forwardHistory: INanoBlock[];
  private confirmationHeight: BigInt;

  constructor(account: string, forwardHistory: INanoBlock[], confirmation_height: BigInt) {
    this.account = account;
    this.forwardHistory = forwardHistory;
    this.confirmationHeight = confirmation_height;
  }

  getForwardIterable(): { [Symbol.asyncIterator]: () => AsyncIterator<INanoBlock> } {
    this.validateConfirmationHeight();
    const forwardIterable: INanoAccountForwardIterable = {
      firstBlock: () => {
        const block: INanoBlock = this.forwardHistory[0];
        const blockHeight = BigInt('' + block.height);
    
        if (blockHeight <= BigInt('0') || blockHeight > this.confirmationHeight) {
          throw Error(`NotConfirmed: first block in account history not confirmed for account: ${this.account}`);
        }
    
        return block;
      },
      [Symbol.asyncIterator]: () => {
        let i = 0;
        return {
          next: async () => {
            if (i >= this.forwardHistory.length) {
              return { value: undefined, done: true };
            }

            const block: INanoBlock = this.forwardHistory[i];
            const blockHeight = BigInt('' + block.height);
            if (blockHeight > this.confirmationHeight) {
              return { value: undefined, done: true };
            }

            i += 1;
            return { value: block, done: false };
          }
        }
      }
    };

    return forwardIterable;
  }

  getBackwardIterable(): { [Symbol.asyncIterator]: () => AsyncIterator<INanoBlock> } {
    this.validateConfirmationHeight();
    const backwardIterable: INanoAccountBackwardIterable = {
      [Symbol.asyncIterator]: () => {

        let i = this.forwardHistory.length - 1;
        // set i to latest confirmed block
        for (let _i = i; _i >= 0; _i--) {
          const block = this.forwardHistory[_i];
          const blockHeight = BigInt('' + block.height);
          if (blockHeight > BigInt('0') && blockHeight <= this.confirmationHeight) {
            i = _i;
            break;
          }
        }

        return {
          next: async () => {
            if (i >= 0) {
              const block: INanoBlock = this.forwardHistory[i];
              i -= 1;
              return { value: block, done: false };;
            }
            return { value: undefined, done: true };
          }
        }
      }
    };

    return backwardIterable;
  }

  private validateConfirmationHeight() {
    if (this.confirmationHeight <= BigInt('0')) {
      throw Error(`UnconfirmedAccount: confirmationHeight for account ${this.account} is: ${this.confirmationHeight}`);
    }
  }
}
