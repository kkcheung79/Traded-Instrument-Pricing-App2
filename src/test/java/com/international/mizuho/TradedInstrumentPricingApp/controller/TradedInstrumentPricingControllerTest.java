package com.international.mizuho.TradedInstrumentPricingApp.controller;

import com.international.mizuho.TradedInstrumentPricingApp.TradedInstrumentPricingAppApplication;
import com.international.mizuho.TradedInstrumentPricingApp.mockdata.MockDataUtil;
import com.international.mizuho.TradedInstrumentPricingApp.service.TradedInstrumentPricingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TradedInstrumentPricingAppApplication.class)
@AutoConfigureMockMvc
@DirtiesContext
class TradedInstrumentPricingControllerTest {

    @MockBean
    private TradedInstrumentPricingService tradedInstrumentPricingService;

    @Autowired
    private MockMvc mockMvc;

    // create a valid traded instrument price successfully
    @Test
    void createTradedInstrumentPriceOK() throws Exception {
        mockMvc.perform(post("/api/price")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content("{\n" +
                        "    \"askPrice\": 99.12,\n" +
                        "    \"bidPrice\": 103.22,\n" +
                        "    \"currencyCode\": \"GBP\",\n" +
                        "    \"instrumentCode\": \"JPM\",\n" +
                        "    \"instrumentDescription\": \"JP MORGAN\",\n" +
                        "    \"instrumentId\": 1,\n" +
                        "    \"txnDataTime\": \"2021-07-04T21:21:43.650Z\",\n" +
                        "    \"uuid\": \"3413-2432-1111-0000\",\n" +
                        "    \"vendorId\": 1,\n" +
                        "    \"vendorName\": \"VENDOR_A\"\n" +
                        "}"))
                .andDo(print())
                .andExpect(status().is2xxSuccessful())
                .andExpect(status().isOk());
    }

    // instrumentCode should not be space
    @Test
    void createMissingInstrumentCodeTradedInstrumentPriceNotOk() throws Exception {
        mockMvc.perform(post("/api/price")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\n" +
                        "    \"askPrice\": 99.12,\n" +
                        "    \"bidPrice\": 103.22,\n" +
                        "    \"currencyCode\": \"GBP\",\n" +
                        "    \"instrumentCode\": \" \",\n" +
                        "    \"instrumentDescription\": \"JP MORGAN\",\n" +
                        "    \"instrumentId\": 1,\n" +
                        "    \"txnDataTime\": \"2021-07-04T21:21:43.650Z\",\n" +
                        "    \"uuid\": \"3413-2432-1111-0000\",\n" +
                        "    \"vendorId\": 1,\n" +
                        "    \"vendorName\": \"VENDOR_A\"\n" +
                        "}"))
                .andDo(print())
                .andExpect(status().is4xxClientError());
    }

    // vendorId should be greater than or equal to 0
    @Test
    void createInvalidVendorIdTradedInstrumentPriceNotOk() throws Exception {
        mockMvc.perform(post("/api/price")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\n" +
                        "    \"askPrice\": 99.12,\n" +
                        "    \"bidPrice\": 103.22,\n" +
                        "    \"currencyCode\": \"GBP\",\n" +
                        "    \"instrumentCode\": \"\",\n" +
                        "    \"instrumentDescription\": \"JP MORGAN\",\n" +
                        "    \"instrumentId\": 1,\n" +
                        "    \"txnDataTime\": \"2021-07-04T21:21:43.650Z\",\n" +
                        "    \"uuid\": \"3413-2432-1111-0000\",\n" +
                        "    \"vendorId\": -1,\n" +
                        "    \"vendorName\": \"VENDOR_A\"\n" +
                        "}"))
                .andDo(print())
                .andExpect(status().is4xxClientError());
    }

    // get a empty list when Instrument Code doesn't exist
    @Test
    void getEmptyPricesByInstrumentCode() throws Exception {
        when(tradedInstrumentPricingService.getPricesByInstrumentCode("NOTEXISTCODE"))
                .thenReturn(new HashSet<>());

        mockMvc.perform(get("/api/prices/instrument/NOTEXISTCODE"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.message").value("Operation approved."))
                .andExpect(jsonPath("$.body").isEmpty());
    }

    // get all the pricing data by instrumentCode: JPMC
    @Test
    void getPricesByInstrumentCode() throws Exception {
        when(tradedInstrumentPricingService.getPricesByInstrumentCode(MockDataUtil.INSTRUMENT_CODE_JPMC))
                .thenReturn(MockDataUtil.getPriceByInstrumentCodeJPMC());

        mockMvc.perform(get("/api/prices/instrument/" + MockDataUtil.INSTRUMENT_CODE_JPMC))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.message").value("Operation approved."))
                .andExpect(jsonPath("$.body.[0].instrument.instrumentCode").value(MockDataUtil.INSTRUMENT_CODE_UKEX))
                .andExpect(jsonPath("$.body.[1].instrument.instrumentCode").value(MockDataUtil.INSTRUMENT_CODE_UKEX))
                .andExpect(jsonPath("$.body.[2].instrument.instrumentCode").value(MockDataUtil.INSTRUMENT_CODE_UKEX))
                .andExpect(jsonPath("$.body.[3].instrument.instrumentCode").value(MockDataUtil.INSTRUMENT_CODE_UKEX))
                .andExpect(jsonPath("$.body.[4].instrument.instrumentCode").value(MockDataUtil.INSTRUMENT_CODE_UKEX))
        ;

    }

    // get empty pricing data by vendorId that doesn't exit: 9999999
    @Test
    void getEmptyPricesByVendorId() throws Exception {
        when(tradedInstrumentPricingService.getPricesByVendorId(9999999l))
                .thenReturn(new HashSet<>());

        mockMvc.perform(get("/api/prices/instrument/9999999"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.message").value("Operation approved."))
                .andExpect(jsonPath("$.body").isEmpty());
    }

    // get all the pricing data by vendorId: AAA
    @Test
    void getPricesByVendorId() throws Exception {
        when(tradedInstrumentPricingService.getPricesByVendorId(MockDataUtil.VENDOR_ID_AAA))
                .thenReturn(MockDataUtil.getPriceByVendorIdAAA());

        mockMvc.perform(get("/api/prices/vendor/" + MockDataUtil.VENDOR_ID_AAA))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.message").value("Operation approved."))
                .andExpect(jsonPath("$.body.[0].vendor.vendorId").value(MockDataUtil.VENDOR_ID_AAA))
                .andExpect(jsonPath("$.body.[1].vendor.vendorId").value(MockDataUtil.VENDOR_ID_AAA))
                .andExpect(jsonPath("$.body.[2].vendor.vendorId").value(MockDataUtil.VENDOR_ID_AAA))
        ;
    }
}
