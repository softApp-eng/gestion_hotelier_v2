import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanchambreComponent } from './planchambre.component';

describe('PlanchambreComponent', () => {
  let component: PlanchambreComponent;
  let fixture: ComponentFixture<PlanchambreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanchambreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanchambreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
