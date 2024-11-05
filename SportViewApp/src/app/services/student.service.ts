import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api, routes } from 'src/environments/environment';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { NewStudent, Student } from '../models/students.models';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  apiStudentsRoute: string = api.backend+routes.students;

  headers: HttpHeaders;

  constructor(private http: HttpClient, private userService: UserService) { 
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });
  }

  createStudent(newStudent: NewStudent): Observable<Student> {
    const headers = this.headers;
    return this.http.post<Student>(this.apiStudentsRoute, newStudent, { headers });
  }

  getStudents(): Observable<Student[]> {
    const headers = this.headers;
    const userId = this.userService.getCurrentUser('id');
    return this.http.get<Student[]>(this.apiStudentsRoute+userId, { headers });
  }

  updateStudent(student_id: number, newStudent: NewStudent): Observable<Student> {
    const headers = this.headers;
    return this.http.put<Student>(this.apiStudentsRoute+'edit/id/'+student_id, newStudent, { headers });
  }

  getStudent(student_id: number): Observable<Student> {
    const headers = this.headers;
    return this.http.get<Student>(this.apiStudentsRoute+'id/'+student_id, { headers });
  }

  deleteStudent(studentId: number): Observable<any> {
    const headers = this.headers;
    return this.http.delete<any>(this.apiStudentsRoute+'delete/id/'+studentId, { headers });
  }
}
