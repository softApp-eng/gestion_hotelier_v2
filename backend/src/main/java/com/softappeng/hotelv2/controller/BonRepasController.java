package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.BonRepas;
import com.softappeng.hotelv2.service.BonRepasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bons-repas")
@RequiredArgsConstructor
public class BonRepasController {

    private final BonRepasService bonService;

    @GetMapping
    public List<BonRepas> all(@RequestParam(required = false) String date) {
        return date == null ? bonService.findAll() : bonService.byDate(LocalDate.parse(date));
    }

    @GetMapping("/{id}")
    public BonRepas one(@PathVariable Long id) {
        return bonService.findById(id);
    }

    @PostMapping
    public ResponseEntity<BonRepas> create(@RequestBody BonRepas b) {
        return new ResponseEntity<>(bonService.create(b), HttpStatus.CREATED);
    }

    @PostMapping("/utiliser/{code}")
    public BonRepas utiliser(@PathVariable String code) {
        return bonService.utiliser(code);
    }

    @PostMapping("/{id}/annuler")
    public BonRepas annuler(@PathVariable Long id) {
        return bonService.annuler(id);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        byte[] pdf = bonService.generatePdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "bon-repas-" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
