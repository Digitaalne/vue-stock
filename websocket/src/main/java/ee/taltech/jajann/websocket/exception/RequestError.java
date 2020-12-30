package ee.taltech.jajann.websocket.exception;

public class RequestError extends RuntimeException {

    public RequestError() {
        super("SOMETHING_WENT_WRONG");
    }

    public RequestError(String message) {
        super(message);
    }

    @Override
    public String toString() {
        return getMessage();
    }
}
