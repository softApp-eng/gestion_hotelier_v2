import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  Subject,
  merge
} from 'rxjs';

import {
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import { ClientDialogComponent } from './client-dialog/client-dialog.component';

import { ReservationService } from 'src/app/core/services/reservation.service';
import { StructureService } from 'src/app/core/services/structure.service';
import { TypeClientService } from 'src/app/core/services/type-client.service';
import { ChambreService } from 'src/app/core/services/chambre.service';
import { TarifService } from 'src/app/core/services/tarif.service';


@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent
  implements OnInit, OnDestroy {


  // ============================================================
  // FORMULAIRE
  // ============================================================

  reservationForm!: FormGroup;


  // ============================================================
  // CLIENTS
  // ============================================================

  selectedClientsData: {
    [key: number]: any
  } = {};


  // ============================================================
  // DONNEES
  // ============================================================

  pavillonsList: any[] = [];

  typesChambreDisponibles: any[] = [];

  chambresDisponibles: any[] = [];

  typeClient: any[] = [];


  // ============================================================
  // TARIFS
  // ============================================================

  tarifsList = [
    {
      id: 'standard',
      libelle: 'Tarif Standard',
      prix: 800
    },
    {
      id: 'entreprise',
      libelle: 'Tarif Conventionné',
      prix: 600
    }
  ];
//   tarifsParChambre: {
//   [key: number]: any[]
// } = {};
tarifsDisponibles: any[] = [];
  // ============================================================
  // DESTROY
  // ============================================================

  private destroy$ =
    new Subject<void>();
  tarifsParChambre: any;


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private reservationService: ReservationService,
    private structureService: StructureService,
    private chambreservice: ChambreService,
    private snackBar: MatSnackBar,
    private typeClientService: TypeClientService,
    private tarifChambreService: TarifService
  ) {}


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.initForm();

    this.loadPavillons();

    this.getAllTypeClient();

    this.listenFormChanges();
  this.tarifsParChambre = {};

  }


  // ============================================================
  // DESTROY
  // ============================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }


  // ============================================================
  // GETTERS
  // ============================================================

  get clientsArray(): FormArray {

    return this.reservationForm
      .get('clients') as FormArray;

  }


  get chambresArray(): FormArray {

    return this.reservationForm
      .get('chambres') as FormArray;

  }


  get nbAdultes(): number {

    return Number(
      this.reservationForm
        .get('nbAdultes')
        ?.value || 0
    );

  }


  get selectedClientsList(): any[] {

    return Object.values(
      this.selectedClientsData
    );

  }


  get isEtranger(): boolean {

    const typeId =
      this.reservationForm
        .get('typeClient')
        ?.value;

    const type =
      this.typeClient.find(
        t =>
          Number(t.id) ===
          Number(typeId)
      );

    return type?.code === 'ETRANGER';

  }


 // ============================================================
  // TOTAL HEBERGEMENT & CALCULATIONS
  // ============================================================

  /**
   * Calculates the number of nights between check-in and check-out dates
   */
  get dureeSejour(): number {
    const checkIn = this.reservationForm.get('dateCheckIn')?.value;
    const checkOut = this.reservationForm.get('dateCheckOut')?.value;

    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Combined nightly price of all added rooms
   */
  get totalNuiteeChambres(): number {
    return this.chambresArray.controls.reduce((total, group) => {
      return total + this.getRoomPrice(group as FormGroup);
    }, 0);
  }

  /**
   * Total accommodation cost for the entire stay duration
   */
  get totalHebergement(): number {
    return this.totalNuiteeChambres * this.dureeSejour;
  }

  /**
   * Optional: Tax calculation breakdown (e.g., 10% VAT / TVA)
   */
  get totalHebergementHT(): number {
    return this.totalHebergement / 1.1; // Assumes 10% tax rate
  }

  get totalHebergementTVA(): number {
    return this.totalHebergement - this.totalHebergementHT;
  }


  // ============================================================
  // AJOUT CHAMBRE AUTORISE
  // ============================================================

  get canAddChambre(): boolean {

    return !!(
      this.reservationForm
        .get('pavillon')
        ?.value
      &&
      this.reservationForm
        .get('dateCheckIn')
        ?.value
      &&
      this.reservationForm
        .get('dateCheckOut')
        ?.value
    );

  }


  // ============================================================
  // VALIDATION SUBMIT
  // ============================================================

  get canSubmit(): boolean {

    if (
      this.clientsArray.length !==
      this.nbAdultes
    ) {

      return false;

    }


    if (
      this.selectedClientsList.length !==
      this.nbAdultes
    ) {

      return false;

    }


    if (
      this.chambresArray.length === 0
    ) {

      return false;

    }


    for (
      let i = 0;
      i < this.chambresArray.length;
      i++
    ) {

      const group =
        this.chambresArray.at(i);


      if (
        !group.get('typeChambreId')?.value
      ) {

        return false;

      }


      if (
        !group.get('chambreId')?.value
      ) {

        return false;

      }


      const occupants =
        group.get('occupantIds')?.value || [];


      if (
        occupants.length === 0
      ) {

        return false;

      }


      if (
        this.roomCapacityExceeded(i)
      ) {

        return false;

      }


      if (
        !group.get('tarif')?.value
      ) {

        return false;

      }


      if (
        group.get('tarif')?.value ===
        'custom'
        &&
        (
          group.get('tarifPersonnalise')
            ?.value === null
          ||
          group.get('tarifPersonnalise')
            ?.value === ''
        )
      ) {

        return false;

      }

    }


    // Tous les clients doivent être affectés
    const assigned =
      this.getAllAssignedClientIds();


    return (
      assigned.length ===
      this.nbAdultes
    );

  }


  // ============================================================
  // INITIALISATION FORM
  // ============================================================

  private initForm(): void {

    this.reservationForm =
      this.fb.group({

        // --------------------------------------------------------
        // CLIENT / SEJOUR
        // --------------------------------------------------------

        typeClient: [
          null,
          Validators.required
        ],

        modeReglement: [
          'espece',
          Validators.required
        ],

        referencePec: [
          ''
        ],

        objectDelg: [
          ''
        ],

        nbAdultes: [
          1,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(50)
          ]
        ],

        nbEnfants: [
          0,
          [
            Validators.min(0)
          ]
        ],

        dateCheckIn: [
          null,
          Validators.required
        ],

        dateCheckOut: [
          null,
          Validators.required
        ],


        // --------------------------------------------------------
        // OCCUPANTS
        // --------------------------------------------------------

        clients:
          this.fb.array([
            this.createClientFormControl()
          ]),


        // --------------------------------------------------------
        // HEBERGEMENT
        // --------------------------------------------------------

        pavillon: [
          null,
          Validators.required
        ],

        chambres:
          this.fb.array([])

      });

  }


  // ============================================================
  // CLIENT FORM
  // ============================================================

  private createClientFormControl(): FormGroup {

    return this.fb.group({

      clientId: [
        null,
        Validators.required
      ]

    });

  }
   // get tarif chambre 
 
