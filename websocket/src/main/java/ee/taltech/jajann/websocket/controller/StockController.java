package ee.taltech.jajann.websocket.controller;

import ee.taltech.jajann.websocket.exception.StockError;
import ee.taltech.jajann.websocket.service.AlpacaStockInfoService;
import ee.taltech.jajann.websocket.service.TradierStockInfoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZonedDateTime;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * Controller dedicated to get information about stock.
 */
@RestController
@RequestMapping("/stock")
public class StockController {
    final AlpacaStockInfoService alpacaStockInfoService;
    final TradierStockInfoService tradierStockInfoService;

    public StockController(AlpacaStockInfoService alpacaStockInfoService, TradierStockInfoService tradierStockInfoService) {
        this.alpacaStockInfoService = alpacaStockInfoService;
        this.tradierStockInfoService = tradierStockInfoService;
    }

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
    @GetMapping("/bars")
    public ResponseEntity<?> getBars(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime start, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime end, @RequestParam String symbol, @RequestParam String timeframe) throws InterruptedException, ExecutionException, StockError, TimeoutException {
        return alpacaStockInfoService.getStockBars(start, end, symbol, timeframe);
    }

    @GetMapping("/lookup")
    public ResponseEntity<?> lookUp(@RequestParam String q) throws InterruptedException, ExecutionException, TimeoutException {
        return tradierStockInfoService.symbolLookup(q);
    }
}
