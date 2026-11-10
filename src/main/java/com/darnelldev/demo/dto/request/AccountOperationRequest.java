package com.darnelldev.demo.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Usado para depositos y retiros sobre una sola cuenta
@Getter
@Setter
public class AccountOperationRequest {

    @NotBlank(message="El numero de cuenta es requerido")
    private String accountNumber;

    @NotNull(message="El monto es obligatorio")
    @DecimalMin(value = "0.01", message="El monto debe ser superior a cero")
    private BigDecimal amount;

    private String description;
}
