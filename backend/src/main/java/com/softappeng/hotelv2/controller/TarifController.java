package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Tarif;
import com.softappeng.hotelv2.service.TarifService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarifs")
@RequiredArgsConstructor
public class TarifController {

    private final TarifService tarifService;

    @GetMapping
    public List<Tarif> all() {
        return tarifService.findAll();
    }

    /** Price lookup used by the reservation form. */
    @GetMapping("/prix")
    public ResponseEntity<Double> prix(@RequestParam Long categorieClientId,
                                       @RequestParam Long typeChambreId) {
        Double prix = tarifService.findPrix(categorieClientId, typeChambreId);
        return prix == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(prix);
    }

    @PostMapping
    public ResponseEntity<Tarif> create(@RequestBody Tarif t) {
        return new ResponseEntity<>(tarifService.save(t), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tarifService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
