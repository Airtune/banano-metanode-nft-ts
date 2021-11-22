import * as bananojs from '@bananocoin/bananojs';
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { SUPPLY_HEX_PATTERN } from "../constants";

function validateMintRepresentative(block: INanoBlock) {
  const representativeHex = bananojs.getAccountPublicKey(block.representative);

  if (representativeHex.match(SUPPLY_HEX_PATTERN)) {
    throw Error(`MintBlockError: Expected metadataRepresentative encoded from IPFS CID. Got nftSupplyRepresentative: ${block.representative}`);
  }
}

export function validateMintBlock(mintBlock: INanoBlock) {
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
