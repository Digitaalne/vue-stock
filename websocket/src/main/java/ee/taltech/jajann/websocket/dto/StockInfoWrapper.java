package ee.taltech.jajann.websocket.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.Data;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
public class StockInfoWrapper {

    Map<String, List<StockInfo>> details = new LinkedHashMap<>();

    @JsonAnySetter
    void setDetail(String key, List<StockInfo> value) {
        details.put(key, value);
    }
}
