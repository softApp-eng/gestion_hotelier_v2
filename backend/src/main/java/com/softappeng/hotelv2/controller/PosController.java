package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.dto.VenteRequest;
import com.softappeng.hotelv2.entities.SessionCaisse;
import com.softappeng.hotelv2.entities.Vente;
import com.softappeng.hotelv2.service.PosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;

    // ---- Cash register session ----

    @GetMapping("/session")
    public ResponseEntity<SessionCaisse> currentSession() {
        return ResponseEntity.ok(posService.currentSession());
    }

    @GetMapping("/sessions")
    public List<SessionCaisse> sessions() {
        return posService.sessions();
    }

    @PostMapping("/session/open")
    public ResponseEntity<SessionCaisse> open(@RequestBody Map<String, Object> body) {
        double montant = body.get("montantOuverture") == null ? 0
                : Double.parseDouble(body.get("montantOuverture").toString());
        String obs = body.get("observation") == null ? null : body.get("observation").toString();
        return new ResponseEntity<>(posService.openSession(montant, obs), HttpStatus.CREATED);
    }

    @PostMapping("/session/{id}/close")
    public SessionCaisse close(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        double montant = body.get("montantCompte") == null ? 0
                : Double.parseDouble(body.get("montantCompte").toString());
        String obs = body.get("observation") == null ? null : body.get("observation").toString();
        return posService.closeSession(id, montant, obs);
    }

    // ---- Sales ----

    @GetMapping("/ventes")
    public List<Vente> ventes() {
        return posService.ventes();
    }

    @GetMapping("/ventes/jour")
    public List<Vente> ventesDuJour() {
        return posService.ventesDuJour();
    }

    @GetMapping("/ventes/{id}")
    public Vente one(@PathVariable Long id) {
        return posService.findVente(id);
    }

    @PostMapping("/ventes")
    public ResponseEntity<Vente> create(@RequestBody VenteRequest req) {
        return new ResponseEntity<>(posService.recordVente(req), HttpStatus.CREATED);
    }

    @PostMapping("/ventes/{id}/annuler")
    public Vente annuler(@PathVariable Long id) {
        return posService.cancelVente(id);
    }
}
