package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Organisme;
import com.softappeng.hotelv2.service.OrganismeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organismes")
@RequiredArgsConstructor
public class OrganismeController {

    private final OrganismeService organismeService;

    @GetMapping
    public List<Organisme> all() {
        return organismeService.findAll();
    }

    @GetMapping("/{id}")
    public Organisme one(@PathVariable Long id) {
        return organismeService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Organisme> create(@RequestBody Organisme o) {
        return new ResponseEntity<>(organismeService.save(o), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public Organisme update(@PathVariable Long id, @RequestBody Organisme o) {
        o.setId(id);
        return organismeService.save(o);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        organismeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
