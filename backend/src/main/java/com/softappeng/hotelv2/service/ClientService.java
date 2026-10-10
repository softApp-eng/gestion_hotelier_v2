package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Client;
import com.softappeng.hotelv2.repositories.ClientRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepo clientRepo;

    public List<Client> findAll() {
        return clientRepo.findAll();
    }

    public Page<Client> search(String q, int page, int size) {
        return clientRepo.search(q == null || q.isBlank() ? null : q.trim(), PageRequest.of(page, size));
    }

    public Client findById(Long id) {
        return clientRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Client introuvable: " + id));
    }

    public Client save(Client client) {
        return clientRepo.save(client);
    }

    public Client update(Long id, Client data) {
        Client c = findById(id);
        c.setNom(data.getNom());
        c.setPrenom(data.getPrenom());
        c.setEmail(data.getEmail());
        c.setTelephone(data.getTelephone());
        c.setNationalite(data.getNationalite());
        c.setCin(data.getCin());
        c.setPasseport(data.getPasseport());
        c.setAdresse(data.getAdresse());
        c.setTypeClient(data.getTypeClient());
        c.setObservation(data.getObservation());
        c.setBlacklist(data.isBlacklist());
        c.setVip(data.isVip());
        c.setDateNaissance(data.getDateNaissance());
        return clientRepo.save(c);
    }

    public void delete(Long id) {
        clientRepo.deleteById(id);
    }

    public long countBlacklist() {
        return clientRepo.countByBlacklistTrue();
    }
}
