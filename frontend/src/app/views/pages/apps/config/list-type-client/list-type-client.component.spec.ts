import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTypeClientComponent } from './list-type-client.component';

describe('ListTypeClientComponent', () => {
  let component: ListTypeClientComponent;
  let fixture: ComponentFixture<ListTypeClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListTypeClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTypeClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
