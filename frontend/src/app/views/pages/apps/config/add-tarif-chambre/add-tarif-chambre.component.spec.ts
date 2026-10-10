import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTarifChambreComponent } from './add-tarif-chambre.component';

describe('AddTarifChambreComponent', () => {
  let component: AddTarifChambreComponent;
  let fixture: ComponentFixture<AddTarifChambreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTarifChambreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTarifChambreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
