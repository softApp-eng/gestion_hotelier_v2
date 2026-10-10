import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChambreDialogComponent } from './add-chambre-dialog.component';

describe('AddChambreDialogComponent', () => {
  let component: AddChambreDialogComponent;
  let fixture: ComponentFixture<AddChambreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddChambreDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddChambreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
