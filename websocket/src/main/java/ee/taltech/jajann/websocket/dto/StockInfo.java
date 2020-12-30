package ee.taltech.jajann.websocket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockInfo {
    @JsonProperty("t")
    private Timestamp timestamp;
    @JsonProperty("o")
    private double open;
    @JsonProperty("h")
    private double high;
    @JsonProperty("l")
    private double low;
    @JsonProperty("c")
    private double close;
    @JsonProperty("v")
    private double volume;
}
