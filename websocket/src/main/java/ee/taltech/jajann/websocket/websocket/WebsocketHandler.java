package ee.taltech.jajann.websocket.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import ee.taltech.jajann.websocket.dto.Message;
import ee.taltech.jajann.websocket.dto.StockInfoWrapper;
import ee.taltech.jajann.websocket.exception.StockError;
import ee.taltech.jajann.websocket.service.AlpacaStockInfoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;

/**
 * Handles websocket logic.
 */
@Component
@Slf4j
public class WebsocketHandler extends TextWebSocketHandler implements ApplicationListener<Message> {

    final SessionManager sessionManager;

    final AlpacaStockInfoService alpacaStockInfoService;

    private ObjectWriter objectWriter;

    public WebsocketHandler(ObjectMapper objectMapper, SessionManager sessionManager, AlpacaStockInfoService alpacaStockInfoService) {
        this.objectWriter = objectMapper.writerWithDefaultPrettyPrinter();
        this.sessionManager = sessionManager;
        this.alpacaStockInfoService = alpacaStockInfoService;
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable throwable) throws Exception {
        log.error("error occured at sender " + session, throwable);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info(String.format("Session %s closed because of %s", session.getId(), status.getReason()));
        sessionManager.removeSession(session);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("Connected ... " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        if (message == null || message.getPayloadLength() < 2) {
            throw new StockError("INVALID_PAYLOAD");
        }
        String[] stocks = message.getPayload().split("-");
        if (stocks.length > 1 && stocks[0].equals("s")) {
            for (int i = 1; i < stocks.length; i++) {
                sessionManager.addSession(stocks[i], session);
            }
        } else {
            throw new StockError("INVALID_PAYLOAD");
        }
    }

    private void sendMessageToAll(StockInfoWrapper stockInfoWrapper) {

        var sessions = sessionManager.getSessions();
        for (String stockName : sessions.keySet()) {
            if (!stockInfoWrapper.getDetails().isEmpty() && stockInfoWrapper.getDetails().containsKey(stockName)) {
                for (WebSocketSession session : sessions.get(stockName)) {
                    if (!stockInfoWrapper.getDetails().get(stockName).isEmpty()) {
                        try {
                            var resp = alpacaStockInfoService.mapToList(stockInfoWrapper.getDetails().get(stockName));
                            var json = objectWriter.writeValueAsString(resp);
                            TextMessage textMessage = new TextMessage("{\"" + stockName + "\":" + json + "}");
                            session.sendMessage(textMessage);
                        } catch (IOException e) {
                            log.error(e.getMessage());
                        }
                    }

                }
            }
        }

    }


    @Override
    public void onApplicationEvent(Message message) {
        sendMessageToAll(message.getStockInfoWrapper());
    }


}