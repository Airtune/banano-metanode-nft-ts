import { bananode } from "../bananode";

// Makes a request to the Banano node and returns the major and minor version from the node_vendor field
export const getBananodeVersion = async (): Promise<{major: number, minor: number}> => {
  try {
    const nodeVersionPattern = /(?<major>\d+)(\.(?<minor>\d+))?[^\d]*/;
    const versionResponse = await bananode.jsonRequest({ action: "version" });
    
    if (typeof versionResponse !== 'object') {
      throw Error(`BananoNodeRPCError: Unexpected response to 'version': ${versionResponse}`);
    }

    if (typeof versionResponse["node_vendor"] !== 'string') {
      throw Error(`BananoNodeRPCUnexpectedValue: Expected 'node_vendor' to be of type string, got: ${versionResponse["node_vendor"]}`);
    }

    const match = versionResponse["node_vendor"].match(nodeVersionPattern);
    const major = parseInt(match.groups.major);
    const minor = parseInt(match.groups.minor);

    return { major, minor };
  } catch(error) {
    throw(error);
  }
}
