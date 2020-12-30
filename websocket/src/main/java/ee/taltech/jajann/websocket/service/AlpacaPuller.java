package ee.taltech.jajann.websocket.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.taltech.jajann.websocket.dto.Message;
import ee.taltech.jajann.websocket.dto.StockInfoWrapper;
import ee.taltech.jajann.websocket.exception.RequestError;
import ee.taltech.jajann.websocket.websocket.SessionManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpRequest;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Service dedicated to get latest stock info periodically.
 */
@Service
@Slf4j
public class AlpacaPuller {


    @Value("${alpaca.key}")
    private String alpacaKey;

    @Value("${alpaca.secret.key}")
    private String alpacaSecretKey;

    ObjectMapper mapper = new ObjectMapper();

    final HttpClientService httpClientService;
    final SessionManager sessionManager;
    private final ApplicationEventPublisher applicationEventPublisher;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssXXX");

    private ZonedDateTime lastTimestamp = ZonedDateTime.now();

    static ZoneId etZoneId = ZoneId.of("America/New_York");

    private static final String TIMEFRAME = "1Min";

    public AlpacaPuller(HttpClientService httpClientService, SessionManager sessionManager, ApplicationEventPublisher applicationEventPublisher) {
        this.httpClientService = httpClientService;
        this.sessionManager = sessionManager;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * Periodically request market data from Alpaca API. Only data after last request is requested.
     */
    @PostConstruct
    public void pull() {
        TimerTask timerTask = new TimerTask() {
            @Override
            public void run() {
                if (getStocks().length() > 1) {
                    lastTimestamp = lastTimestamp.withZoneSameInstant(etZoneId);
                    String timestamp = lastTimestamp.format(FORMATTER).replace(" ", "T");
                    var get = buildRequest("https://data.alpaca.markets/v1/bars/" + TIMEFRAME + "?symbols=" + getStocks() + "&after=" + timestamp);
                    lastTimestamp = ZonedDateTime.now();
                    var response = httpClientService.sendASyncRequest(get);
                    response.thenApply(json -> {
                        try {
                            Message message = new Message(this, mapper.readValue(json, StockInfoWrapper.class));
                            applicationEventPublisher.publishEvent(message);
                        } catch (JsonProcessingException e) {
                            log.error("pull: " + e.getMessage());
                        }
                        throw new RequestError();
                    });
                }
            }
        };
        Timer timer = new Timer(true);
        timer.scheduleAtFixedRate(timerTask, 1000, 5000);
    }

    /**
     * Get list of all stocks that users have requested through websocket.
     *
     * @return list of stock symbols/codes
     */
    private String getStocks() {
        var keys = sessionManager.getSessions().keySet();
        return StringUtils.collectionToCommaDelimitedString(keys);
    }

    /**
     * Build request for puller with API keys.
     *
     * @param url url for data.
     * @return HttpRequest for info request.
     */
    private HttpRequest buildRequest(String url) {
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header("APCA-API-KEY-ID", alpacaKey)
                .header("APCA-API-SECRET-KEY", alpacaSecretKey)
                .method(HttpMethod.GET.name(), null).build();
    }
}
