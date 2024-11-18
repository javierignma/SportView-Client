import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api, routes } from 'src/environments/environment';
import { UserService } from './user.service';
import { NewStudentProgress, StudentProgress } from '../models/students.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentProgressService {
  apiStudentsRoute: string = api.backend+routes.students+'progress/';

  headers: HttpHeaders;

  constructor(private http: HttpClient, private userService: UserService) { 
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });
  }

  getStudentProgress(studentId: number, date: string): Observable<StudentProgress> {
    const headers = this.headers;
    return this.http.get<StudentProgress>(this.apiStudentsRoute+studentId+"/"+date, { headers });
  }

  addStudentProgress(studentProgress: NewStudentProgress) {
    const headers = this.headers;
    return this.http.post<StudentProgress>(this.apiStudentsRoute, studentProgress, { headers });
  }
}
