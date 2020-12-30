package ee.taltech.jajann.websocket.dto;

import lombok.Data;

@Data
public class Position {
    private String assetId;
    private String symbol;
    private String exchange;
    private String assetClass;
    private Double avgEntryPrice;
    private Integer qty;
    private String side;
    private Double marketValue;
    private Double costBasis;
    private Double unrealizedPl;
    private Double unrealizedPlpc;
    private Double unrealizedIntradayPl;
    private Double unrealizedIntradayPlpc;
    private Double currentPrice;
    private Double lastdayPrice;
    private Double changeToday;

}
