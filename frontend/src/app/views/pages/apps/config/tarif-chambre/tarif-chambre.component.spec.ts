import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifChambreComponent } from './tarif-chambre.component';

describe('TarifChambreComponent', () => {
  let component: TarifChambreComponent;
  let fixture: ComponentFixture<TarifChambreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TarifChambreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarifChambreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
