package com.darnelldev.demo.service;

import java.math.BigDecimal;

import com.darnelldev.demo.dto.response.ConversionResponse;
import com.darnelldev.demo.dto.response.ExchangeRateResponse;

public interface ExchangeRateService {
    ExchangeRateResponse getRates(String base);
    ConversionResponse convert(String from, String to, BigDecimal amount);
}
