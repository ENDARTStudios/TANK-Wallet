export async function fetchBlockstreamTxs(address: string, signal?: AbortSignal): Promise<{ txid: string }[]> {
  void address;
  void signal;
  return [{ txid: "blockstream_mock_txid" }];
}
