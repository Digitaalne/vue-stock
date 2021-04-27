import { StockMetadata } from "./StockMetadata";

export interface PriceInterface2 {
    bidPrice?: number
    askPrice?: number
    volume?: number
    lastPrice?: number
    name: string
    metadata?: StockMetadata
}