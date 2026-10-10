import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatchambreComponent } from './etatchambre.component';

describe('EtatchambreComponent', () => {
  let component: EtatchambreComponent;
  let fixture: ComponentFixture<EtatchambreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EtatchambreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtatchambreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
