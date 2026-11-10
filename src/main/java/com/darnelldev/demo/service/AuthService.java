package com.darnelldev.demo.service;

import com.darnelldev.demo.dto.request.LoginRequest;
import com.darnelldev.demo.dto.request.RegisterRequest;
import com.darnelldev.demo.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
