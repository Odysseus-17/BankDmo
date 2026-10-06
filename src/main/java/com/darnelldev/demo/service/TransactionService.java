package com.darnelldev.demo.service;

import java.util.List;

import com.darnelldev.demo.dto.request.TransferRequest;
import com.darnelldev.demo.dto.response.TransactionResponse;

public interface TransactionService {
    TransactionResponse transfer(TransferRequest request, String currentUserEmail);
    List<TransactionResponse> getAccountHistory(String accountNumber, String currentUserEmail);
}
