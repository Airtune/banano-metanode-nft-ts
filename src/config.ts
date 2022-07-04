import { TAccount } from "./types/banano";

export const config: { defaultRepresentative: TAccount } = {
  defaultRepresentative: "ban_3catgir1p6b1edo5trp7fdb8gsxx4y5ffshbphj73zzy5hu678rsry7srh8b"
};

export const setDefaultRepresentative = (representative: TAccount) => {
  config.defaultRepresentative = representative;
};
