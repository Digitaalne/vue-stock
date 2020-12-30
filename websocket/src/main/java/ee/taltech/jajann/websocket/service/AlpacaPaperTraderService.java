package ee.taltech.jajann.websocket.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import ee.taltech.jajann.websocket.dto.Order;
import ee.taltech.jajann.websocket.dto.Position;
import ee.taltech.jajann.websocket.dto.TradeActivity;
import ee.taltech.jajann.websocket.exception.RequestError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.MatchResult;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Actions related with trading with Alpaca API.
 */
@Service
@Slf4j
public class AlpacaPaperTraderService {
    @Value("${alpaca.order.url}")
    private String orderUrl;
    @Value("${alpaca.position.url}")
    private String positionUrl;
    @Value("${alpaca.activities.url}")
    private String tradeactivityUrl;
    private static final int TIMEOUT = 5;

    private final HttpClientService httpClientService;

    private final ObjectWriter objectWriter;
    private final ObjectMapper mapper;

    public AlpacaPaperTraderService(ObjectMapper objectMapper, HttpClientService httpClientService) {
        this.mapper = objectMapper;
        this.objectWriter = objectMapper.writerWithDefaultPrettyPrinter();
        this.httpClientService = httpClientService;
    }

    /**
     * Make new order request against Alpaca API.
     *
     * @param order Order Data Transfer Object, contains necessary information
     * @return Response from external API
     * @throws IOException          HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     */
    public ResponseEntity<?> requestNewOrder(Order order) throws IOException, InterruptedException {
        var json = objectWriter.writeValueAsString(order);
        var post = httpClientService.buildHttpRequest(HttpMethod.POST, orderUrl, json);
        var resp = httpClientService.sendRequest(post);

        return ResponseEntity.status(resp.statusCode()).body(resp.body());
    }

    /**
     * Get list of user positions.
     *
     * @return Response from Alpaca API. List of users positions
     * @throws ExecutionException   HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     * @throws TimeoutException     HTTP Request times out
     */
    public ResponseEntity<?> getOpenPosition() throws InterruptedException, ExecutionException, TimeoutException {
        var get = httpClientService.buildGetHttpRequest(positionUrl);
        var resp = httpClientService.sendASyncRequest(get);
        return resp.thenApply(json -> {
            try {
                Position[] position = mapper.readValue(json, Position[].class);
                return ResponseEntity.ok().body(position);
            } catch (JsonProcessingException e) {
                log.error("getOpenPosition: " + e.getMessage());
            }
            throw new RequestError();
        }).get(TIMEOUT, TimeUnit.SECONDS);
    }

    /**
     * Get list of user trade activities only. Discard non-trade activities.
     *
     * @return Response from Alpaca API. List of users trade activities
     * @throws ExecutionException   HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     * @throws TimeoutException     HTTP Request times out
     */
    public ResponseEntity<?> getTradeActivities() throws InterruptedException, ExecutionException, TimeoutException {
        var get = httpClientService.buildGetHttpRequest(tradeactivityUrl);
        var resp = httpClientService.sendASyncRequest(get);
        return resp.thenApply(json -> {

            List<String> tradeActivities = Pattern.compile("\\{(.*?)}").matcher(json).results().map(MatchResult::group).collect(Collectors.toList());
            List<TradeActivity> response = new ArrayList<>();
            for (String tradeActivity : tradeActivities) {
                try {
                    var correct = mapper.readValue(tradeActivity, TradeActivity.class);
                    response.add(correct);
                } catch (JsonProcessingException e) {
                    log.info("getTradeActivities:: Tried to parse not trade activity");
                }
            }
            return ResponseEntity.ok().body(response);

        }).get(TIMEOUT, TimeUnit.SECONDS);
    }

}
