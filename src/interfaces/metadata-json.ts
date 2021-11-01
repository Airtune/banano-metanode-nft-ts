export interface IMetadataJSON {
  name: string;
  description: string;
  image: string;
  properties: {
    issuer: string,
    supply_block_hash: string,
    tips: { name: string, account: string }[]
  }
}
