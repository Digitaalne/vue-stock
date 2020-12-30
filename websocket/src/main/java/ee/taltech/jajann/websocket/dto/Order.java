package ee.taltech.jajann.websocket.dto;

import lombok.Data;

@Data
public class Order {
    private String symbol;
    private int qty;
    private String side;
    private String type;
    private String timeInForce;
    private Double limitPrice;
    private Double stopPrice;
    private Boolean extendedHours;
}
