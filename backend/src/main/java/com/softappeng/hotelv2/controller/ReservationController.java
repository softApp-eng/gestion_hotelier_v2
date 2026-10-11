package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.Reservation;
import com.softappeng.hotelv2.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public List<Reservation> all(@RequestParam(required = false) String statut) {
        return statut == null ? reservationService.findAll() : reservationService.byStatut(statut);
    }

    @GetMapping("/arrivees")
    public List<Reservation> arrivalsToday() {
        return reservationService.arrivalsToday();
    }

    @GetMapping("/{id}")
    public Reservation one(@PathVariable Long id) {
        return reservationService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Reservation r) {
        return new ResponseEntity<>(reservationService.save(r), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public Reservation update(@PathVariable Long id, @RequestBody Reservation r) {
        r.setId(id);
        return reservationService.save(r);
    }

    /** Prolongation d'une réservation : nouvelle date de départ. */
    @PutMapping("/{id}/prolonger")
    public Reservation prolonger(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        LocalDate d = body.get("dateDepart") == null ? null : LocalDate.parse(String.valueOf(body.get("dateDepart")));
        return reservationService.prolonger(id, d);
    }

    @PatchMapping("/{id}/statut")
    public Reservation changeStatut(@PathVariable Long id, @RequestParam String statut) {
        return reservationService.changeStatut(id, statut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
