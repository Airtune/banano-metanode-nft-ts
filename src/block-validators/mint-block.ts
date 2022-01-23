import * as bananojs from "@bananocoin/bananojs";
import { SUPPLY_HEX_PATTERN } from "../constants";
import { accountDataType } from "../account-data-type";
import { TAccount, TBlockHash } from "../types/banano";
import { IMintBlock } from "../interfaces/mint-block";

function validateMintRepresentative(block: IMintBlock) {
  const representative = block.representative as TAccount;
  const representativeType = accountDataType(representative);
  if (representativeType !== "unknown") {
    throw Error(`UnexpectedMintRepresentative: Expected representative to encode IPFS CID. Got type: ${representativeType} for ${representative}`);
  }
  const representativeHex = bananojs.getAccountPublicKey(representative);

  if (representativeHex.match(SUPPLY_HEX_PATTERN)) {
    throw Error(`MintBlockError: Expected metadataRepresentative encoded from IPFS CID. Got nftSupplyRepresentative: ${representative}`);
  }
}

export function validateMintBlock(mintBlock: IMintBlock) {
  if (mintBlock.type === 'state') {
    switch (mintBlock.subtype) {
      case 'send':
        validateMintRepresentative(mintBlock);
        break;
      
      case 'change':
        validateMintRepresentative(mintBlock);
        break;
      
      case 'open':
      case 'receive':
      case 'epoch':
        throw Error(`MintBlockError: Unexpected block subtype. Expected 'send' or 'change'. Got: '${mintBlock.subtype}' for block: ${mintBlock.hash}`);
    
      default:
        throw Error(`MintBlockError: Unknown block subtype. Expected 'send' or 'change'. Got: ${mintBlock.subtype} for block: ${mintBlock.hash}`);

    }
  } else {
    throw Error(`MintBlockError: Unexpected block type. Expected 'state'. Got: '${mintBlock.type}' for block: ${mintBlock.hash}`);

  }
}
