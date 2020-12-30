package ee.taltech.jajann.websocket;

import ee.taltech.jajann.websocket.websocket.SessionManager;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.socket.adapter.standard.StandardWebSocketSession;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class SessionManagerTest {

    SessionManager sessionManager = new SessionManager();
    @Mock
    StandardWebSocketSession standardWebSocketSession;
    @Mock
    StandardWebSocketSession notSession;

    @Test
    void addSession_oneSession_success() {
        sessionManager.addSession("APPL", standardWebSocketSession);
        assertEquals(1, sessionManager.getSessions().size());
    }

    @Test
    void addSession_twoSessions_success() {
        sessionManager.addSession("APPL", standardWebSocketSession);
        sessionManager.addSession("AAPL", standardWebSocketSession);
        assertEquals(2, sessionManager.getSessions().size());
    }

    @Test
    void removeSession_existingSession_success() {
        sessionManager.addSession("AAPL", standardWebSocketSession);
        sessionManager.removeSession(standardWebSocketSession);
        assertEquals(0, sessionManager.getSessions().size());
    }

    @Test
    void removeSession_notExisting_success() {
        sessionManager.addSession("AAPL", standardWebSocketSession);
        sessionManager.removeSession(notSession);
        assertEquals(1, sessionManager.getSessions().size());
    }
}
