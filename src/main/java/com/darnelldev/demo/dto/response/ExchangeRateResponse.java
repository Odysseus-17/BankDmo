package com.darnelldev.demo.dto.response;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExchangeRateResponse {
    private String base;
    private String lastUpdate;
    private String source;
    // Cuántas unidades de cada moneda equivalen a 1 unidad de la moneda base
    private Map<String, BigDecimal> rates;
}
