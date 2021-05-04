import { Contract } from "@stoqey/ib";

export interface StockMetadata {
  lastUpdate: Date;
  contract: Contract;
  tickerId: number;
}
