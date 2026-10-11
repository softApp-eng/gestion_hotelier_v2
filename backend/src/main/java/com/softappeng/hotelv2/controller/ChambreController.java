package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.TypeChambre;
import com.softappeng.hotelv2.service.ChambreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chambres")
@RequiredArgsConstructor
public class ChambreController {

    private final ChambreService chambreService;

    @GetMapping
    public List<Chambre> all() {
        return chambreService.findAll();
    }

    @GetMapping("/{id}")
    public Chambre one(@PathVariable Long id) {
        return chambreService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Chambre> create(@RequestBody Chambre chambre) {
        return new ResponseEntity<>(chambreService.save(chambre), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public Chambre update(@PathVariable Long id, @RequestBody Chambre chambre) {
        chambre.setId(id);
        return chambreService.save(chambre);
    }

    @PatchMapping("/{id}/etat")
    public Chambre changeEtat(@PathVariable Long id, @RequestParam String etat) {
        return chambreService.changeEtat(id, etat);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        chambreService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Room types ----
    @GetMapping("/types")
    public List<TypeChambre> types() {
        return chambreService.findAllTypes();
    }

    @PostMapping("/types")
    public TypeChambre createType(@RequestBody TypeChambre type) {
        return chambreService.saveType(type);
    }

    @PutMapping("/types/{id}")
    public TypeChambre updateType(@PathVariable Long id, @RequestBody TypeChambre type) {
        type.setId(id);
        return chambreService.saveType(type);
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable Long id) {
        chambreService.deleteType(id);
        return ResponseEntity.noContent().build();
    }
}
