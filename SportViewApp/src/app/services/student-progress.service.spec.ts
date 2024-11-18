import { TestBed } from '@angular/core/testing';

import { StudentProgressService } from './student-progress.service';

describe('StudentProgressService', () => {
  let service: StudentProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
