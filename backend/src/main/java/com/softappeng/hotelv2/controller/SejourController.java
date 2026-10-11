package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.service.SejourService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sejours")
@RequiredArgsConstructor
public class SejourController {

    private final SejourService sejourService;

    @GetMapping
    public List<Sejour> all(@RequestParam(required = false) String statut) {
        return (statut == null || statut.isBlank()) ? sejourService.findAll() : sejourService.byStatut(statut);
    }

    /** Advanced search used by the Séjours screen filters. */
    @GetMapping("/recherche")
    public List<Sejour> recherche(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkinFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkinTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkoutFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkoutTo,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String numero) {
        return sejourService.recherche(checkinFrom, checkinTo, checkoutFrom, checkoutTo, statut, numero);
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

    /** Prolongation du séjour : nouvelle date de départ prévue. */
    @PutMapping("/{id}/prolonger")
    public Sejour prolonger(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        LocalDate d = body.get("dateDepart") == null ? null : LocalDate.parse(String.valueOf(body.get("dateDepart")));
        return sejourService.prolonger(id, d);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sejourService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
