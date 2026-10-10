package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.dto.CommandeRequest;
import com.softappeng.hotelv2.dto.LigneRequest;
import com.softappeng.hotelv2.dto.PaiementCommandeRequest;
import com.softappeng.hotelv2.entities.Commande;
import com.softappeng.hotelv2.service.CommandeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resto/commandes")
@RequiredArgsConstructor
public class CommandeController {

    private final CommandeService commandeService;

    @GetMapping
    public List<Commande> all(@RequestParam(required = false) String statut) {
        return "OUVERTE".equalsIgnoreCase(statut) ? commandeService.ouvertes() : commandeService.findAll();
    }

    @GetMapping("/ouvertes")
    public List<Commande> ouvertes() {
        return commandeService.ouvertes();
    }

    @GetMapping("/{id}")
    public Commande one(@PathVariable Long id) {
        return commandeService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Commande> save(@RequestBody CommandeRequest req) {
        boolean isNew = req.getId() == null;
        return new ResponseEntity<>(commandeService.save(req), isNew ? HttpStatus.CREATED : HttpStatus.OK);
    }

    @PostMapping("/{id}/lignes")
    public Commande addLine(@PathVariable Long id, @RequestBody LigneRequest ligne) {
        return commandeService.addLine(id, ligne);
    }

    @DeleteMapping("/{id}/lignes/{ligneId}")
    public Commande removeLine(@PathVariable Long id, @PathVariable Long ligneId) {
        return commandeService.removeLine(id, ligneId);
    }

    @PatchMapping("/{id}/statut")
    public Commande changeStatut(@PathVariable Long id, @RequestParam String statut) {
        return commandeService.changeStatut(id, statut);
    }

    @PostMapping("/{id}/payer")
    public Commande payer(@PathVariable Long id, @RequestBody PaiementCommandeRequest req) {
        return commandeService.payer(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commandeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