getTarifsForRoom(index: number): any[] {
  const group = this.chambresArray.at(index);
  const typeChambreId = group.get('typeChambreId')?.value;
  
  if (!typeChambreId) {
    return [];
  }
  
  return this.tarifsParChambre[typeChambreId] || [];
}

loadTarifsPourChambre(chambre: any): void {

  const typeClientId =
    this.reservationForm.get('typeClient')?.value;

  if (!typeClientId || !chambre.typeChambreId) {
    return;
  }

  this.tarifChambreService
    .getTarifs(
      Number(typeClientId),
      Number(chambre.typeChambreId)
    )
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (tarifs) => {

        this.tarifsParChambre[chambre.chambreId] =
          tarifs || [];

        console.log(
          'Tarifs chargés :',
          tarifs
        );

      },

      error: (err) => {

        console.error(
          'Erreur chargement tarifs :',
          err
        );

        this.tarifsParChambre[chambre.chambreId] = [];
      }
    });
}

  // ============================================================
  // CHAMBRE FORM
  // ============================================================

 private createChambreFormControl(): FormGroup {

  return this.fb.group({

    typeChambreId: [
      null,
      Validators.required
    ],

    chambreId: [
      null,
      Validators.required
    ],

    occupantIds: [
      [],
      Validators.required
    ],

    tarif: [
      null,
      Validators.required
    ],

    tarifPersonnalise: [
      null
    ]

  });
}


  // ============================================================
  // LISTEN FORM
  // ============================================================

  private listenFormChanges(): void {


    // ==========================================================
    // NOMBRE ADULTES
    // ==========================================================

    this.reservationForm
      .get('nbAdultes')
      ?.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {

        this.updateClientsArray();

      });


    // ==========================================================
    // DATES
    // ==========================================================

    merge(

      this.reservationForm
        .get('dateCheckIn')!
        .valueChanges,

      this.reservationForm
        .get('dateCheckOut')!
        .valueChanges

    )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {

        this.refreshAvailability();

      });


    // ==========================================================
    // TYPE CLIENT
    // ==========================================================

    this.reservationForm
      .get('typeClient')
      ?.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {

        const ctrl =
          this.reservationForm
            .get('objectDelg');


        if (this.isEtranger) {

          ctrl?.setValidators([
            Validators.required
          ]);

        } else {

          ctrl?.clearValidators();

          ctrl?.setValue(
            '',
            {
              emitEvent: false
            }
          );

        }

        ctrl?.updateValueAndValidity();

      });


    // ==========================================================
    // MODE REGLEMENT
    // ==========================================================

    this.reservationForm
      .get('modeReglement')
      ?.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(mode => {

        const ctrl =
          this.reservationForm
            .get('referencePec');


        if (
          mode ===
          'prise_en_charge'
        ) {

          ctrl?.setValidators([
            Validators.required
          ]);

        } else {

          ctrl?.clearValidators();

          ctrl?.setValue(
            '',
            {
              emitEvent: false
            }
          );

        }

        ctrl?.updateValueAndValidity();

      });

  }


  // ============================================================
  // UPDATE CLIENTS
  // ============================================================

  private updateClientsArray(): void {

    const count =
      Math.max(
        Number(
          this.reservationForm
            .get('nbAdultes')
            ?.value || 1
        ),
        1
      );


    const clients =
      this.clientsArray;


    while (
      clients.length <
      count
    ) {

      clients.push(
        this.createClientFormControl()
      );

    }


    while (
      clients.length >
      count
    ) {

      const index =
        clients.length - 1;

      clients.removeAt(index);

      delete this.selectedClientsData[index];

    }

  }


  // ============================================================
  // PAVILLON
  // ============================================================

  onPavillonChange(
    pavillonId: number
  ): void {

    this.typesChambreDisponibles = [];

    this.chambresDisponibles = [];


    if (!pavillonId) {

      return;

    }


    this.structureService
      .getTypesChambreParPavillon(
        Number(pavillonId)
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: types => {

          this.typesChambreDisponibles =
            types || [];

          this.refreshAvailability();

        },

        error: err => {

          console.error(
            'Erreur types chambres :',
            err
          );

        }

      });

  }


  // ============================================================
  // DISPONIBILITE
  // ============================================================

  private refreshAvailability(): void {

    const values =
      this.reservationForm
        .getRawValue();


    const pavillon =
      values.pavillon;

    const dateIn =
      this.formatDate(
        values.dateCheckIn
      );

    const dateOut =
      this.formatDate(
        values.dateCheckOut
      );


    if (
      !pavillon ||
      !dateIn ||
      !dateOut
    ) {

      this.chambresDisponibles = [];

      return;

    }


    /*
     * IMPORTANT :
     *
     * Ton ancien service demandait :
     *
     * getChambresDisponibles(
     *   pavillon,
     *   typeChambre,
     *   dateIn,
     *   dateOut
     * )
     *
     * Maintenant on veut pouvoir mélanger
     * Simple + Double + Triple.
     *
     * Il faut donc idéalement avoir une API :
     *
     * getToutesChambresDisponibles(
     *   pavillon,
     *   dateIn,
     *   dateOut
     * )
     */


    if (
      typeof (
        this.structureService as any
      ).getToutesChambresDisponibles ===
      'function'
    ) {

      (
        this.structureService as any
      )
        .getToutesChambresDisponibles(
          Number(pavillon),
          dateIn,
          dateOut
        )
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe({

          next: (rooms: any[]) => {

            this.chambresDisponibles =
              rooms || [];

          },

          error: (err: any) => {

            console.error(
              'Erreur disponibilité chambres :',
              err
            );

            this.chambresDisponibles = [];

          }

        });

    }

  }


  // ============================================================
  // AJOUTER CHAMBRE
  // ============================================================

  addChambre(): void {

    if (!this.canAddChambre) {

      this.snackBar.open(
        'Sélectionnez d’abord le pavillon et les dates.',
        'Fermer',
        {
          duration: 3000
        }
      );

      return;

    }


    this.chambresArray.push(
      this.createChambreFormControl()
    );

  }


  // ============================================================
  // SUPPRIMER CHAMBRE
  // ============================================================

  removeChambre(
    index: number
  ): void {

    this.chambresArray.removeAt(index);

  }

