package ee.taltech.jajann.websocket;


import ee.taltech.jajann.websocket.thread.ThreadLocalObject;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class AuthHeaderHandler implements HandlerInterceptor {
    private static final String AUTH_HEADER_NAME = "authorization";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        ThreadLocalObject.setAuthToken(request.getHeader(AUTH_HEADER_NAME));
        return true;
    }
}
