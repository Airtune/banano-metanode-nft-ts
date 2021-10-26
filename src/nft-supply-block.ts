import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import * as bananojs from '@bananocoin/bananojs';
import { bananoIpfs } from "./banano-ipfs";

// meta_ledger_protocol/nft_supply_block.md > nft_supply_representative
const nftSupplyHexPattern = /^51BACEED6078000000(?<major>[0-9A-F]{10})(?<minor>[0-9A-F]{10})(?<patch>[0-9A-F]{10})(?<maxSupply>[0-9A-F]{16})$'/i;

class NFTData {
  private nftSupplyBlock: INanoBlock;
  private firstAssetMintBlock: INanoBlock;
  private version: string;
  private maxSupply: BigInt;
  private ipfsCid: string;

  constructor(nftSupplyBlock: INanoBlock, firstAssetMintBlock: INanoBlock) {
    this.nftSupplyBlock = nftSupplyBlock;
    this.firstAssetMintBlock = firstAssetMintBlock;
    this.parseRepresentativeHex();
  }

  private parseRepresentativeHex() {
    const nftSupplyRepresentative = this.nftSupplyBlock.representative;
    const nftSupplyHex = bananojs.getAccountPublicKey(nftSupplyRepresentative);
    const match = nftSupplyHex.match(nftSupplyHexPattern);
    const major: BigInt = BigInt(`0x${match.groups.major}`);
    const minor: BigInt = BigInt(`0x${match.groups.minor}`);
    const patch: BigInt = BigInt(`0x${match.groups.patch}`);
    
    this.version = `${major}.${minor}.${patch}`;
    this.maxSupply = BigInt(`0x${match.groups.maxSupply}`);

    const ipfsRepresentative = this.firstAssetMintBlock.representative;
    this.ipfsCid = bananoIpfs.accountToIpfsCidV0(ipfsRepresentative);
  }

  getVersion(): string {
    return this.version;
  }

  getMaxSupply(): BigInt {
    return this.maxSupply;
  }

  getIpfsCid(): string {
    return this.ipfsCid;
  }

  validate(): boolean {
    return true;
  }
}
