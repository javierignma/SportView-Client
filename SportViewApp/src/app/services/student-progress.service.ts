import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api, routes } from 'src/environments/environment';
import { UserService } from './user.service';
import { NewStudentProgress, StudentProgress, StudentProgressAvg } from '../models/students.models';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StudentProgressService {
  apiStudentsRoute: string = api.backend+routes.students+'progress/';

  headers: HttpHeaders;

  dates: string[] = [];
  currentDateIndex = 0;

  constructor(private http: HttpClient, private userService: UserService, private route: Router) { 
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });
  }

  getStudentProgress(studentId: number, date: string): Observable<StudentProgress> {
    const headers = this.headers;
    return this.http.get<StudentProgress>(this.apiStudentsRoute+"student/"+studentId+"/"+date, { headers });
  }

  getAvgStudentProgress(studentId: number): Observable<StudentProgressAvg> {
    const headers = this.headers;
    return this.http.get<StudentProgressAvg>(this.apiStudentsRoute+"student-avg/"+studentId, { headers });
  }

  addStudentProgress(studentProgress: NewStudentProgress) {
    const headers = this.headers;
    return this.http.post<StudentProgress>(this.apiStudentsRoute, studentProgress, { headers });
  }

  getDates(studentId: number) {
    const currentUser = this.userService.getCurrentUser('id');
    this.http.get<string[]>(this.apiStudentsRoute+'dates/'+currentUser+'/'+studentId).subscribe(
      data => {
        this.dates = data;
        const todayDate = new Date().toISOString().split('T')[0];
        if (this.dates[this.dates.length - 1] != todayDate) {
          this.dates.push(todayDate);
        }
        this.currentDateIndex = this.dates.length - 1;
        console.log("[student-progress.service - getDates] dates: ", this.dates);
        console.log("[student-progress.service - getDates] currentIndex: ", this.currentDateIndex);
      },
      error => {
        const todayDate = new Date().toISOString().split('T')[0];
        this.dates = [todayDate];
        this.currentDateIndex = 0;

        console.log("[student-progress.service - getDates] An error has ocurred: ", error)
      }
    )
  }

  goNextDate(student_id: number) {
    console.log("[student-progress.service - goNextDate] index ", this.currentDateIndex, " going next date ->");
    if (this.currentDateIndex == this.dates.length - 1) return;
    this.currentDateIndex += 1;
    console.log("[student-progress.service - goPrevDate] currentIndex now is:", this.currentDateIndex);
    this.route.navigate(['/student-profile/'+student_id+'/'+this.dates[this.currentDateIndex]]);
  }

  goPrevDate(student_id: number) {
    console.log("[student-progress.service - goPrevDate] index ", this.currentDateIndex, " going prev date <-");
    if (this.currentDateIndex == 0) return;
    this.currentDateIndex -= 1;
    console.log("[student-progress.service - goPrevDate] currentIndex now is:", this.currentDateIndex);
    this.route.navigate(['/student-profile/'+student_id+'/'+this.dates[this.currentDateIndex]]);
  }

  isOldestDate() {
    return this.currentDateIndex == 0;
  }

  isToday() {
    return this.currentDateIndex == this.dates.length - 1;
  }
}
