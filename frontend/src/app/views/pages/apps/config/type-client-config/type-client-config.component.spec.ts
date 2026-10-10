import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeClientConfigComponent } from './type-client-config.component';

describe('TypeClientConfigComponent', () => {
  let component: TypeClientConfigComponent;
  let fixture: ComponentFixture<TypeClientConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeClientConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeClientConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
