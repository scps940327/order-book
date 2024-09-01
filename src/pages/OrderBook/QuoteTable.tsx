import styled from "styled-components";
import Table from "../../components/Table";
import { Direction, QuoteTableDataItem } from "./useOrderBookQuote";
import { TableConfig } from "./constant";
import { THEME } from "../../common/theme";
import { tableKey } from "../types";
import numeral from "numeral";

interface IProps {
  data: QuoteTableDataItem[];
  configs: TableConfig[];
  type: "sell" | "buy";
}
const themeColor = {
  new: {
    sell: THEME.colors.bgSell,
    buy: THEME.colors.bgBuy,
  },
  totalPercentage: {
    sell: THEME.colors.totalSell,
    buy: THEME.colors.totalBuy,
  },
};

const StyledTableContentRow = styled(Table.Row)<{
  type: "buy" | "sell";
  isNew?: boolean;
}>`
  ${({ isNew, type }) =>
    isNew ? `background-color: ${themeColor.new[type]};` : ""}
`;

const StyledTableCell = styled(Table.Cell)<{
  percentage: number;
  type: "buy" | "sell";
  direction?: Direction;
}>`
  position: relative;
  background-color: ${({ direction }) => {
    switch (direction) {
      case 'up':
        return THEME.colors.bgSizeUp;
      case 'down':
        return THEME.colors.bgSizeDown;
      default:
        return 'initial';
    }
  }}

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: ${({ percentage }) => percentage}%;
    height: 100%;
    background-color: ${({ type }) => themeColor.totalPercentage[type]};
  }
`;

const QuoteTable = ({ data, configs, type }: IProps) => {
  const baseTotal = numeral(data[0].total).value() ?? 0;
  return (
    <>
      {data.map((rowData) => (
        <StyledTableContentRow
          isNew={rowData.isNew}
          type={type}
        >
          {configs.map(({ key }) => (
            <StyledTableCell
              key={`${type}-${key}`}
              type={type}
              direction={key === tableKey.size ? rowData.direction : undefined}
              percentage={((numeral(rowData.total).value() ?? 0) / baseTotal) * 100}
            >
              {rowData[key]}
            </StyledTableCell>
          ))}
        </StyledTableContentRow>
      ))}
    </>
  );
};

export default QuoteTable;
