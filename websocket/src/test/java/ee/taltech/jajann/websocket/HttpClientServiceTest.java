package ee.taltech.jajann.websocket;

import ee.taltech.jajann.websocket.service.HttpClientService;
import ee.taltech.jajann.websocket.thread.ThreadLocalObject;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;

import java.io.IOException;
import java.net.MalformedURLException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class HttpClientServiceTest {

    @InjectMocks
    HttpClientService httpClientService;


    private static final MockWebServer mockServer = new MockWebServer();

    @BeforeAll
    public static void init() throws IOException {
        mockServer.start();
        ThreadLocalObject.setAuthToken("ABC");
    }

    @Test
    void buildGetHttpRequest_withUrl_correctRequest() throws MalformedURLException {
        var get = httpClientService.buildGetHttpRequest("http://test.com");
        assertEquals(HttpMethod.GET.name(), get.method());
        assertEquals("http://test.com", get.uri().toURL().toString());
    }

    @Test
    void buildHttpRequest_postMethod_correctRequest() throws MalformedURLException {
        var post = httpClientService.buildHttpRequest(HttpMethod.POST, "http://test.com", "TEST");
        assertEquals(HttpMethod.POST.name(), post.method());
        assertEquals("http://test.com", post.uri().toURL().toString());
    }

    @Test
    void buildHttpRequest_postMethod_fails() {
        var post = httpClientService.buildHttpRequest(HttpMethod.POST, "http://test.com", "TEST");
        assertNotEquals(HttpMethod.GET.name(), post.method());
    }

    @Test
    void buildHttpRequest_invalidUrl_fails() {
        assertThrows(IllegalArgumentException.class, () -> {
            httpClientService.buildHttpRequest(HttpMethod.POST, "oiuouioui", "TEST");
        });
    }

    @Test
    void sendRequest_getRequest_bodyMatches() throws IOException, InterruptedException {
        var mockResponse = new MockResponse();
        mockResponse.setResponseCode(200);
        mockResponse.setBody("TEST");
        mockServer.enqueue(mockResponse);
        var request = httpClientService.buildGetHttpRequest(mockServer.url("/test").toString());
        var resp = httpClientService.sendRequest(request);
        assertEquals("TEST", resp.body());
    }

    @AfterAll
    public static void close() throws IOException {
        mockServer.close();
    }
}
