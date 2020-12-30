package ee.taltech.jajann.websocket.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class StockResponse {
    private List<List<Object>> stockDataList = new ArrayList<>();
    private List<List<Object>> stockVolumeList = new ArrayList<>();

    public void addToDataList(List<Object> list) {
        stockDataList.add(list);
    }

    public void addToVolumeList(List<Object> list) {
        stockVolumeList.add(list);
    }
}
