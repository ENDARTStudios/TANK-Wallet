export interface LndChannel { fundingTx: string; partnerPubkey: string; capacity: number; state: string }

export function openChannel({ capacity, partnerPubkey }: { capacity: number; partnerPubkey: string }): LndChannel {
  return { fundingTx: `tx_${partnerPubkey.slice(0, 8)}`, partnerPubkey, capacity, state: "pending" };
}

export function closeChannel(channel: LndChannel): { closingTx: string; state: string } {
  return { closingTx: `close_${channel.fundingTx.slice(4, 8)}`, state: "closed" };
}

export function listChannels(): LndChannel[] {
  return [{ fundingTx: "tx_mock_001", partnerPubkey: "03fakepubkeymock0000000000000000", capacity: 500000, state: "active" }];
}
