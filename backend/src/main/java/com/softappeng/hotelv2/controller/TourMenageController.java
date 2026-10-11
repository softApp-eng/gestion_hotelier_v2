package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.TourMenage;
import com.softappeng.hotelv2.service.TourMenageService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/tour-menage")
@RequiredArgsConstructor
public class TourMenageController {

    private final TourMenageService service;

    /** Weekly roster for the week containing {@code debut} (defaults to current week). */
    @GetMapping
    public Map<String, Object> semaine(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut) {
        return service.semaine(debut);
    }

    /** Save / override one cell (femme de chambre × day). */
    @PostMapping
    public TourMenage enregistrer(@RequestBody Map<String, Object> body) {
        Long gouvernanteId = body.get("gouvernanteId") == null ? null
                : Long.valueOf(String.valueOf(body.get("gouvernanteId")));
        LocalDate date = body.get("date") == null ? null : LocalDate.parse(String.valueOf(body.get("date")));
        String etage = body.get("etage") == null ? null : String.valueOf(body.get("etage"));
        Boolean repos = body.get("repos") == null ? null : Boolean.valueOf(String.valueOf(body.get("repos")));
        String note = body.get("note") == null ? null : String.valueOf(body.get("note"));
        return service.enregistrer(gouvernanteId, date, etage, repos, note);
    }
}
