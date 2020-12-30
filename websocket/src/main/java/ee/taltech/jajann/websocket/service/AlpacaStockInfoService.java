package ee.taltech.jajann.websocket.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import ee.taltech.jajann.websocket.dto.StockInfo;
import ee.taltech.jajann.websocket.dto.StockInfoWrapper;
import ee.taltech.jajann.websocket.dto.StockResponse;
import ee.taltech.jajann.websocket.exception.RequestError;
import ee.taltech.jajann.websocket.exception.StockError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Service dedicated to get information about stock from Alpaca API.
 */
@Service
@Slf4j
public class AlpacaStockInfoService {


    public static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    private final ObjectWriter objectWriter;
    private final ObjectMapper mapper;

    public AlpacaStockInfoService(ObjectMapper objectMapper, HttpClientService httpClientService) {
        this.mapper = objectMapper;
        this.objectWriter = objectMapper.writerWithDefaultPrettyPrinter();
        this.httpClientService = httpClientService;
    }

    final HttpClientService httpClientService;

    /**
     * Get stock data for bar graph.
     *
     * @param start     First date of time range
     * @param end       Second date of time range
     * @param symbol    Stock symbol/code/ticker
     * @param timeframe timeframe for data
     * @return Bar data of stock
     * @throws InterruptedException HTTP Request fails
     * @throws ExecutionException   HTTP Request fails
     * @throws StockError           Invalid input from user
     * @throws TimeoutException     HTTP Request times out
     */
    public ResponseEntity<?> getStockBars(ZonedDateTime start, ZonedDateTime end, String symbol, String timeframe) throws StockError, InterruptedException, ExecutionException, TimeoutException {
        if (start == null || end == null || symbol == null || start.isAfter(end)) {
            throw new StockError("INVALID_INPUT");
        }

        var get = httpClientService.buildGetHttpRequest("https://data.alpaca.markets/v1/bars/" + timeframe + "?symbols=" + symbol + "&start=" + start.format(FORMATTER) + "&end=" + end.format(FORMATTER));
        var resp = httpClientService.sendASyncRequest(get);
        return resp.thenApply(json -> {
            try {
                StockInfoWrapper stockInfo = mapper.readValue(json, StockInfoWrapper.class);
                if (stockInfo == null || stockInfo.getDetails().get(symbol) == null) {
                    throw new StockError("INVALID_INPUT");
                }
                var respJson = objectWriter.writeValueAsString(mapToList(stockInfo.getDetails().get(symbol)));
                return ResponseEntity.ok().body("{\"" + symbol + "\":" + respJson + "}");
            } catch (JsonProcessingException | StockError e) {
                log.error(e.getMessage());
            }
            throw new RequestError();
        }).get(5, TimeUnit.SECONDS);
    }

    /**
     * Map stock bar data to list so Front-End can easily draw graphs
     * Stock data list contains elements in-order: timestamp, open price, high price, low price, close price
     * Stock volume list contains elements in-order: timestamp, volume
     *
     * @param stockInfoList Object, that contains stock info.
     * @return Two lists. Data about price and data list about volume.
     */
    public StockResponse mapToList(List<StockInfo> stockInfoList) {
        StockResponse resp = new StockResponse();
        for (StockInfo stockInfo : stockInfoList) {
            List<Object> stockDataList = List.of(stockInfo.getTimestamp().toInstant().toEpochMilli() * 1000, stockInfo.getOpen(), stockInfo.getHigh(), stockInfo.getLow(), stockInfo.getClose());
            List<Object> stockVolumeList = List.of(stockInfo.getTimestamp().toInstant().toEpochMilli() * 1000, stockInfo.getVolume());
            resp.addToDataList(stockDataList);
            resp.addToVolumeList(stockVolumeList);
        }
        return resp;
    }
}
