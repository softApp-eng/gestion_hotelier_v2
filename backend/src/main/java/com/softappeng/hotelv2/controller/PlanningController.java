package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.service.PlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Room planning endpoints (monthly grid, daily state, availability).
 */
@RestController
@RequestMapping("/api/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;

    @GetMapping
    public Map<String, Object> planning(@RequestParam(required = false) Long pavillonId,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return planningService.planning(pavillonId, debut, fin);
    }

    @GetMapping("/etat-journalier")
    public Map<String, Object> etatJournalier(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return planningService.etatJournalier(date);
    }

    @GetMapping("/disponibles")
    public List<Chambre> disponibles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false) Long pavillonId,
            @RequestParam(required = false) Long typeChambreId) {
        return planningService.disponibles(debut, fin, pavillonId, typeChambreId);
    }
}
