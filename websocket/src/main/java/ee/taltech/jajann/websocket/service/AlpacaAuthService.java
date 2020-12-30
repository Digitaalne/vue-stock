package ee.taltech.jajann.websocket.service;

import ee.taltech.jajann.websocket.dto.Auth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;

/**
 * Auth activities for Alpaca API
 */
@Service
public class AlpacaAuthService {

    private static final String ALPACA_AUTH_URL = "https://api.alpaca.markets/oauth/token";

    @Value("${alpaca.client.secret}")
    private String clientSecret;


    public AlpacaAuthService(HttpClientService httpClientService) {
        this.httpClientService = httpClientService;
    }

    final HttpClientService httpClientService;

    /**
     * Try to preform login.
     *
     * @param auth Body with necessary information for Oauth.
     * @return Response from external API.
     * @throws IOException          HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     */
    public ResponseEntity<?> doLogin(Auth auth) throws IOException, InterruptedException {
        auth.setGrantType("authorization_code");
        auth.setClientSecret(clientSecret);
        var text = auth.getFormUrlEncodedBody();
        var post = buildAuthRequest(text);
        var resp = httpClientService.sendRequest(post);
        return ResponseEntity.ok(resp.body());
    }

    private HttpRequest buildAuthRequest(String body) {
        return HttpRequest.newBuilder()
                .uri(URI.create(ALPACA_AUTH_URL))
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .method(HttpMethod.POST.name(), HttpRequest.BodyPublishers.ofString(body)).build();
    }


}
