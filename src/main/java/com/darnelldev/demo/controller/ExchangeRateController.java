package com.darnelldev.demo.controller;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.darnelldev.demo.dto.response.ConversionResponse;
import com.darnelldev.demo.dto.response.ExchangeRateResponse;
import com.darnelldev.demo.service.ExchangeRateService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/exchange-rates")
@SecurityRequirement(name = "bearerAuth")
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    public ExchangeRateController(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    @GetMapping
    public ResponseEntity<ExchangeRateResponse> getRates(@RequestParam(defaultValue = "USD") String base) {
        return ResponseEntity.ok(exchangeRateService.getRates(base));
    }

    @GetMapping("/convert")
    public ResponseEntity<ConversionResponse> convert(
            @RequestParam(defaultValue = "USD") String from,
            @RequestParam(defaultValue = "COP") String to,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(exchangeRateService.convert(from, to, amount));
    }
}
