import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRerservationComponent } from './list-rerservation.component';

describe('ListRerservationComponent', () => {
  let component: ListRerservationComponent;
  let fixture: ComponentFixture<ListRerservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListRerservationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListRerservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
