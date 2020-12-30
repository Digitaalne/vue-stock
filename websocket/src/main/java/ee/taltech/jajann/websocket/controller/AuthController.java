package ee.taltech.jajann.websocket.controller;

import ee.taltech.jajann.websocket.dto.Auth;
import ee.taltech.jajann.websocket.service.AlpacaAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * Controller dedicated for authorization activities with external APIs.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    final AlpacaAuthService alpacaAuthService;

    public AuthController(AlpacaAuthService alpacaAuthService) {
        this.alpacaAuthService = alpacaAuthService;
    }

    /**
     * Login user
     *
     * @param auth OAuth data
     * @return Response from External API
     * @throws IOException          HTTP Request fails
     * @throws InterruptedException HTTP Request fails
     */
    @PostMapping
    public ResponseEntity<?> login(@RequestBody Auth auth) throws IOException, InterruptedException {
        return alpacaAuthService.doLogin(auth);
    }
}
