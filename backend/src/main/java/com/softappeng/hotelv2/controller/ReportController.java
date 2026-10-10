package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return reportService.dashboard();
    }

    @GetMapping("/ca-semaine")
    public List<Map<String, Object>> caSemaine() {
        return reportService.last7Days();
    }

    @GetMapping("/ventes")
    public Map<String, Object> ventes(@RequestParam String from, @RequestParam String to) {
        return reportService.ventesEntre(LocalDate.parse(from), LocalDate.parse(to));
    }
}
