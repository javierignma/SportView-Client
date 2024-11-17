import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentProfilePage } from './student-profile.page';

describe('StudentProfilePage', () => {
  let component: StudentProfilePage;
  let fixture: ComponentFixture<StudentProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
