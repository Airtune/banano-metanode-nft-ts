const blockHashPattern: RegExp = new RegExp('^[0-9A-Za-z]{64}$');
const maxSupplyPattern: RegExp = new RegExp('^[0-9]{1,39}$')

export class MetaTemplate {
  private ipfsCid: string;
  private metadata: any;
  private maxSupply: (BigInt|undefined);

  constructor(metadata: any, ipfsCid: string) {
    this.ipfsCid = ipfsCid;
    this.metadata = metadata;
  }

  getIssuer(): string {
    return this.metadata['issuer'];
  }

  getPrevious(): string {
    return this.metadata['previous'];
  }

  getIpfsCid(): string {
    return this.ipfsCid;
  }

  getArtDataIpfsCid(): (string|undefined) {
    return this.metadata['art_data_ipfs_cid'];
  }

  hasLimitedSupply(): boolean {
    return this.metadata.hasOwnProperty('max_supply');
  }

  getMaxSupply(): (BigInt|undefined) {
    if (typeof(this.maxSupply) === 'bigint') {
      return this.maxSupply;
    }

    if (typeof(this.metadata['max_supply']) === 'string' && maxSupplyPattern.test(this.metadata['max_supply'])) {
      try {
        const maxSupply = BigInt(this.metadata['max_supply']);
        this.maxSupply = maxSupply;
        return maxSupply;
      } catch(SyntaxError) {
        return undefined;
      }
    }

    return undefined;
  }

  validate() {
    if (typeof(this.metadata) !== 'object') {
      throw Error(`InvalidMetadata: Unexpected template metadata. Expected type to be 'object'. Got type: '${typeof(this.metadata)}'`);
    }

    if (this.metadata['command'] !== 'nft_template') {
      throw Error(`InvalidMetadata: Unexpected command in template metadata. Got: ${this.metadata.command}`);
    }
  
    if (this.metadata['version'] !== '0.0.1') {
      throw Error(`InvalidMetadata: Unexpected version in template metadata. Got: ${this.metadata.version}`);
    }

    if (typeof(this.metadata['previous']) !== 'string' && !blockHashPattern.test(this.metadata['previous'])) {
      throw Error(`InvalidMetadata: Invalid block hash for 'previous'. Got: ${this.metadata['previous']}`);
    }

    if (this.hasLimitedSupply() && this.getMaxSupply() === undefined) {
      throw Error(`InvalidMetadata: Unparseable value for max_supply. Got: ${this.metadata['max_supply']}`);     
    }
  }
}
