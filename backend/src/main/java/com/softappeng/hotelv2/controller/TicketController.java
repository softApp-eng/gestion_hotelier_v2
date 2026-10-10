package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.TicketRepas;
import com.softappeng.hotelv2.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public List<TicketRepas> all(@RequestParam(required = false) String date) {
        return date == null ? ticketService.findAll() : ticketService.byDate(LocalDate.parse(date));
    }

    @GetMapping("/{id}")
    public TicketRepas one(@PathVariable Long id) {
        return ticketService.findById(id);
    }

    @GetMapping("/code/{code}")
    public TicketRepas byCode(@PathVariable String code) {
        return ticketService.findByCode(code);
    }

    @PostMapping
    public ResponseEntity<TicketRepas> create(@RequestBody TicketRepas t) {
        return new ResponseEntity<>(ticketService.create(t), HttpStatus.CREATED);
    }

    @PostMapping("/{code}/utiliser")
    public TicketRepas utiliser(@PathVariable String code) {
        return ticketService.utiliser(code);
    }

    @PostMapping("/{id}/annuler")
    public TicketRepas annuler(@PathVariable Long id) {
        return ticketService.annuler(id);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        byte[] pdf = ticketService.generatePdf(id);
        ticketService.markPrinted(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "ticket-" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
