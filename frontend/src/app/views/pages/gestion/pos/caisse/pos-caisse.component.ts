import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pos-caisse',
  templateUrl: './pos-caisse.component.html'
})
export class PosCaisseComponent implements OnInit {

  session: any = null;
  produits: any[] = [];
  categories: any[] = [];
  ventesJour: any[] = [];
  clients: any[] = [];

  selectedCategorieId: number | null = null;
  panier: any[] = [];
  remise = 0;
  clientId: number | null = null;
  montantRecu = 0;
  modePaiement = 'ESPECES';
  derniere: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.sessionCaisse().subscribe(s => this.session = s);
    this.api.produits().subscribe(d => this.produits = d.filter((p: any) => p.disponible));
    this.api.categories().subscribe(d => this.categories = d);
    this.api.clients().subscribe(d => this.clients = d);
    this.loadVentes();
  }

  loadVentes(): void { this.api.ventesDuJour().subscribe(d => this.ventesJour = d); }

  filteredProduits(): any[] {
    if (!this.selectedCategorieId) return this.produits;
    return this.produits.filter(p => p.categorie && p.categorie.id === this.selectedCategorieId);
  }

  addProduct(p: any): void {
    const e = this.panier.find(l => l.produit.id === p.id);
    if (e) e.quantite++; else this.panier.push({ produit: p, quantite: 1, prixUnitaire: p.prix });
  }
  inc(l: any): void { l.quantite++; }
  dec(l: any): void { l.quantite--; if (l.quantite <= 0) this.remove(l); }
  remove(l: any): void { this.panier = this.panier.filter(x => x !== l); }

  sousTotal(): number { return this.panier.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0); }
  total(): number { return Math.max(this.sousTotal() - (this.remise || 0), 0); }
  monnaie(): number { return Math.max((this.montantRecu || 0) - this.total(), 0); }

  openCaisse(): void {
    Swal.fire({ title: 'Ouverture de caisse', input: 'number', inputLabel: 'Fond de caisse (DA)',
      inputValue: '0', showCancelButton: true, confirmButtonText: 'Ouvrir', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) {
        this.api.openCaisse(parseFloat(r.value || '0')).subscribe({
          next: (s) => { this.session = s; Swal.fire({ icon: 'success', title: 'Caisse ouverte', timer: 1000, showConfirmButton: false }); },
          error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
        });
      }
    });
  }

  closeCaisse(): void {
    const att = this.session.montantOuverture + this.ventesJour
      .filter((v: any) => v.statut !== 'ANNULEE')
      .reduce((s: number, v: any) => s + (v.paiements || []).filter((p: any) => p.mode === 'ESPECES').reduce((a: number, p: any) => a + p.montant, 0), 0);
    Swal.fire({ title: 'Clôture de caisse', html: `Montant théorique (espèces) : <b>${att.toFixed(0)} DA</b><br>`,
      input: 'number', inputLabel: 'Montant compté (DA)', showCancelButton: true, confirmButtonText: 'Clôturer', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) {
        this.api.closeCaisse(this.session.id, parseFloat(r.value || '0')).subscribe({
          next: () => { this.session = null; Swal.fire({ icon: 'success', title: 'Caisse clôturée', timer: 1200, showConfirmButton: false }); this.loadVentes(); }
        });
      }
    });
  }

  encaisser(): void {
    if (!this.session) { Swal.fire('Info', 'Ouvrez la caisse d\'abord.', 'info'); return; }
    if (!this.panier.length) { Swal.fire('Info', 'Panier vide.', 'info'); return; }
    const body = {
      clientId: this.clientId,
      typeVente: 'POS',
      remise: this.remise || 0,
      lignes: this.panier.map(l => ({ produitId: l.produit.id, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
      paiements: [{ mode: this.modePaiement, montant: this.total() }]
    };
    this.api.createVente(body).subscribe({
      next: (v) => {
        this.derniere = v;
        this.panier = []; this.remise = 0; this.montantRecu = 0; this.clientId = null;
        this.loadVentes();
        Swal.fire({ icon: 'success', title: 'Vente ' + v.numero, timer: 1200, showConfirmButton: false });
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
    });
  }

  annuler(v: any): void {
    Swal.fire({ title: 'Annuler la vente ?', text: v.numero, icon: 'warning', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
      .then(r => { if (r.isConfirmed) this.api.annulerVente(v.id).subscribe(() => this.loadVentes()); });
  }

  print(v: any): void {
    const w = window.open('', '_blank', 'width=320,height=600');
    if (!w) return;
    w.document.write('<pre style="font-family:monospace;font-size:12px;">');
    w.document.write('        HOTEL V2\n');
    w.document.write('     Ticket ' + v.numero + '\n');
    w.document.write('------------------------------\n');
    (v.lignes || []).forEach((l: any) => {
      w.document.write(l.quantite + ' x ' + (l.produit?.nom || l.libelle) + '  ' + (l.quantite * l.prixUnitaire).toFixed(0) + '\n');
    });
    w.document.write('------------------------------\n');
    w.document.write('TOTAL : ' + (v.total || 0).toFixed(0) + ' DA\n');
    w.document.write('Paye  : ' + (v.montantPaye || 0).toFixed(0) + ' DA\n');
    if (v.monnaie) w.document.write('Rendu : ' + v.monnaie.toFixed(0) + ' DA\n');
    w.document.write('\n   Merci de votre visite !\n');
    w.document.write('</pre>');
    w.document.close();
    w.print();
  }
}
