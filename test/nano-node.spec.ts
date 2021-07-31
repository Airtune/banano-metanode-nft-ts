import { expect } from 'chai';
import * as fetch from 'node-fetch';
import { NanoNode } from "../src/nano-node";

const bananode = new NanoNode('https://kaliumapi.appditto.com/api', fetch);
const account = 'ban_3airtunegymgr6b8t9b8muh7upg39bcheahxqwkbtu96ux69pzn1idcu34wz';
const head = 'AC4C7C242703B72E73664D367685107E04C3A5FE91E95EC9147E8A3778BC6437';

describe('NanoNode', () => {
  it('getHistoryAfterHead', async () => {
    const accountHistory = await bananode.getHistoryAfterHead(account, head);
    expect(accountHistory).to.be.an('object').that.include.all.keys('account', 'history');
    expect(accountHistory.account).to.equal(account);
    expect(accountHistory.history[0].previous).to.equal(head);
  });
});
