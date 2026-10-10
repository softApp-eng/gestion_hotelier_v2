package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.service.SejourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sejours")
@RequiredArgsConstructor
public class SejourController {

    private final SejourService sejourService;

    @GetMapping
    public List<Sejour> all(@RequestParam(required = false) String statut) {
        return statut == null ? sejourService.findAll() : sejourService.enCours();
    }

    @GetMapping("/{id}")
    public Sejour one(@PathVariable Long id) {
        return sejourService.findById(id);
    }

    @PostMapping("/checkin/{reservationId}")
    public Sejour checkinFromReservation(@PathVariable Long reservationId) {
        return sejourService.checkinFromReservation(reservationId);
    }

    @PostMapping("/checkin-direct")
    public ResponseEntity<Sejour> checkinDirect(@RequestBody Sejour sejour) {
        return new ResponseEntity<>(sejourService.checkinDirect(sejour), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/checkout")
    public Sejour checkout(@PathVariable Long id) {
        return sejourService.checkout(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sejourService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
