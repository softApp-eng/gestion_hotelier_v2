import { TestBed } from '@angular/core/testing';

import { TypeClientService } from './type-client.service';

describe('TypeClientService', () => {
  let service: TypeClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
