package ee.taltech.jajann.websocket.thread;

public class ThreadLocalObject {
    private ThreadLocalObject(){
    }
    private static final ThreadLocal<String> AUTH = new ThreadLocal<>();

    public static void setAuthToken(String token) {
        AUTH.set(token);
    }

    public static String getAuthToken() {
        return AUTH.get();
    }

    public static void removeAuthToken() {
        AUTH.remove();
    }
}
