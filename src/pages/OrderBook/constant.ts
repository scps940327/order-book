import { tableKey, TableKeyType } from "../types";

export interface TableConfig {
  key: TableKeyType;
  label: string;
}

export const tableConfigs: TableConfig[] = [
  {
    key: tableKey.price,
    label: 'Price(USD)',
  },
  {
    key: tableKey.size,
    label: 'Size',
   },
   {
    key: tableKey.total,
    label: 'Total'
  },
];
