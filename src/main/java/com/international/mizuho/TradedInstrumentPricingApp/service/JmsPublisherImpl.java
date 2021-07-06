package com.international.mizuho.TradedInstrumentPricingApp.service;

import com.international.mizuho.TradedInstrumentPricingApp.config.PricingAppProperties;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

/**
 * JmsPublisherImpl publish pricing info to the topic subscribed by downstream.
 *
 * @author Ken Cheung
 * @version 1.0
 * @since 2021-07-05
 */
@Component
@Configuration
@EnableConfigurationProperties(PricingAppProperties.class)
public class JmsPublisherImpl implements JmsPublisher {

    @Autowired
    private JmsTemplate jmsTopicTemplate;

    private final String topicName;

    public JmsPublisherImpl(PricingAppProperties properties) {
        this.topicName = properties.getPricingTopic();
    }

    @Override
    public void publish(VendorTradingInstrumentPrice price) {
        jmsTopicTemplate.convertAndSend(topicName, price);
    }
}