// cache pour 
// Ajoutez cette propriété dans le composant
private tarifsCache: { [key: string]: any[] } = {};

// Modifiez la méthode loadTarifsForRoom
loadTarifsForRoom(index: number): void {
  const group = this.chambresArray.at(index);
  const typeChambreId = group.get('typeChambreId')?.value;
  const typeClientId = this.reservationForm.get('typeClient')?.value;

  if (!typeChambreId || !typeClientId) return;

  const cacheKey = `${typeClientId}_${typeChambreId}`;

  if (this.tarifsCache[cacheKey]) {
    this.tarifsParChambre[typeChambreId] = this.tarifsCache[cacheKey];
    return;
  }

  this.tarifChambreService
    .getTarifs(Number(typeClientId), Number(typeChambreId))
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (tarifs) => {
        this.tarifsCache[cacheKey] = tarifs || [];
        // Clé harmonisée sur typeChambreId
        this.tarifsParChambre[typeChambreId] = this.tarifsCache[cacheKey];
      },
      error: (err) => {
        console.error('Erreur chargement tarifs :', err);
        this.tarifsParChambre[typeChambreId] = [];
      }
    });
}
  // ============================================================
  // TYPE CHAMBRE D'UNE LIGNE
  // ============================================================

onTypeChambreRowChange(index: number, typeId: number): void {
  const group = this.chambresArray.at(index);

  // Réinitialiser la chambre sélectionnée
  group.get('chambreId')?.reset();
  
  // Réinitialiser les occupants
  group.get('occupantIds')?.setValue([]);
  
  // Réinitialiser le tarif
  group.get('tarif')?.reset();
  group.get('tarifPersonnalise')?.reset();

  const dateArrivee = this.formatDate(
    this.reservationForm.get('dateCheckIn')?.value
  );
  const dateDepart = this.formatDate(
    this.reservationForm.get('dateCheckOut')?.value
  );

  // Pas de type ou pas de dates
  if (!typeId || !dateArrivee || !dateDepart) {
    this.chambresDisponibles = [];
    return;
  }

  console.log('Recherche chambres disponibles :', {
    typeId,
    dateArrivee,
    dateDepart
  });

  this.chambreservice
    .getChambresDisponibles(Number(typeId), dateArrivee, dateDepart)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: rooms => {
        console.log('✅ Chambres disponibles :', rooms);
        this.chambresDisponibles = rooms || [];

        // Charger les tarifs pour ce type de chambre
        this.loadTarifsForRoom(index);
      },
      error: err => {
        console.error('❌ Erreur chambres disponibles :', err);
        this.chambresDisponibles = [];
      }
    });
}



  // ============================================================
  // CHAMBRES DISPONIBLES POUR UNE LIGNE
  // ============================================================

 getRoomsForRow(
  index: number
): any[] {

  return this.chambresDisponibles
    .filter(
      room =>
        !this.isRoomAssignedToAnotherRow(
          room.id,
          index
        )
    );

}



  // ============================================================
  // CHAMBRE DEJA UTILISEE
  // ============================================================

  isRoomAssignedToAnotherRow(
    roomId: number,
    currentIndex: number
  ): boolean {

    return this.chambresArray.controls
      .some(
        (group, index) => {

          if (
            index === currentIndex
          ) {

            return false;

          }

          return Number(
            group.get('chambreId')
              ?.value
          ) === Number(roomId);

        }
      );

  }


  // ============================================================
  // CAPACITE CHAMBRE
  // ============================================================

  getRoomCapacity(
    index: number
  ): number {

    const group =
      this.chambresArray.at(index);


    const typeId =
      group
        .get('typeChambreId')
        ?.value;


    const type =
      this.typesChambreDisponibles
        .find(
          t =>
            Number(t.id) ===
            Number(typeId)
        );


    return Number(
      type?.capacite || 0
    );

  }


  // ============================================================
  // NOMBRE OCCUPANTS
  // ============================================================

  getRoomOccupantCount(
    index: number
  ): number {

    const group =
      this.chambresArray.at(index);


    return (
      group
        .get('occupantIds')
        ?.value
        ?.length || 0
    );

  }


  // ============================================================
  // CAPACITE DEPASSEE
  // ============================================================

  roomCapacityExceeded(
    index: number
  ): boolean {

    const capacity =
      this.getRoomCapacity(index);


    const occupants =
      this.getRoomOccupantCount(index);


    return (
      capacity > 0 &&
      occupants > capacity
    );

  }


  // ============================================================
  // CLIENT DEJA AFFECTE
  // ============================================================

  isClientAssignedToAnotherRoom(
    clientId: number,
    currentRoomIndex: number
  ): boolean {

    return this.chambresArray.controls
      .some(
        (group, index) => {

          if (
            index ===
            currentRoomIndex
          ) {

            return false;

          }


          const ids =
            group
              .get('occupantIds')
              ?.value || [];


          return ids.some(
            (id: number) =>
              Number(id) ===
              Number(clientId)
          );

        }
      );

  }


  // ============================================================
  // OCCUPANTS CHANGE
  // ============================================================

  onOccupantsChange(
    index: number
  ): void {

    const group =
      this.chambresArray.at(index);


    const ids =
      group
        .get('occupantIds')
        ?.value || [];


    const capacity =
      this.getRoomCapacity(index);


    if (
      capacity > 0 &&
      ids.length > capacity
    ) {

      this.snackBar.open(
        `Cette chambre a une capacité de ${capacity} occupant(s).`,
        'Fermer',
        {
          duration: 3000,
          panelClass: [
            'bg-warning',
            'text-dark'
          ]
        }
      );

    }

  }


  // ============================================================
  // CLIENTS AFFECTES
  // ============================================================

  getAllAssignedClientIds(): number[] {

    const ids: number[] = [];


    this.chambresArray.controls
      .forEach(group => {

        const occupants =
          group
            .get('occupantIds')
            ?.value || [];


        ids.push(
          ...occupants.map(
            (id: any) => Number(id)
          )
        );

      });


    return [
      ...new Set(ids)
    ];

  }


  // ============================================================
  // TARIF CHAMBRE
  // ============================================================
