import * as bananojs from "@bananocoin/bananojs";

export const generateWork = async (previous: string): Promise<string> => {
  // TODO: Settings to allow different sources for work like GPU and BoomPow.
  const work: string = bananojs.getWorkUsingCpu(previous, new Uint8Array(8));
  return work;
}
