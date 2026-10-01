package com.darnelldev.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest
{
    @Email(message="Debe proporcionar un correo valido")
    @NotBlank(message="El correo no puede estar vacio")
    private String email;

    @NotBlank(message="El password no puede estar vacio")
    private String password;
}
