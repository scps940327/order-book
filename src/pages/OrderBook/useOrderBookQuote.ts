import { useCallback, useEffect, useRef, useState } from "react";
import {
  LastPriceItem,
  Quote,
  TableKeyType,
  TOPIC,
  TopicType,
  WebSocketResponseType,
} from "../types";
import numeral from "numeral";

export interface LastPriceData extends LastPriceItem {
  direction: Direction;
}
export type QuoteMap = Map<string, { prev?: Quote; current: Quote }>;
export type QuoteTableDataItem = Record<TableKeyType, string> & {
  isNew: boolean;
  direction: Direction;
};
export type Direction = "up" | "down" | "flat";

const DEFAULT_LAST_PRICE_DATA: LastPriceData = {
  symbol: "",
  side: "SELL",
  size: 0,
  price: 0,
  direction: "flat",
  tradeId: 0,
  timestamp: 0,
};

function formatQuoteDataItem({
  quoteMapValues,
  currentIndex,
  acc,
}: {
  quoteMapValues: { prev?: Quote; current: Quote }[];
  currentIndex: number;
  acc: QuoteTableDataItem[];
}): QuoteTableDataItem {
  const size = Number(quoteMapValues[currentIndex].current[1] ?? 0);

  return {
    price: numeral(quoteMapValues[currentIndex].current[0]).format("0,0.0"),
    size: numeral(quoteMapValues[currentIndex].current[1]).format("0,0"),
    total: numeral((numeral(acc[currentIndex + 1]?.total).value() ?? 0) + size).format(
      "0,0"
    ),
    isNew: !quoteMapValues[currentIndex].prev,
    direction: getDirection(
      Number(quoteMapValues[currentIndex].prev?.[1]) ?? size,
      size
    ),
  };
}

function formatQuoteData(askQuoteMap: QuoteMap, bidQuoteMap: QuoteMap) {
  const askQuoteMapValues = Array.from(askQuoteMap.values())
    .sort(
      (next, current) => Number(current.current[0]) - Number(next.current[0])
    )
    .slice(0, 8);
  const bidQuoteMapValues = Array.from(bidQuoteMap.values())
    .sort(
      (next, current) => Number(current.current[0]) - Number(next.current[0])
    )
    .slice(0, 8);
  const size = askQuoteMapValues.length;
  const lastIndex = size - 1;
  return new Array(size)
    .fill(1)
    .reduce<Record<"askData" | "bidData", QuoteTableDataItem[]>>(
      (result, _, rowIndex) => {
        const currentIndex = lastIndex - rowIndex;
        const nextResult = { ...result };
        nextResult.askData[currentIndex] = formatQuoteDataItem({
          quoteMapValues: askQuoteMapValues,
          currentIndex,
          acc: result.askData,
        });
        nextResult.bidData[currentIndex] = formatQuoteDataItem({
          quoteMapValues: bidQuoteMapValues,
          currentIndex,
          acc: result.bidData,
        });
        return nextResult;
      },
      { askData: [], bidData: [] }
    );
}

function getDirection(prev: number, current: number): Direction {
  if (current > prev) {
    return "up";
  }
  if (current < prev) {
    return "down";
  }
  return "flat";
}

const useOrderBookQuote = () => {
  const askQuoteMapRef = useRef<QuoteMap>(new Map());
  const bidQuoteMapRef = useRef<QuoteMap>(new Map());
  const [askData, setAskData] = useState<QuoteTableDataItem[]>([]);
  const [bidData, setBidData] = useState<QuoteTableDataItem[]>([]);
  const [lastPrice, setLastPrice] = useState<LastPriceData>(
    DEFAULT_LAST_PRICE_DATA
  );
  const [isReadyChannel, setIsReadyChannel] = useState<TopicType[]>([]);

  const updateQuoteData = useCallback(
    (askQuoteMap: QuoteMap, bidQuoteMap: QuoteMap) => {
      const result = formatQuoteData(askQuoteMap, bidQuoteMap);
      setAskData(result.askData);
      setBidData(result.bidData);
    },
    []
  );

  useEffect(() => {
    const ws = new WebSocket("wss://ws.btse.com/ws/oss/futures", []);
    ws.onopen = (e) => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [TOPIC.tradeHistoryApiBTCPFC, TOPIC.updateBTCPFC],
        })
      );
    };

    ws.onmessage = (e: MessageEvent<string>) => {
      const res: WebSocketResponseType = JSON.parse(e.data);
      if ("event" in res) {
        setIsReadyChannel((prev) =>
          res.event === "subscribe"
            ? Array.from(new Set([...prev, ...res.channel]))
            : prev.filter((each) => !res.channel.includes(each))
        );
      } else if (
        "topic" in res &&
        res.topic === TOPIC.updateBTCPFC &&
        res.data.seqNum - res.data.prevSeqNum !== 1
      ) {
        ws.send(
          JSON.stringify({
            op: "unsubscribe",
            args: [TOPIC.tradeHistoryApiBTCPFC, TOPIC.updateBTCPFC],
          })
        );
        ws.send(
          JSON.stringify({
            op: "subscribe",
            args: [TOPIC.tradeHistoryApiBTCPFC, TOPIC.updateBTCPFC],
          })
        );
      } else if (
        "topic" in res &&
        res.topic === TOPIC.updateBTCPFC &&
        res.data?.type === "snapshot"
      ) {
        const nextAskQuoteMap = new Map(
          res.data.asks.map((item) => [
            item[0],
            {
              prev: item,
              current: item,
            },
          ])
        );
        const nextBidQuoteMap = new Map(
          res.data.bids.map((item) => [
            item[0],
            {
              prev: item,
              current: item,
            },
          ])
        );
        askQuoteMapRef.current = nextAskQuoteMap;
        bidQuoteMapRef.current = nextBidQuoteMap;
        updateQuoteData(nextAskQuoteMap, nextBidQuoteMap);
      } else if (
        "topic" in res &&
        res.topic === TOPIC.updateBTCPFC &&
        res.data?.type === "delta"
      ) {
        const nextAskQuoteMap = new Map(askQuoteMapRef.current);
        const nextBidQuoteMap = new Map(bidQuoteMapRef.current);
        res.data.asks.forEach((item) => {
          if (item[1] === "0") {
            nextAskQuoteMap.delete(item[0]);
          } else {
            nextAskQuoteMap.set(item[0], {
              prev: askQuoteMapRef.current.get(item[0])?.current,
              current: item,
            });
          }
        });
        res.data.bids.forEach((item) => {
          if (item[1] === "0") {
            nextBidQuoteMap.delete(item[0]);
          } else {
            nextBidQuoteMap.set(item[0], {
              prev: bidQuoteMapRef.current.get(item[0])?.current,
              current: item,
            });
          }
        });
        askQuoteMapRef.current = nextAskQuoteMap;
        bidQuoteMapRef.current = nextBidQuoteMap;
        updateQuoteData(nextAskQuoteMap, nextBidQuoteMap);
      } else if (
        "topic" in res &&
        res.topic === TOPIC.tradeHistoryApiBTCPFC &&
        res.data[0]
      ) {
        setLastPrice((prev) => ({
          ...res.data[0],
          direction: getDirection(prev.price, res.data[0].price),
        }));
      }
    };

    ws.onerror = () => {
      console.error("websocket error");
    };

    return () => {
      ws.close();
    };
  }, [updateQuoteData]);

  return {
    askQuoteMapRef,
    bidQuoteMapRef,
    askData,
    bidData,
    lastPrice,
    isReadyChannel,
  };
};

export default useOrderBookQuote;