// ============================================================
// TARIF CHAMBRE
// ============================================================

getRoomPrice(group: FormGroup): number {
  const tarif = group.get('tarif')?.value;

  // Si c'est un tarif personnalisé
  if (tarif === 'custom') {
    return Number(group.get('tarifPersonnalise')?.value || 0);
  }

  // Si aucun tarif n'est sélectionné
  if (!tarif) {
    return 0;
  }

  // Récupérer le type de chambre pour trouver les tarifs associés
  const typeChambreId = group.get('typeChambreId')?.value;
  
  // Si pas de type de chambre, retourner 0
  if (!typeChambreId) {
    return 0;
  }

  // Récupérer les tarifs pour ce type de chambre
  const tarifs = this.tarifsParChambre[typeChambreId] || [];
  
  // Chercher le tarif sélectionné
  const tarifObj = tarifs.find((t: { id: any; tarifId: any; }) => 
    t.id === tarif || 
    t.tarifId === tarif ||
    String(t.id) === String(tarif) ||
    String(t.tarifId) === String(tarif)
  );

  // Retourner le prix ou 0
  return Number(tarifObj?.prix || tarifObj?.montant || 0);
}


  // ============================================================
  // DIALOG CLIENT
  // ============================================================

  openClientDialog(
    index: number
  ): void {

    const typeClientId =
      this.reservationForm
        .get('typeClient')
        ?.value;


    const typeClient =
      this.typeClient.find(
        t =>
          Number(t.id) ===
          Number(typeClientId)
      );


    const dialogRef =
      this.dialog.open(
        ClientDialogComponent,
        {
          width: '900px',
          maxWidth: '95vw',

          data: {
            typeClient,
            index
          }
        }
      );


    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(result => {

        if (!result) {

          return;

        }


        const client =
          result.client ||
          result;


        const clientId =
          client.clientId ??
          client.id;


        if (!clientId) {

          return;

        }


        this.selectedClientsData[index] =
          {
            ...client,
            clientId
          };


        this.clientsArray
          .at(index)
          .get('clientId')
          ?.setValue(
            clientId
          );

      });

  }


  // ============================================================
  // CLIENT SELECTIONNE
  // ============================================================

  getSelectedClient(
    index: number
  ): any {

    return (
      this.selectedClientsData[index]
      || null
    );

  }


  // ============================================================
  // SUPPRIMER CLIENT
  // ============================================================

  removeClientAt(
    index: number
  ): void {

    delete this.selectedClientsData[index];


    this.clientsArray
      .at(index)
      .get('clientId')
      ?.reset();

  }


  // ============================================================
  // SUBMIT
  // ============================================================

 // inbox.component.ts
