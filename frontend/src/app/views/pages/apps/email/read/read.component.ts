import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface Room {
  id: number;
  number: string;
  category: string;
  status: 'CLEAN' | 'DIRTY' | 'INSPECTED' | 'OUT_OF_SERVICE';
}

export interface ReservationSlot {
  id: number;
  guestName: string;
  roomId: number;
  startDate: string; // YYYY-MM-DD
  nights: number;
  status: 'CHECKED_IN' | 'CONFIRMED' | 'PENDING' | 'CHECKED_OUT';
}
@Component({
  selector: 'app-read',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.scss']
})
export class ReadComponent implements OnInit {

 selectedCategory: string = 'ALL';
  startDate: Date = new Date();
  daysHeader: Date[] = [];
  daysCount: number = 7; // Affichage sur 7 jours

  rooms: Room[] = [
    { id: 101, number: '101', category: 'Standard', status: 'CLEAN' },
    { id: 102, number: '102', category: 'Standard', status: 'DIRTY' },
    { id: 103, number: '103', category: 'Deluxe', status: 'INSPECTED' },
    { id: 201, number: '201', category: 'Suite', status: 'OUT_OF_SERVICE' },
    { id: 202, number: '202', category: 'Suite', status: 'CLEAN' }
  ];

  reservations: ReservationSlot[] = [];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.generateDaysHeader();
    this.loadMockReservations();
  }

  generateDaysHeader(): void {
    this.daysHeader = [];
    for (let i = 0; i < this.daysCount; i++) {
      const date = new Date(this.startDate);
      date.setDate(date.getDate() + i);
      this.daysHeader.push(date);
    }
  }

  loadMockReservations(): void {
    const todayStr = this.formatDate(new Date());
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const inTwoDays = new Date(); inTwoDays.setDate(inTwoDays.getDate() + 2);

    this.reservations = [
      { id: 1, guestName: 'Benali Karim', roomId: 101, startDate: todayStr, nights: 3, status: 'CHECKED_IN' },
      { id: 2, guestName: 'Dupont Jean', roomId: 103, startDate: this.formatDate(tomorrow), nights: 2, status: 'CONFIRMED' },
      { id: 3, guestName: 'Alami Fatima', roomId: 202, startDate: this.formatDate(inTwoDays), nights: 4, status: 'PENDING' }
    ];
  }

  get filteredRooms(): Room[] {
    if (this.selectedCategory === 'ALL') return this.rooms;
    return this.rooms.filter(r => r.category === this.selectedCategory);
  }

  getReservationForCell(roomId: number, date: Date): ReservationSlot | undefined {
    const dateStr = this.formatDate(date);
    return this.reservations.find(res => {
      if (res.roomId !== roomId) return false;
      const resStart = new Date(res.startDate);
      const cellDate = new Date(dateStr);
      const resEnd = new Date(resStart);
      resEnd.setDate(resEnd.getDate() + res.nights);

      return cellDate >= resStart && cellDate < resEnd;
    });
  }

  isReservationStart(res: ReservationSlot, date: Date): boolean {
    return res.startDate === this.formatDate(date);
  }

  navigateDays(offset: number): void {
    this.startDate.setDate(this.startDate.getDate() + offset);
    this.generateDaysHeader();
  }

  openReservationDetails(res: ReservationSlot): void {
    this.snackBar.open(`Réservation #${res.id} - ${res.guestName}`, 'Fermer', { duration: 3000 });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
