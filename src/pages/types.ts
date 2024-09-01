export type Quote = string[];

export const TOPIC = {
  updateBTCPFC: "update:BTCPFC_0",
  tradeHistoryApiBTCPFC: "tradeHistoryApi:BTCPFC",
} as const;

export type TopicType =
  | typeof TOPIC.updateBTCPFC
  | typeof TOPIC.tradeHistoryApiBTCPFC;

export interface OrderBookWebsocketResponse {
  topic: typeof TOPIC.updateBTCPFC;
  data: {
    bids: Quote[];
    asks: Quote[];
    seqNum: number;
    prevSeqNum: number;
    type: "snapshot" | "delta";
    timestamp: number;
    symbol: string;
  };
}

export interface LastPriceItem {
  symbol: string;
  side: "SELL" | "BUY";
  size: number;
  price: number;
  tradeId: number;
  timestamp: number;
}

export interface LastPriceWebSocketResponse {
  topic: typeof TOPIC.tradeHistoryApiBTCPFC;
  data: LastPriceItem[];
}

export interface SubscribeEventWebSocketResponse {
  event: "subscribe" | "unsubscribe";
  channel: TopicType[];
}

export type WebSocketResponseType =
  | OrderBookWebsocketResponse
  | LastPriceWebSocketResponse
  | SubscribeEventWebSocketResponse;

export const tableKey = {
  price: "price",
  size: "size",
  total: "total",
} as const;

export type TableKeyType =
  | typeof tableKey.price
  | typeof tableKey.size
  | typeof tableKey.total;
