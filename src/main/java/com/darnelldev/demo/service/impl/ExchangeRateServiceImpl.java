package com.darnelldev.demo.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.darnelldev.demo.dto.response.ConversionResponse;
import com.darnelldev.demo.dto.response.ExchangeRateResponse;
import com.darnelldev.demo.exception.BadRequestException;
import com.darnelldev.demo.exception.ExternalServiceException;
import com.darnelldev.demo.service.ExchangeRateService;
import com.fasterxml.jackson.annotation.JsonProperty;

// Consume la API pública de ExchangeRate-API (https://www.exchangerate-api.com/docs/free).
// No necesita clave y actualiza las tasas una vez al día.
@Service
public class ExchangeRateServiceImpl implements ExchangeRateService {

    private static final String SOURCE = "ExchangeRate-API";

    private final RestClient restClient;
    private final Duration cacheDuration;
    // Guarda la última respuesta por moneda base para no llamar a la API externa en cada petición
    private final Map<String, CachedRates> cache = new ConcurrentHashMap<>();

    public ExchangeRateServiceImpl(
            @Value("${app.exchange-rate.base-url:https://open.er-api.com/v6}") String baseUrl,
            @Value("${app.exchange-rate.cache-minutes:60}") long cacheMinutes) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.cacheDuration = Duration.ofMinutes(cacheMinutes);
    }

    @Override
    public ExchangeRateResponse getRates(String base) {
        String code = normalizeCode(base);
        CachedRates cached = cache.get(code);
        if (cached != null && cached.fetchedAt().plus(cacheDuration).isAfter(Instant.now())) {
            return cached.response();
        }

        ExchangeRateResponse response = fetchRates(code);
        cache.put(code, new CachedRates(response, Instant.now()));
        return response;
    }

    @Override
    public ConversionResponse convert(String from, String to, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("El monto debe ser superior a cero");
        }

        String target = normalizeCode(to);
        ExchangeRateResponse rates = getRates(from);
        BigDecimal rate = rates.getRates().get(target);
        if (rate == null) {
            throw new BadRequestException("Moneda no soportada: " + target);
        }

        return ConversionResponse.builder()
                .from(rates.getBase())
                .to(target)
                .amount(amount)
                .rate(rate)
                .result(amount.multiply(rate).setScale(2, RoundingMode.HALF_EVEN))
                .lastUpdate(rates.getLastUpdate())
                .build();
    }

    private ExchangeRateResponse fetchRates(String base) {
        ExternalRates body;
        try {
            body = restClient.get()
                    .uri("/latest/{base}", base)
                    .retrieve()
                    .body(ExternalRates.class);
        } catch (RestClientException ex) {
            throw new ExternalServiceException("No fue posible consultar las tasas de cambio. Intenta más tarde.");
        }

        if (body == null) {
            throw new ExternalServiceException("La API de tasas de cambio no devolvió datos.");
        }
        if (!"success".equals(body.result())) {
            if ("unsupported-code".equals(body.errorType())) {
                throw new BadRequestException("Moneda no soportada: " + base);
            }
            throw new ExternalServiceException("La API de tasas de cambio respondió con un error: " + body.errorType());
        }

        return ExchangeRateResponse.builder()
                .base(body.baseCode())
                .lastUpdate(body.lastUpdate())
                .source(SOURCE)
                .rates(body.rates())
                .build();
    }

    private String normalizeCode(String code) {
        String normalized = code == null ? "" : code.trim().toUpperCase();
        if (!normalized.matches("[A-Z]{3}")) {
            throw new BadRequestException("El código de moneda debe tener 3 letras, por ejemplo USD o COP");
        }
        return normalized;
    }

    // Forma del JSON que devuelve open.er-api.com
    private record ExternalRates(
            String result,
            @JsonProperty("base_code") String baseCode,
            @JsonProperty("time_last_update_utc") String lastUpdate,
            @JsonProperty("error-type") String errorType,
            Map<String, BigDecimal> rates) {
    }

    private record CachedRates(ExchangeRateResponse response, Instant fetchedAt) {
    }
}
