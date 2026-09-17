package com.darnelldev.demo.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
@Getter
@Setter
public class TransferRequest {

    @Notblank(message=" la cuenta de origen es requerida")
    private String sourceAccountNumber;

    @Notblank(message=" la cuenta de destino es requerida")
    private String destinationAccountNumber;

    @NotNull(message=" la cuenta no debe ir vacia")
    @Decimalmin(value = "0.01", message="el monto debe ser superio a cero")
    private BigDecimal amount;

    private String description;
}
