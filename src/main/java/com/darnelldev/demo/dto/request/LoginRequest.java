package com.darnelldev.demo.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest
{
    @Email(message=" Debe proporcionar u correo valido")
    @NotBlank(message=" El correo no puede estar vacio")
    private String email;

    @Size(min=6, message = "el password debe tener minimo 6 caracteres")
    @Notblank(message=" El password no puede estar vacio")
    private String password;
}
