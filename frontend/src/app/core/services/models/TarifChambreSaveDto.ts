export interface TarifChambreSaveDto {
  id?: number | null;
  prix: number;
  dateDebut?: string;
  dateFin?: string;
  active: boolean;
  typeClientId: number;
  typeChambreId: number;
}