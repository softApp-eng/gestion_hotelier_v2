import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
export interface CheckinArrival {
  id: number;
  guestName: string;
  isVip: boolean;
  vipLevel?: string;
  resaNumber: string;
  nights: number;
  pax: number;
  bookedCategory: string;
  ratePlan: string;
  assignedRoom?: string;
  roomStatus: 'CLEAN_INSPECTED' | 'CLEAN' | 'DIRTY' | 'UNASSIGNED';
  balance: number;
  paymentMethod: string;
  recommendation: {
    type: 'UPSELL' | 'PRIORITY_CLEAN' | 'PAYMENT_REQ' | 'READY';
    text: string;
  };
}
@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss']
})
export class CheckinComponent implements OnInit, AfterViewInit {

 displayedColumns: string[] = ['guest', 'bookedCategory', 'assignedRoom', 'recommendation', 'payment', 'actions'];
  dataSource = new MatTableDataSource<CheckinArrival>([]);
  searchQuery: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadArrivals();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadArrivals(): void {
    const mockData: CheckinArrival[] = [
      {
        id: 101,
        guestName: 'SOPHIE MARTIN',
        isVip: true,
        vipLevel: 'GOLD',
        resaNumber: 'RES-8829',
        nights: 4,
        pax: 2,
        bookedCategory: 'Standard Room',
        ratePlan: 'Bed & Breakfast',
        assignedRoom: '302',
        roomStatus: 'CLEAN_INSPECTED',
        balance: 0,
        paymentMethod: 'Credit Card (Pre-paid)',
        recommendation: {
          type: 'UPSELL',
          text: 'Propose Ocean Suite upgrade for +€45/night (High probability).'
        }
      },
      {
        id: 102,
        guestName: 'MARC DUBOIS',
        isVip: false,
        resaNumber: 'RES-8834',
        nights: 2,
        pax: 1,
        bookedCategory: 'Superior King',
        ratePlan: 'Flexible Rate',
        assignedRoom: '108',
        roomStatus: 'DIRTY',
        balance: 280.00,
        paymentMethod: 'Pay at Desk',
        recommendation: {
          type: 'PRIORITY_CLEAN',
          text: 'Guest requested early arrival (12:00). Flag HK to rush Room 108.'
        }
      },
      {
        id: 103,
        guestName: 'CORPORATE TECH SAS',
        isVip: false,
        resaNumber: 'RES-8840',
        nights: 1,
        pax: 1,
        bookedCategory: 'Standard Single',
        ratePlan: 'Corporate Direct',
        assignedRoom: '215',
        roomStatus: 'CLEAN',
        balance: 150.00,
        paymentMethod: 'Direct Billing (PEC)',
        recommendation: {
          type: 'PAYMENT_REQ',
          text: 'PEC Voucher missing in system. Collect guarantee deposit.'
        }
      },
      {
        id: 104,
        guestName: 'AMINE EL IDRISSI',
        isVip: false,
        resaNumber: 'RES-8845',
        nights: 3,
        pax: 2,
        bookedCategory: 'Deluxe Suite',
        ratePlan: 'Package All-Inclusive',
        assignedRoom: '501',
        roomStatus: 'CLEAN_INSPECTED',
        balance: 0,
        paymentMethod: 'Fully Paid',
        recommendation: {
          type: 'READY',
          text: 'Room ready & Key cards pre-encoded. Proceed with fast Check-in.'
        }
      }
    ];

    this.dataSource.data = mockData;
  }

  applySearch(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
  }

  getHousekeepingLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'CLEAN_INSPECTED': 'Clean & Inspected',
      'CLEAN': 'Clean',
      'DIRTY': 'Dirty / In Progress',
      'UNASSIGNED': 'No Room'
    };
    return labels[status] || status;
  }

  toggleAutoAssign(): void {
    // Logic for automated room assignment engine
  }

  processCheckin(row: CheckinArrival): void {
    // Logic to issue key card and mark reservation as IN_HOUSE
  }

  assignRoom(row: CheckinArrival): void { /* Open Room Selection Dialog */ }
  offerUpsell(row: CheckinArrival): void { /* Open Upsell Modal */ }
  printRegistrationCard(row: CheckinArrival): void { /* Trigger PDF print */ }

}
