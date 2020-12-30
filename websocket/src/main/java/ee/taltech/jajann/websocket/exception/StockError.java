package ee.taltech.jajann.websocket.exception;

public class StockError extends Exception {

    public StockError(String message) {
        super(message);
    }

    @Override
    public String toString() {
        return getMessage();
    }
}
