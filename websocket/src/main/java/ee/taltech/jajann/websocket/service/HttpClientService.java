package ee.taltech.jajann.websocket.service;

import ee.taltech.jajann.websocket.exception.RequestError;
import ee.taltech.jajann.websocket.thread.ThreadLocalObject;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

/**
 * Service that handles http request against external APIs.
 */
@Service
public class HttpClientService {
    public static final Duration TIMEOUT = Duration.ofMillis(5000);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(TIMEOUT).build();

    /**
     * Send asynchronous request.
     *
     * @param httpRequest HttpRequest to be sent
     * @return Response body
     * @throws RuntimeException Status code >= 300
     */
    public CompletableFuture<String> sendASyncRequest(HttpRequest httpRequest) {
        return httpClient.sendAsync(httpRequest, HttpResponse.BodyHandlers.ofString()).thenApplyAsync(resp -> {
            int status = resp.statusCode();
            if (status >= 300) {
                throw new RequestError(resp.body());
            } else {
                return resp.body();
            }
        });
    }

    /**
     * Send synchronus request
     *
     * @param httpRequest HttpRequest to be sent.
     * @return Response body
     * @throws IOException          Http Request fails
     * @throws InterruptedException Http Request fails
     */
    public HttpResponse<?> sendRequest(HttpRequest httpRequest) throws IOException, InterruptedException {
        return httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
    }

    /**
     * Build GET HTTP Request.
     *
     * @param url URL of request.
     * @return GET HttpRequest.
     */
    public HttpRequest buildGetHttpRequest(String url, String... httpHeaders) {
        return buildHttpRequest(HttpMethod.GET, url, "", httpHeaders);
    }

    /**
     * Build HTTP Request.
     *
     * @param httpMethod  Method that HTTP request is.
     * @param url         URL of request.
     * @param body        Body of request.
     * @param httpHeaders Headers of request
     * @return HTTP Request.
     */
    public HttpRequest buildHttpRequest(HttpMethod httpMethod, String url, String body, String... httpHeaders) {
        if (httpHeaders != null && httpHeaders.length > 0) {
            return HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .headers(httpHeaders)
                    .method(httpMethod.name(), HttpRequest.BodyPublishers.ofString(body)).build();
        } else {
            return HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .header("Authorization", ThreadLocalObject.getAuthToken())
                    .method(httpMethod.name(), HttpRequest.BodyPublishers.ofString(body)).build();
        }
    }
}
