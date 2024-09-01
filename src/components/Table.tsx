import styled from "styled-components";
import { THEME } from "../common/theme";

type TableThemeType = "buy" | "sell";

type DataType = string | number;

interface TableContainerProps {
  header: string[];
  data: DataType[][];
  className?: string;
  type?: TableThemeType;
  hideHeader?: boolean;
  format?: (value: DataType, configKey: string) => DataType;
}

const TableCell = styled.div<Pick<TableContainerProps, "type">>`
  font-weight: bold;

  &:nth-child(1) {
    color: ${({ type }) => {
      switch (type) {
        case "buy":
          return THEME.colors.textBuy;
        case "sell":
          return THEME.colors.textSell;
        default:
          return "initial";
      }
    }};
  }

  &:nth-child(n + 2) {
    text-align: right;
  }
`;

const TableRow = styled.div<{ isHeader?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding: 1px 10px;

  ${({ isHeader }) =>
    isHeader
      ? `
      border-top: 1px #444444 solid;

      > ${TableCell} {
        color: #8698aa;
      }
    `
      : `
      &:hover {
        background-color: #1E3059;
      }
    `}
`;

const Table = {
  Row: TableRow,
  Cell: TableCell,
};

export default Table;
