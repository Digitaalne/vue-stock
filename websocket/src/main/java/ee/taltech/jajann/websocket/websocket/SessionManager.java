package ee.taltech.jajann.websocket.websocket;

import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manage sessions of web sockets.
 */
@Service
public class SessionManager {

    private final Map<String, List<WebSocketSession>> sessions = new ConcurrentHashMap<>();

    /**
     * Add new session to current sessions.
     *
     * @param stockCode        stock code/symbol/ticker
     * @param webSocketSession new websocket session.
     */
    public void addSession(String stockCode, WebSocketSession webSocketSession) {
        if (sessions.containsKey(stockCode)) {
            sessions.get(stockCode).add(webSocketSession);
        } else {
            var arrayList = new ArrayList<WebSocketSession>();
            arrayList.add(webSocketSession);
            sessions.put(stockCode, arrayList);
        }
    }

    /**
     * Remove session from certain stock code.
     *
     * @param stockCode        stock code/symbol/ticker
     * @param webSocketSession new websocket session.
     */
    public void removeSessionFromStockCode(String stockCode, WebSocketSession webSocketSession) {
        if (sessions.containsKey(stockCode)) {
            sessions.get(stockCode).remove(webSocketSession);
        }
    }

    /**
     * Remove session from existing sessions.
     *
     * @param webSocketSession Session to be removed.
     */
    public void removeSession(WebSocketSession webSocketSession) {
        sessions.entrySet().parallelStream().filter(entry -> entry.getValue().contains(webSocketSession)).forEach(entry -> {
            entry.getValue().remove(webSocketSession);
            if (entry.getValue().isEmpty()) sessions.remove(entry.getKey());
        });
    }

    /**
     * Get all sessions.
     *
     * @return Map of all sessions.
     */
    public Map<String, List<WebSocketSession>> getSessions() {
        return sessions;
    }
}
