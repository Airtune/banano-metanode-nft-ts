import * as IpfsHash from 'pure-ipfs-only-hash';
import { ITemplateJson } from "./interfaces/template-json";

const blockHashPattern: RegExp = new RegExp('^[0-9A-Za-z]{64}$');
const maxSupplyPattern: RegExp = new RegExp('^[0-9]{1,39}$');
const accountPattern: RegExp = new RegExp('(ban|nano|xrp)\_(1|3)[13-9a-km-uw-z]{59}');

export class MetaTemplate {
  private ipfsCid: string;
  private rawTemplate: string;
  private template: ITemplateJson;
  private maxSupply: (BigInt|undefined);
  private validated: boolean;

  constructor(rawTemplate: string, ipfsCid: string) {
    this.ipfsCid = ipfsCid;
    this.rawTemplate = rawTemplate;
    this.validated = false;
  }
  
  initialize() {
    if (typeof(this.template) !== 'object') {
      this.template = JSON.parse(this.rawTemplate);
    }
  }

  getIssuer(): string {
    return this.template.issuer;
  }

  getPrevious(): string {
    return this.template.previous;
  }

  getIpfsCid(): string {
    return this.ipfsCid;
  }

  getArtDataIpfsCid(): (string|undefined) {
    return this.template.art_data_ifps_cid;
  }

  hasLimitedSupply(): boolean {
    return this.template.hasOwnProperty('max_supply');
  }

  getMaxSupply(): (BigInt|undefined) {
    if (typeof(this.maxSupply) === 'bigint') {
      return this.maxSupply;
    }

    if (typeof(this.template.max_supply) === 'string' && maxSupplyPattern.test(this.template.max_supply)) {
      try {
        const maxSupply = BigInt(this.template.max_supply);
        this.maxSupply = maxSupply;
        return maxSupply;
      } catch(SyntaxError) {
        return undefined;
      }
    }

    return undefined;
  }

  async initializeAndValidate() {
    if (this.validated) {
      return;
    }

    if (typeof(this.rawTemplate) !== 'string') {
      throw Error(`InvalidTemplate: Unexpected template raw data. Expected type to be 'string'. Got type: '${typeof(this.rawTemplate)}'`);
    }

    const actualIpfsCid = await IpfsHash.of(this.rawTemplate);
    if (actualIpfsCid !== this.ipfsCid) {
      throw Error(`InvalidTemplate: IpfsHash mismatch. Expected: ${this.ipfsCid} but got: ${actualIpfsCid}`);
    }

    if (typeof(this.rawTemplate) !== 'string') {
      throw Error(`InvalidTemplate: Unexpected template raw data. Expected type to be 'string'. Got type: '${typeof(this.rawTemplate)}'`);
    }

    this.initialize();

    if (typeof(this.template) !== 'object') {
      throw Error(`InvalidTemplate: Unexpected template metadata. Expected type to be 'object'. Got type: '${typeof(this.template)}'`);
    }

    if (this.template.command !== 'nft_template') {
      throw Error(`InvalidTemplate: Unexpected command in template template. Got: ${this.template.command}`);
    }
  
    if (this.template.version !== '0.0.1') {
      throw Error(`InvalidTemplate: Unexpected version in template template. Got: ${this.template.version}`);
    }

    if (typeof(this.template.previous) !== 'string' && !blockHashPattern.test(this.template.previous)) {
      throw Error(`InvalidTemplate: Invalid block hash for 'previous'. Got: ${this.template.previous}`);
    }

    if (typeof(this.template.issuer) !== 'string' && !accountPattern.test(this.template.issuer)) {
      throw Error(`InvalidTemplate: Invalid issuer. Got: ${this.template.issuer}`);
    }

    if (this.hasLimitedSupply() && this.getMaxSupply() === undefined) {
      throw Error(`InvalidTemplate: Unparseable value for max_supply. Got: ${this.template.max_supply}`);     
    }

    this.validated = true;
  }
}
