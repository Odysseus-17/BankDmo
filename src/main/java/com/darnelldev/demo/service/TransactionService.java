package com.darnelldev.demo.service;

import java.util.List;

import com.darnelldev.demo.dto.request.AccountOperationRequest;
import com.darnelldev.demo.dto.request.TransferRequest;
import com.darnelldev.demo.dto.response.TransactionResponse;

public interface TransactionService {
    TransactionResponse transfer(TransferRequest request, String currentUserEmail);
    TransactionResponse deposit(AccountOperationRequest request, String currentUserEmail);
    TransactionResponse withdraw(AccountOperationRequest request, String currentUserEmail);
    List<TransactionResponse> getAccountHistory(String accountNumber, String currentUserEmail);
}
