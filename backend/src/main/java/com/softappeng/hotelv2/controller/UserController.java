package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.security.user.Role;
import com.softappeng.hotelv2.security.user.User;
import com.softappeng.hotelv2.security.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User management (ADMIN only - enforced in SecurityConfiguration).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> all() {
        return userRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody User user) {
        if (userRepo.existsByUsername(user.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Nom d'utilisateur déjà utilisé");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole(Role.RECEPTION);
        User saved = userRepo.save(user);
        saved.setPassword(null);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User data) {
        User u = userRepo.findById(id).orElseThrow();
        u.setNom(data.getNom());
        u.setPrenom(data.getPrenom());
        if (data.getRole() != null) u.setRole(data.getRole());
        u.setActif(data.isActif());
        if (data.getPassword() != null && !data.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(data.getPassword()));
        }
        return userRepo.save(u);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