// inbox.component.ts - onSubmit()

onSubmit(): void {
  // ... validation ...

  const values = this.reservationForm.getRawValue();

  // ==========================================================
  // CLIENTS
  // ==========================================================
  const clientsPayload = (values.clients || []).map((client: any, index: number) => ({
    clientId: Number(client.clientId) || null,
    principal: index === 0
  }));

  // ==========================================================
  // CHAMBRES
  // ==========================================================
 // ==========================================================
// CHAMBRES - Alignement avec ChambreReservationRequest Java
// ==========================================================
const chambresPayload = values.chambres.map((chambre: any) => {
  const isCustom = chambre.tarif === 'custom';

  return {
    chambreId: Number(chambre.chambreId),
    typeChambreId: Number(chambre.typeChambreId),
    occupantIds: (chambre.occupantIds || []).map((id: any) => Number(id)),

    // Transmettre la valeur du tarif dans "tarif" (pas "tarifId")
    // Jackson désérialisera automatiquement un number JS en BigDecimal
    tarif: !isCustom && chambre.tarif != null ? Number(chambre.tarif) : null,

    tarifPersonnalise: isCustom && chambre.tarifPersonnalise != null 
      ? Number(chambre.tarifPersonnalise) 
      : null
  };
});

  // ==========================================================
  // PAYLOAD SÉCURISÉ
  // ==========================================================
  const payload = {
    typeClient: Number(values.typeClient) || null,
    objectDelg: values.objectDelg || null,
    
    // Convertir en majuscules pour correspondre aux Enums Spring Boot
    modeReglement: values.modeReglement ? String(values.modeReglement).toUpperCase() : 'ESPECE',
    
    referencePec: values.referencePec || null,
    nbAdultes: Number(values.nbAdultes) || 0,
    nbEnfants: Number(values.nbEnfants) || 0,
    dateCheckIn: this.formatDate(values.dateCheckIn),
    dateCheckOut: this.formatDate(values.dateCheckOut),
    pavillonId: Number(values.pavillon || values.pavillonId) || null,
    clients: clientsPayload,
    chambres: chambresPayload
  };

  console.log('📦 PAYLOAD ENVOYÉ:', JSON.stringify(payload, null, 2));

  this.reservationService.createReservation2(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => { /* ... success ... */ },
      error: (err) => {
        // Affiche la raison exacte envoyée par Spring Boot dans la console
        console.error('❌ Erreur 400 Backend:', err.error);
        this.snackBar.open(
          err.error?.message || err.error?.errors?.[0]?.defaultMessage || 'Erreur de validation (400)',
          'Fermer',
          { duration: 5000, panelClass: ['bg-danger', 'text-white'] }
        );
      }
    });
}
// ============================================================
// MÉTHODE POUR RÉCUPÉRER LE PRIX DU TARIF
// ============================================================

