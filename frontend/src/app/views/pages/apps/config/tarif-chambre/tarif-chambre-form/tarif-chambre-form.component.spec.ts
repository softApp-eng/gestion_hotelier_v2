import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifChambreFormComponent } from './tarif-chambre-form.component';

describe('TarifChambreFormComponent', () => {
  let component: TarifChambreFormComponent;
  let fixture: ComponentFixture<TarifChambreFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TarifChambreFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarifChambreFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
