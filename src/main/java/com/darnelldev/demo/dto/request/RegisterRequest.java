package com.darnelldev.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message="El nombre no puede estar vacio")
    private String firstName;

    @NotBlank(message="El apellido no puede ir vacio")
    private String lastName;

    @Email(message="Debe proporcionar un correo valido")
    @NotBlank(message="El correo no puede estar vacio")
    private String email;

    @NotBlank(message="El password no puede estar vacio")
    @Size(min=6, message="El password debe tener minimo 6 caracteres")
    private String password;
}
