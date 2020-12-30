package ee.taltech.jajann.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.taltech.jajann.websocket.dto.StockInfo;
import ee.taltech.jajann.websocket.service.AlpacaStockInfoService;
import ee.taltech.jajann.websocket.service.HttpClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

@SpringBootTest
public class AlpacaStockInfoServiceTest {
    @InjectMocks
    AlpacaStockInfoService alpacaStockInfoService;
    @Mock
    HttpClientService httpClientService;
    @Mock
    ObjectMapper objectMapper;

    List<StockInfo> stockInfoList;

    @BeforeEach
    void init() {
        stockInfoList = new ArrayList<>();
        StockInfo stockInfo1 = new StockInfo(Timestamp.valueOf("2020-01-01 00:00:00"), 11, 12, 11, 12, 12);
        StockInfo stockInfo2 = new StockInfo(Timestamp.valueOf("2020-02-02 00:00:00"), 12, 13, 12, 13, 14);
        stockInfoList.add(stockInfo1);
        stockInfoList.add(stockInfo2);
    }

    @Test
    void mapToList_passingTest() {
        System.out.println(stockInfoList);
        var resp = alpacaStockInfoService.mapToList(stockInfoList);
        System.out.println(resp);
        var firstDataList = resp.getStockDataList().get(0);
        var secondDataList = resp.getStockDataList().get(1);
        var volumeList = resp.getStockVolumeList();

        // First list tests
        assertEquals(Timestamp.valueOf("2020-01-01 00:00:00").toInstant().toEpochMilli() * 1000, firstDataList.get(0));
        assertEquals(11D, firstDataList.get(1));
        assertEquals(12D, firstDataList.get(2));
        assertEquals(11D, firstDataList.get(3));
        assertEquals(12D, firstDataList.get(4));
        assertEquals(firstDataList.get(0), volumeList.get(0).get(0));
        assertEquals(12D, volumeList.get(0).get(1));

        // Second list tests
        assertEquals(Timestamp.valueOf("2020-02-02 00:00:00").toInstant().toEpochMilli() * 1000, secondDataList.get(0));
        assertEquals(12D, secondDataList.get(1));
        assertEquals(13D, secondDataList.get(2));
        assertEquals(12D, secondDataList.get(3));
        assertEquals(13D, secondDataList.get(4));
        assertEquals(secondDataList.get(0), volumeList.get(1).get(0));
        assertEquals(14D, volumeList.get(1).get(1));
    }

    @Test
    void mapToList_notEqualsTest() {
        var resp = alpacaStockInfoService.mapToList(stockInfoList);
        assertNotEquals(100D, resp.getStockDataList().get(0).get(1));
        assertNotEquals(100D, resp.getStockDataList().get(1).get(1));
        assertNotEquals(100, resp.getStockVolumeList().get(0).get(1));
    }
}
