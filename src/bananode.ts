import { NanoNode } from "nano-account-crawler/dist/nano-node";
import * as fetch from 'node-fetch';
import { NODE_RPC_URL } from "./constants";

export const bananode = new NanoNode(NODE_RPC_URL, fetch);
