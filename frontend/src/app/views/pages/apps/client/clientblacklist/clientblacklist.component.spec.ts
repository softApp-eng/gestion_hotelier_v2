import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientblacklistComponent } from './clientblacklist.component';

describe('ClientblacklistComponent', () => {
  let component: ClientblacklistComponent;
  let fixture: ComponentFixture<ClientblacklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientblacklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientblacklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
