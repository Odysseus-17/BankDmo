package com.darnelldev.demo.dto.request;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Email;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message=" El nombre no puede estar vacio")
    private String firstName;

    @NotBlank(message=" El apellido no puede ir vacio")
    private String lastName;

    @Email(message=" Debe proporcionar u correo valido")
    @NotBlank(message=" El correo no puede estar vacio")
    private String email;

    @Size(min=6, message = "el password debe tener minimo 6 caracteres")
    @Notblank(message=" El password no puede estar vacio")
    private String password;
}
