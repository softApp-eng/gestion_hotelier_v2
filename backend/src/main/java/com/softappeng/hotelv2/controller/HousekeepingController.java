package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.ProblemeTechnique;
import com.softappeng.hotelv2.service.HousekeepingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/housekeeping")
@RequiredArgsConstructor
public class HousekeepingController {

    private final HousekeepingService service;

    /** Room state board (ménage) with optional filters. */
    @GetMapping("/etat-chambres")
    public List<Map<String, Object>> etatChambres(
            @RequestParam(required = false) Long pavillonId,
            @RequestParam(required = false) String etage,
            @RequestParam(required = false) Long typeChambreId,
            @RequestParam(required = false) String etatMenage) {
        return service.etatChambres(pavillonId, etage, typeChambreId, etatMenage);
    }

    /** Gouvernante planning: by floor, by type + flat list. */
    @GetMapping("/planning-gouvernante")
    public Map<String, Object> planningGouvernante(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.planningGouvernante(date);
    }

    /** Printable occupancy matrix: per pavilion, per floor, the rooms with their situation. */
    @GetMapping("/planning-occupation")
    public Map<String, Object> planningOccupation(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.planningOccupation(date);
    }

    @PostMapping("/{chambreId}/etat-menage")
    public Chambre changerEtatMenage(@PathVariable Long chambreId,
                                     @RequestParam String etatMenage,
                                     @RequestParam(required = false) Long gouvernanteId,
                                     @RequestParam(required = false) String observation) {
        return service.changerEtatMenage(chambreId, etatMenage, gouvernanteId, observation);
    }

    @PostMapping("/{chambreId}/gouvernante")
    public Chambre affecterGouvernante(@PathVariable Long chambreId,
                                       @RequestParam(required = false) Long gouvernanteId) {
        return service.affecterGouvernante(chambreId, gouvernanteId);
    }

    // ---------------- technical problems ----------------

    @GetMapping("/problemes")
    public List<ProblemeTechnique> problemes(@RequestParam(required = false) String statut) {
        return service.problemes(statut);
    }

    @PostMapping("/problemes")
    public ProblemeTechnique signaler(@RequestBody Map<String, Object> body) {
        Long chambreId = Long.valueOf(String.valueOf(body.get("chambreId")));
        String description = body.get("description") == null ? null : String.valueOf(body.get("description"));
        String priorite = body.get("priorite") == null ? null : String.valueOf(body.get("priorite"));
        return service.signalerProbleme(chambreId, description, priorite);
    }

    @PostMapping("/problemes/{id}/statut")
    public ProblemeTechnique changerStatut(@PathVariable Long id,
                                           @RequestParam String statut,
                                           @RequestParam(required = false) String resolution) {
        return service.changerStatutProbleme(id, statut, resolution);
    }
}
