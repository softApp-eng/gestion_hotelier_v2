import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelougerComponent } from './delouger.component';

describe('DelougerComponent', () => {
  let component: DelougerComponent;
  let fixture: ComponentFixture<DelougerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelougerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelougerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
