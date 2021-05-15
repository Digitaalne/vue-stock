import { StockMetadata } from "./stockMetadata";

export interface PriceInterfaceSingle {
  bidPrice?: number;
  askPrice?: number;
  volume?: number;
  lastPrice?: number;
  name: string;
  metadata?: StockMetadata;
}
