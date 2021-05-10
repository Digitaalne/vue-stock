export interface History {
  symbol?: string;
  activity_type?: string;
  cum_qty?: number;
  leaves_qty?: number;
  price?: number;
  qty?: number;
  side?: string;
  type?: string;
  transaction_time?: Date | string;
}
