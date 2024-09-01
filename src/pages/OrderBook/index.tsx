import styled from "styled-components";
import Table from "../../components/Table";
import { THEME } from "../../common/theme";
import { tableConfigs } from "./constant";
import useOrderBookQuote, { Direction } from "./useOrderBookQuote";
import ArrowIcon from "../../components/icons/Arrow";
import numeral from "numeral";
import QuoteTable from "./QuoteTable";

const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
  padding: 5px 10px;
`;

const BalanceText = styled.div<{ color?: string; backgroundColor?: string }>`
  font-size: 20px;
  font-weight: bold;
  ${({ color }) => (color ? `color: ${color};` : "")}
  ${({ backgroundColor }) =>
    backgroundColor ? `background-color: ${backgroundColor};` : ""}
  margin: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LastPriceArrow = styled(ArrowIcon)<{ direction: Direction }>`
  font-size: 20px;
  margin-left: 10px;
  transform: rotate(
    ${({ direction }) => (direction === "down" ? "180deg" : "0deg")}
  );
`;

function getLastPriceThemeByDirection(direction: Direction): {
  color: string;
  bgColor: string;
} {
  switch (direction) {
    case "up":
      return {
        color: THEME.colors.textBuy,
        bgColor: THEME.colors.bgBuy,
      };
    case "down":
      return {
        color: THEME.colors.textSell,
        bgColor: THEME.colors.bgSell,
      };
    case "flat":
    default:
      return {
        color: THEME.colors.textEqual,
        bgColor: THEME.colors.bgEqual,
      };
  }
}

const OrderBook = () => {
  const { askData, bidData, lastPrice, isReadyChannel } = useOrderBookQuote();

  if (!isReadyChannel.length) {
    return <div>Loading...</div>;
  }

  const lastPriceThemeColor = getLastPriceThemeByDirection(lastPrice.direction);
  return (
    <>
      <Title>Order Book</Title>
      <Table.Row isHeader>
        {tableConfigs.map((item) => (
          <Table.Cell key={`header-${item.key}`}>{item.label}</Table.Cell>
        ))}
      </Table.Row>
      <QuoteTable
        configs={tableConfigs}
        data={askData}
        type="sell"
      />
      <BalanceText
        color={lastPriceThemeColor.color}
        backgroundColor={lastPriceThemeColor.bgColor}
      >
        {numeral(lastPrice.price).format("0,0.0")}
        {lastPrice.direction !== "flat" && (
          <LastPriceArrow
            direction={lastPrice.direction}
            color={lastPriceThemeColor.color}
            size={18}
          />
        )}
      </BalanceText>
      <QuoteTable
        configs={tableConfigs}
        data={bidData}
        type="buy"
      />
    </>
  );
};

export default OrderBook;