private getTarifPrice(chambre: any): number {
  if (chambre.tarif === 'custom') {
    return Number(chambre.tarifPersonnalise || 0);
  }

  const typeChambreId = chambre.typeChambreId;
  const tarifs = this.tarifsParChambre[typeChambreId] || [];
  
  const tarifObj = tarifs.find((t: any) => 
    String(t.id) === String(chambre.tarif) || 
    String(t.tarifId) === String(chambre.tarif)
  );

  return Number(tarifObj?.prix || tarifObj?.montant || 0);
}


  // ============================================================
  // RESET
  // ============================================================

resetForm(): void {
  this.reservationForm.reset(
    {
      typeClient: null,
      modeReglement: 'espece',
      referencePec: '',
      objectDelg: '',
      nbAdultes: 1,
      nbEnfants: 0,
      dateCheckIn: null,
      dateCheckOut: null,
      pavillon: null
    },
    { emitEvent: false }
  );

  this.selectedClientsData = {};
  this.tarifsCache = {};
  this.tarifsParChambre = {};

  while (this.clientsArray.length) {
    this.clientsArray.removeAt(0);
  }
  while (this.chambresArray.length) {
    this.chambresArray.removeAt(0);
  }

  this.updateClientsArray();
}


  // ============================================================
  // PAVILLONS
  // ============================================================

  private loadPavillons(): void {

    this.structureService
      .getPavillons()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: data => {

          this.pavillonsList =
            data || [];

        },

        error: err => {

          console.error(
            'Erreur pavillons :',
            err
          );

        }

      });

  }


  // ============================================================
  // TYPE CLIENT
  // ============================================================

  getAllTypeClient(): void {

    this.typeClientService
      .getAll()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: data => {

          this.typeClient =
            data || [];

        },

        error: err => {

          console.error(
            'Erreur type client :',
            err
          );

        }

      });

  }


  // ============================================================
  // FORMAT DATE
  // ============================================================

  private formatDate(
    dateVal: any
  ): string {

    if (!dateVal) {

      return '';

    }


    const d =
      new Date(dateVal);


    const year =
      d.getFullYear();


    const month =
      String(
        d.getMonth() + 1
      ).padStart(2, '0');


    const day =
      String(
        d.getDate()
      ).padStart(2, '0');


    return `${year}-${month}-${day}`;

  }

}
