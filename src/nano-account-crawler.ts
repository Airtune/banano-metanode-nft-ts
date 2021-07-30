import { NanoBlockInterface } from './interfaces/nano-block-interface'
import { NanoAccountIterableInterface } from './interfaces/nano-account-iterable-interface'
import { NanoNode } from './nano-node';

// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountCrawler implements NanoAccountIterableInterface {
  public nanoNode: NanoNode;
  public account: string;
  public head: string;

  private accountHistory;
  private accountInfo;
  private confirmationHeight: BigInt;

  constructor(nanoNode: NanoNode, account: string, head: string) {
    this.nanoNode = nanoNode;
    this.account = account;
    this.head = head;
    this.accountHistory = null;
    this.accountInfo = null;
  }

  async initialize() {
    const historySegmentPromise = this.nanoNode.getHistoryAfterHead(this.account, this.head);
    const accountInfoPromise    = this.nanoNode.getAccountInfo(this.account);

    this.accountHistory = await historySegmentPromise;
    this.accountInfo    = await accountInfoPromise;

    this.confirmationHeight = BigInt('' + this.accountInfo['confirmation_height']);
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
    if (this.accountHistory === null || this.accountInfo === null || this.confirmationHeight <= BigInt('0')) {
      throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
    }

    const maxRpcIterations = 1000;
    let rpcIterations = 0;

    let history = this.accountHistory['history'];
    let historyIndex = 0;

    return {
      next: async () => {
        const block = history[historyIndex];
        const blockHeight = BigInt('' + block['height']);

        if (blockHeight <= BigInt('0')) {
          return { value: undefined, done: true };
        }

        // If it's the last block in the history returned by the nano node but it isn't the latest
        // confirmed block it's probably because the node didn't return the full history.
        // In this case fetch the next segment of the history following the last block.
        if (historyIndex == (history.length - 1) && this.nanoNode.hasMoreHistory(history, this.confirmationHeight)) {
          // Guard against infinite loops and making too many RPC calls.
          rpcIterations += 1;
          if (rpcIterations > maxRpcIterations) {
            throw Error(`TooManyRpcIterations: Expected to fetch full history from nano node within ${maxRpcIterations} requests.`);
          }
          const _accountHistory = await this.nanoNode.getHistoryAfterHead(this.account, block['hash']);
          history = _accountHistory['history'];
          historyIndex = 0;
          return { value: block, done: false };
        }

        historyIndex += 1;
        return { value: block, done: false };
      }
    };
  }
}
