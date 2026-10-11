package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.CompteClient;
import com.softappeng.hotelv2.entities.Prestation;
import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.service.CompteClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comptes")
@RequiredArgsConstructor
public class CompteClientController {

    private final CompteClientService compteService;

    @GetMapping
    public List<CompteClient> all(@RequestParam(required = false) String statut) {
        return "OUVERT".equals(statut) ? compteService.ouverts() : compteService.findAll();
    }

    @GetMapping("/{id}")
    public CompteClient one(@PathVariable Long id) {
        return compteService.findById(id);
    }

    @GetMapping("/sejour/{sejourId}")
    public CompteClient bySejour(@PathVariable Long sejourId) {
        return compteService.findBySejour(sejourId);
    }

    @GetMapping("/{id}/prestations")
    public List<Prestation> prestations(@PathVariable Long id) {
        return compteService.prestations(id);
    }

    @PostMapping("/{id}/prestations")
    public ResponseEntity<Prestation> ajouterPrestation(@PathVariable Long id, @RequestBody Prestation p) {
        return new ResponseEntity<>(compteService.ajouterPrestation(id, p), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/hebergement")
    public ResponseEntity<?> hebergement(@PathVariable Long id) {
        CompteClient c = compteService.findById(id);
        Sejour s = c.getSejour();
        if (s == null) return ResponseEntity.badRequest().body("Compte sans séjour");
        Prestation p = compteService.ajouterHebergement(s);
        return ResponseEntity.ok(p);
    }

    @PostMapping("/{id}/cloturer")
    public CompteClient cloturer(@PathVariable Long id) {
        return compteService.cloturer(id);
    }
}
