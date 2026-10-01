package com.danidevbank.demo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.danidevbank.demo.dto.request.TransferRequest;
import com.danidevbank.demo.dto.response.TransactionResponse;
import com.danidevbank.demo.entity.Account;
import com.danidevbank.demo.entity.Transaction;
import com.danidevbank.demo.entity.enums.TransactionType;
import com.danidevbank.demo.exception.BadRequestException;
import com.danidevbank.demo.exception.InsufficientBalanceException;
import com.danidevbank.demo.exception.ResourceNotFoundException;
import com.danidevbank.demo.repository.AccountRepository;
import com.danidevbank.demo.repository.TransactionRepository;
import com.danidevbank.demo.service.TransactionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public TransactionResponse transfer(TransferRequest request, String currentUserEmail) {
        if (request.getSourceAccountNumber().equals(request.getDestinationAccountNumber())) {
            throw new BadRequestException("La cuenta de origen y la de destino no pueden ser la misma");
        }

        Account sourceAccount = accountRepository.findByAccountNumber(request.getSourceAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta de origen no encontrada: " + request.getSourceAccountNumber()));

        if (!sourceAccount.getUser().getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("La cuenta de origen no pertenece al usuario autenticado");
        }

        Account destinationAccount = accountRepository.findByAccountNumber(request.getDestinationAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta de destino no encontrada: " + request.getDestinationAccountNumber()));

        if (sourceAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Saldo insuficiente para realizar la transferencia");
        }

        sourceAccount.setBalance(sourceAccount.getBalance().subtract(request.getAmount()));
        destinationAccount.setBalance(destinationAccount.getBalance().add(request.getAmount()));

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);

        Transaction transaction = Transaction.builder()
                .sourceAccount(sourceAccount)
                .destinationAccount(destinationAccount)
                .amount(request.getAmount())
                .transactionType(TransactionType.TRANSFER)
                .description(request.getDescription() == null || request.getDescription().isBlank() ? "Transferencia entre cuentas" : request.getDescription())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAccountHistory(String accountNumber, String currentUserEmail) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada: " + accountNumber));

        if (!account.getUser().getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("No tiene permisos para consultar el historial de esta cuenta");
        }

        return transactionRepository.findAllByAccountId(account.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .sourceAccountNumber(transaction.getSourceAccount() != null ? transaction.getSourceAccount().getAccountNumber() : null)
                .destinationAccount(transaction.getDestinationAccount() != null ? transaction.getDestinationAccount().getAccountNumber() : null)
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .description(transaction.getDescription())
                .timestamp(transaction.getTimestamp())
                .build();
    }
}
