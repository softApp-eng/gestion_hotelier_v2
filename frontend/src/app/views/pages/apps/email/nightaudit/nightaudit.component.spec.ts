import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NightauditComponent } from './nightaudit.component';

describe('NightauditComponent', () => {
  let component: NightauditComponent;
  let fixture: ComponentFixture<NightauditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NightauditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NightauditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
