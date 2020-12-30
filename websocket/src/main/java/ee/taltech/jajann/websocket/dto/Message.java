package ee.taltech.jajann.websocket.dto;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class Message extends ApplicationEvent {
    private StockInfoWrapper stockInfoWrapper;

    /**
     * Create a new {@code ApplicationEvent}.
     *
     * @param source the object on which the event initially occurred or with
     *               which the event is associated (never {@code null})
     */
    public Message(Object source, StockInfoWrapper stockInfoWrapper) {
        super(source);
        this.stockInfoWrapper = stockInfoWrapper;
    }

}
