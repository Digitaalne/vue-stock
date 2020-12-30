package ee.taltech.jajann.websocket.dto;

import lombok.Data;

@Data
public class Auth {
    private String grantType;
    private String code;
    private String clientID;
    private String clientSecret;
    private String redirectUri;

    public String getFormUrlEncodedBody() {
        return "grant_type=" + grantType + "&code=" + code + "&client_id=" + clientID + "&client_secret=" + clientSecret + "&redirect_uri=" + redirectUri;
    }
}
