import { bananode } from "../bananode";
import { BLOCK_HASH_PATTERN } from "../constants";
import { IBananoBlock } from "../interfaces/banano-block";
import { TBlockHash, TBlockSubtype } from "../types/banano";

export const processBlock = async (block: IBananoBlock, subtype: TBlockSubtype, blockName: string): Promise<TBlockHash> => {
  const blockRequest: any = Object.assign({}, block);
  blockRequest.balance = block.balance.toString(10);

  const response = await bananode.jsonRequest({
    "action": "process",
    "json_block": "true",
    "subtype": subtype,
    "block": blockRequest
  });

  if (typeof response !== "object") {
    throw Error(`BananoNodeRPCError: Unexpected response for process ${blockName}, got: ${response}`);
  }

  if (response["error"]) {
    throw Error(`BananoNodeRPCError: Process ${blockName} block returned error: ${response["error"]}`);
  }

  if (!("" + response["hash"]).match(BLOCK_HASH_PATTERN)) {
    throw Error(`BananoNodeRPCError: Process ${blockName} block returned error: ${response["error"]}`);
  }

  return response["hash"];
}
