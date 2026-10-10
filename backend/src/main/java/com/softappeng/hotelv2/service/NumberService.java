package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.repositories.CommandeRepo;
import com.softappeng.hotelv2.repositories.TicketRepasRepo;
import com.softappeng.hotelv2.repositories.VenteRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Human readable, sequential document numbers.
 * Format: PREFIX-YYYYMMDD-NNNN
 */
@Service
@RequiredArgsConstructor
public class NumberService {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final VenteRepo venteRepo;
    private final CommandeRepo commandeRepo;
    private final TicketRepasRepo ticketRepo;

    public String nextVente() {
        return prefix("VTE") + pad(venteRepo.count() + 1);
    }

    public String nextCommande() {
        return prefix("CMD") + pad(commandeRepo.count() + 1);
    }

    public String nextTicket() {
        return prefix("TR") + pad(ticketRepo.count() + 1);
    }

    public String randomCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private String prefix(String p) {
        return p + "-" + LocalDate.now().format(DAY) + "-";
    }

    private String pad(long n) {
        return String.format("%04d", n);
    }
}
