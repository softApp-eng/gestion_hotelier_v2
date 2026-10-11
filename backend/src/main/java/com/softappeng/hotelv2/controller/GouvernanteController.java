package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Gouvernante;
import com.softappeng.hotelv2.service.GouvernanteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gouvernantes")
@RequiredArgsConstructor
public class GouvernanteController {

    private final GouvernanteService service;

    @GetMapping
    public List<Gouvernante> all(@RequestParam(required = false) Boolean actifs,
                                 @RequestParam(required = false) Long pavillonId) {
        if (pavillonId != null) return service.byPavillon(pavillonId);
        return service.findAll(Boolean.TRUE.equals(actifs));
    }

    @GetMapping("/{id}")
    public Gouvernante one(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Gouvernante save(@RequestBody Gouvernante g) {
        return service.save(g);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
