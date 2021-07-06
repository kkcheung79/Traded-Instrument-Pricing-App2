package com.international.mizuho.TradedInstrumentPricingApp.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import com.international.mizuho.TradedInstrumentPricingApp.model.request.TradingInstrumentPricingRequest;
import com.international.mizuho.TradedInstrumentPricingApp.service.TradedInstrumentPricingService;
import com.international.mizuho.TradedInstrumentPricingApp.util.PricingModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.dsl.IntegrationFlows;
import org.springframework.integration.dsl.Pollers;
import org.springframework.integration.file.dsl.Files;
import org.springframework.integration.file.filters.AcceptOnceFileListFilter;
import org.springframework.integration.file.filters.ChainFileListFilter;
import org.springframework.integration.file.filters.SimplePatternFileListFilter;
import org.springframework.integration.file.transformer.FileToStringTransformer;
import org.springframework.integration.handler.LoggingHandler;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.support.GenericMessage;

import java.io.File;

@Configuration
public class IntegrationFlowConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(IntegrationFlowConfig.class);

    private static final String CONST_VENDOR_PRICING_INPUT_FOLDER = "VendorPricingInputFolder";
    private static final String CONST_VENDOR_PRICING_FILE_FORMAT = "*.json";
    private static final String CONST_VENDOR_PRICING_INPUT_FILE_CHANNEL = "processFileChannel";
    private static final int CONST_POLLER_FIXED_DELAY = 1000;

    @Bean
    public IntegrationFlow fileReadingFlow() {
        return IntegrationFlows
                .from(Files.inboundAdapter(new File(CONST_VENDOR_PRICING_INPUT_FOLDER))
                        .filter(new ChainFileListFilter<File>()
                                .addFilter(new AcceptOnceFileListFilter<>())
                                .addFilter(new SimplePatternFileListFilter(CONST_VENDOR_PRICING_FILE_FORMAT))
                        ), e -> e.poller(Pollers.fixedDelay(CONST_POLLER_FIXED_DELAY)))
                .log(LoggingHandler.Level.INFO, "**AUDIT**",
                        m -> m.getHeaders().getId() + ": " + m.getPayload())
                .transform(new FileToStringTransformer())
                .transform(GenericMessage.class,
                        message -> ((String) message.getPayload()).split("[\\r\\n]+"))
                .split()
                .channel(c -> c.direct(CONST_VENDOR_PRICING_INPUT_FILE_CHANNEL))
                .get();
    }

    @ServiceActivator(inputChannel = CONST_VENDOR_PRICING_INPUT_FILE_CHANNEL)
    @Bean
    public MessageHandler pricingRecordHandler(TradedInstrumentPricingService tradedInstrumentPricingService
            , PricingModelMapper pricingModelMapper) {
        return msg -> {
            ObjectMapper objectMapper = new ObjectMapper();
            TradingInstrumentPricingRequest req = null;
            try {
                req = objectMapper.readValue((String) msg.getPayload(), TradingInstrumentPricingRequest.class);
                LOGGER.info("FileProcessing TradingInstrumentPricingRequest: {}", req);
                VendorTradingInstrumentPrice price = pricingModelMapper.convert(req);
                tradedInstrumentPricingService.saveOrUpdate(price);
            } catch (Exception e) {
                e.printStackTrace();
            }
        };
    }
}
