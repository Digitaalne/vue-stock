package ee.taltech.jajann.websocket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Service dedicated to get information about stock from Tradier API.
 */
@Service
public class TradierStockInfoService {

    private static final String ALPACA_EXCHANGES = "C,M,B,Q,N";
    private final HttpClientService httpClientService;

    public TradierStockInfoService(HttpClientService httpClientService) {
        this.httpClientService = httpClientService;
    }

    @Value("${tradier.lookup.url}")
    private String lookupUrl;

    @Value("${tradier.auth}")
    private String auth;

    /**
     * Search for stock symbol, used for auto-complete.
     *
     * @param text text input from user
     * @return External API response, list of securities.
     * @throws InterruptedException Http Request fails
     * @throws ExecutionException   Http Request fails
     * @throws TimeoutException     Http Request fails
     */
    public ResponseEntity<?> symbolLookup(String text) throws InterruptedException, ExecutionException, TimeoutException {
        var get = httpClientService.buildGetHttpRequest(lookupUrl + "?q=" + text + "&exchanges=" + ALPACA_EXCHANGES + "&types=stock", "Authorization", "Bearer " + auth);
        var resp = httpClientService.sendASyncRequest(get);
        return ResponseEntity.ok(resp.get(5, TimeUnit.SECONDS));
    }
}
