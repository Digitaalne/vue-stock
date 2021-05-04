export interface Position {
  symbol?: string;
  exchange?: string;
  asset_class?: string;
  avg_entry_price?: number;
  qty?: number;
  market_value?: number;
  cost_basis?: number;
  unrealized_pl?: number;
  unrealized_plpc?: number;
  unrealized_intraday_pl?: number;
  unrealized_intraday_plpc?: number;
  current_price?: number;
  lastday_price?: number;
  change_today?: number;
  account?: string;
}
