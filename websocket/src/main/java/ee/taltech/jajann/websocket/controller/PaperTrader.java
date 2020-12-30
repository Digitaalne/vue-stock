package ee.taltech.jajann.websocket.controller;

import ee.taltech.jajann.websocket.dto.Order;
import ee.taltech.jajann.websocket.service.AlpacaPaperTraderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * Actions related with trading.
 */
@RestController
@RequestMapping("/paper")
public class PaperTrader {


    final AlpacaPaperTraderService alpacaPaperTraderService;

    public PaperTrader(AlpacaPaperTraderService alpacaPaperTraderService) {
        this.alpacaPaperTraderService = alpacaPaperTraderService;
    }


    /**
     * Make new order request against external API.
     *
     * @param order Order Data Transfer Object, contains necessary information
     * @return Response from external API
     * @throws IOException          HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     */
    @PostMapping("/order")
    public ResponseEntity<?> sendNewOrder(@RequestBody Order order) throws IOException, InterruptedException {
        return alpacaPaperTraderService.requestNewOrder(order);
    }

    /**
     * Get list of user positions.
     *
     * @return Response from external API. List of users positions
     * @throws ExecutionException   HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     * @throws TimeoutException     HTTP Request times out
     */
    @GetMapping("/position")
    public ResponseEntity<?> getPosition() throws InterruptedException, ExecutionException, TimeoutException {
        return alpacaPaperTraderService.getOpenPosition();
    }

    /**
     * Get list of user trade activities made.
     *
     * @return Response from external API. List of users trade activities
     * @throws ExecutionException   HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     * @throws TimeoutException     HTTP Request times out
     */
    @GetMapping("/activity")
    public ResponseEntity<?> getTradeActivities() throws InterruptedException, ExecutionException, TimeoutException {
        return alpacaPaperTraderService.getTradeActivities();
    }
}
