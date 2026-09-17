package com.darnelldev.demo.repository;

import com.darnelldev.demo.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction WHERE t.sourceAccoutn.id = : accountId OR t.destinationAccount = : accountId ORDER BY t.timestamp DESC ")

    List<Transaction> findByAccountId(@Param("accountId") Long accountId);
}
