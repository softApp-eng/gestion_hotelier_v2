import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import { NgbDropdownModule, NgbTooltipModule, NgbNavModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppsComponent } from './apps.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';
import { EmailComponent } from './email/email.component';
import { InboxComponent } from './email/inbox/inbox.component';
import { ReadComponent } from './email/read/read.component';
import { ComposeComponent } from './email/compose/compose.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu'; // <--- AJOUTÉ
import { MatSortModule } from '@angular/material/sort'; // <--- AJOUTÉ POUR matSort

// ngx-quill
import { QuillModule } from 'ngx-quill';
import { ClientDialogComponent } from './email/inbox/client-dialog/client-dialog.component';
import { CheckinComponent } from './email/checkin/checkin.component';
import { DelougerComponent } from './email/delouger/delouger.component';
import { CompteComponent } from './email/compte/compte.component';
import { PlaningComponent } from './planing/planing.component';
import { PlanchambreComponent } from './planing/planchambre/planchambre.component';
import { ListchambreComponent } from './planing/listchambre/listchambre.component';
import { EtatchambreComponent } from './planing/etatchambre/etatchambre.component';
import { ClientComponent } from './client/client.component';
import { ListclientComponent } from './client/listclient/listclient.component';
import { ClientblacklistComponent } from './client/clientblacklist/clientblacklist.component';
import { NightauditComponent } from './email/nightaudit/nightaudit.component';
import { ListRerservationComponent } from './email/inbox/list-rerservation/list-rerservation.component';
import { TypeClientConfigComponent } from './config/type-client-config/type-client-config.component';
import { ConfigComponent } from './config/config.component';
import { ReservationlistComponent } from './email/reservationlist/reservationlist.component';
import { MaterialModule } from 'src/app/shared/material.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin
]);

const routes: Routes = [
  {
    path: '',
    component: AppsComponent,
    children: [
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full',
      },
      {
        path: 'email',
        component: EmailComponent,
        children: [
          { path: '', redirectTo: 'inbox', pathMatch: 'full' },
          { path: 'inbox', component: InboxComponent },
          { path: 'read', component: ReadComponent },
          { path: 'compose', component: ComposeComponent },
          { path: 'checkin', component: CheckinComponent },
          { path: 'delouger', component: DelougerComponent },
          { path: 'compte', component: CompteComponent },
            { path: 'night', component: NightauditComponent }
        ]
      },
      { path: 'chat', component: ChatComponent },
      { path: 'calendar', component: CalendarComponent }
    ]
  }
];

@NgModule({
  declarations: [
    EmailComponent,
    ChatComponent,
    CalendarComponent,
    AppsComponent,
    InboxComponent,
    ComposeComponent,
    ClientDialogComponent,
    CheckinComponent,
    DelougerComponent,
    CompteComponent,
    PlaningComponent,
    PlanchambreComponent,
    ListchambreComponent,
    EtatchambreComponent,
    ClientComponent,
    ListclientComponent,
    ClientblacklistComponent,
    ListRerservationComponent,
    TypeClientConfigComponent,
    ConfigComponent,
    ReservationlistComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    
    // Angular Material Modules
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,         // <--- AJOUTÉ
    MatSlideToggleModule,
    MatTooltipModule,
    MatMenuModule,         // <--- AJOUTÉ (Résout l'erreur matMenuTriggerFor)
    MaterialModule,

    // Bootstrap & Plugins
    FullCalendarModule,
    PerfectScrollbarModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgbNavModule,
    NgbCollapseModule,
    NgSelectModule,
    QuillModule.forRoot()
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class AppsModule { }