package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Pavillon;
import com.softappeng.hotelv2.service.PavillonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pavillons")
@RequiredArgsConstructor
public class PavillonController {

    private final PavillonService pavillonService;

    @GetMapping
    public List<Pavillon> all() {
        return pavillonService.findAll();
    }

    @GetMapping("/{id}")
    public Pavillon one(@PathVariable Long id) {
        return pavillonService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Pavillon> create(@RequestBody Pavillon p) {
        return new ResponseEntity<>(pavillonService.save(p), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public Pavillon update(@PathVariable Long id, @RequestBody Pavillon p) {
        p.setId(id);
        return pavillonService.save(p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pavillonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
