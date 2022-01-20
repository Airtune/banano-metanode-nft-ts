import { TAccount } from "./types/banano";

export const config: { defaultRepresentative: TAccount, bananodeURLs: string[] } = {
  defaultRepresentative: "ban_3catgir1p6b1edo5trp7fdb8gsxx4y5ffshbphj73zzy5hu678rsry7srh8b",
  bananodeURLs: [
    "https://kaliumapi.appditto.com/api"
  ]
};

export const setDefaultRepresentative = (representative: TAccount) => {
  config.defaultRepresentative = representative;
};
