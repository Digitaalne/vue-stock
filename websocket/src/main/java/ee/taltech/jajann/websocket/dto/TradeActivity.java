package ee.taltech.jajann.websocket.dto;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class TradeActivity {
    private String activityType;
    private Integer cumQty;
    private String id;
    private Integer leavesQty;
    private Double price;
    private Integer qty;
    private String side;
    private String symbol;
    private ZonedDateTime transactionTime;
    private String orderId;
    private String type;
}
