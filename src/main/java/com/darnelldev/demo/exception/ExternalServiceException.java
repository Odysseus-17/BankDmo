package com.darnelldev.demo.exception;

// Se lanza cuando falla una API externa (por ejemplo, la de tasas de cambio)
public class ExternalServiceException extends RuntimeException {
    public ExternalServiceException(String message) {
        super(message);
    }
}
