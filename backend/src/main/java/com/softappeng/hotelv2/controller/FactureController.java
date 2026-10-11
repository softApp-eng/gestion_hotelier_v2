package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Facture;
import com.softappeng.hotelv2.service.FacturationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
public class FactureController {

    private final FacturationService facturationService;

    @GetMapping
    public List<Facture> all() {
        return facturationService.findAll();
    }

    @GetMapping("/{id}")
    public Facture one(@PathVariable Long id) {
        return facturationService.findById(id);
    }

    @GetMapping("/sejour/{sejourId}")
    public List<Facture> bySejour(@PathVariable Long sejourId) {
        return facturationService.bySejour(sejourId);
    }

    /** Generate (once) the invoice(s) for a stay. */
    @PostMapping("/sejour/{sejourId}")
    public ResponseEntity<List<Facture>> generer(@PathVariable Long sejourId) {
        return new ResponseEntity<>(facturationService.genererPourSejour(sejourId), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        byte[] pdf = facturationService.generatePdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "facture-" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
