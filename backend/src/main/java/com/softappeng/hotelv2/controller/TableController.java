package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.TableResto;
import com.softappeng.hotelv2.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public List<TableResto> all() {
        return tableService.findAll();
    }

    @GetMapping("/{id}")
    public TableResto one(@PathVariable Long id) {
        return tableService.findById(id);
    }

    @PostMapping
    public ResponseEntity<TableResto> create(@RequestBody TableResto t) {
        return new ResponseEntity<>(tableService.save(t), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public TableResto update(@PathVariable Long id, @RequestBody TableResto t) {
        t.setId(id);
        return tableService.save(t);
    }

    @PatchMapping("/{id}/statut")
    public TableResto changeStatut(@PathVariable Long id, @RequestParam String statut) {
        return tableService.changeStatut(id, statut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tableService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
