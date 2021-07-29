import { NanoBlockInterface } from './nano-block-interface';

export interface NanoAccountIterableInterface extends AsyncIterable<NanoBlockInterface> {
  account: string;
  firstBlock: () => NanoBlockInterface;
}
