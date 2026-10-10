import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resto-tables',
  templateUrl: './resto-tables.component.html'
})
export class RestoTablesComponent implements OnInit {

  tables: any[] = [];
  produits: any[] = [];
  categories: any[] = [];
  openCommandes: any[] = [];

  selectedCategorieId: number | null = null;
  currentTable: any = null;
  commandeId: number | null = null;
  chambre: string | null = null;
  panier: any[] = [];
  paiementMode = 'ESPECES';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadTables();
    this.loadProduits();
    this.api.categories().subscribe(d => this.categories = d);
    this.loadOpen();
  }

  loadTables(): void { this.api.tables().subscribe(d => this.tables = d); }
  loadProduits(): void { this.api.produits().subscribe(d => this.produits = d.filter((p: any) => p.disponible)); }
  loadOpen(): void { this.api.commandesOuvertes().subscribe(d => this.openCommandes = d); }

  commandeForTable(t: any): any {
    return this.openCommandes.find(c => c.table && c.table.id === t.id);
  }

  selectCategorie(id: number | null): void { this.selectedCategorieId = id; }

  filteredProduits(): any[] {
    if (!this.selectedCategorieId) return this.produits;
    return this.produits.filter(p => p.categorie && p.categorie.id === this.selectedCategorieId);
  }

  selectTable(t: any): void {
    this.currentTable = t;
    this.panier = [];
    this.chambre = null;
    const cmd = this.commandeForTable(t);
    if (cmd) {
      this.commandeId = cmd.id;
      this.chambre = cmd.chambre;
      this.panier = cmd.lignes.map((l: any) => ({
        produit: l.produit, quantite: l.quantite, prixUnitaire: l.prixUnitaire, note: l.note
      }));
    } else {
      this.commandeId = null;
    }
  }

  addProduct(p: any): void {
    if (!this.currentTable) { Swal.fire('Info', 'Sélectionnez d\'abord une table.', 'info'); return; }
    const existing = this.panier.find(l => l.produit.id === p.id);
    if (existing) {
      existing.quantite++;
    } else {
      this.panier.push({ produit: p, quantite: 1, prixUnitaire: p.prix });
    }
  }

  inc(l: any): void { l.quantite++; }
  dec(l: any): void {
    l.quantite--;
    if (l.quantite <= 0) this.remove(l);
  }
  remove(l: any): void { this.panier = this.panier.filter(x => x !== l); }

  total(): number {
    return this.panier.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  }

  envoyer(): void {
    if (!this.panier.length) { Swal.fire('Info', 'Panier vide.', 'info'); return; }
    const body = {
      id: this.commandeId,
      tableId: this.currentTable.id,
      serveur: this.auth.getUser()?.username,
      chambre: this.chambre,
      lignes: this.panier.map(l => ({ produitId: l.produit.id, quantite: l.quantite, prixUnitaire: l.prixUnitaire, note: l.note }))
    };
    this.api.saveCommande(body).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Commande envoyée', timer: 1000, showConfirmButton: false });
        this.loadOpen(); this.loadTables();
        this.api.commandesOuvertes().subscribe(d => {
          this.openCommandes = d;
          const cmd = this.commandeForTable(this.currentTable);
          if (cmd) this.commandeId = cmd.id;
        });
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
    });
  }

  payer(): void {
    if (!this.commandeId) { Swal.fire('Info', 'Enregistrez d\'abord la commande.', 'info'); return; }
    const t = this.total();
    Swal.fire({
      title: 'Encaisser ' + t.toFixed(0) + ' DA',
      input: 'text', inputLabel: 'Mode de paiement (ESPECES, CARTE, MOBILE)',
      inputValue: this.paiementMode, showCancelButton: true, confirmButtonText: 'Encaisser', cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        const mode = (r.value || 'ESPECES').toUpperCase();
        this.api.payerCommande(this.commandeId!, { typeVente: 'RESTAURANT', paiements: [{ mode, montant: t }] }).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Commande payée', timer: 1200, showConfirmButton: false });
            this.reset(); this.loadTables(); this.loadOpen();
          },
          error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
        });
      }
    });
  }

  reset(): void { this.currentTable = null; this.commandeId = null; this.panier = []; this.chambre = null; }

  tableClass(t: any): string {
    if (this.currentTable && this.currentTable.id === t.id) return 'table-btn active';
    if (this.commandeForTable(t)) return 'table-btn occupee';
    return 'table-btn libre';
  }
}
