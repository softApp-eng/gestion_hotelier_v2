package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.ClotureJournaliere;
import com.softappeng.hotelv2.service.NightAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/night-audit")
@RequiredArgsConstructor
public class NightAuditController {

    private final NightAuditService nightAuditService;

    @GetMapping("/apercu")
    public Map<String, Object> apercu(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return nightAuditService.apercu(date);
    }

    @PostMapping("/cloturer")
    public ClotureJournaliere cloturer(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String observation) {
        return nightAuditService.cloturer(date, observation);
    }

    @GetMapping("/main-courante")
    public List<Map<String, Object>> mainCourante(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return nightAuditService.mainCourante(date);
    }

    @GetMapping("/derniere")
    public ResponseEntity<ClotureJournaliere> derniere() {
        return nightAuditService.derniere()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
