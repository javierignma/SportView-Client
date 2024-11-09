import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api, routes } from 'src/environments/environment';
import { Attendance, AttendanceRequest } from '../models/attendances.models';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  apiAttendanceRoute: string = api.backend+routes.attendance;

  headers: HttpHeaders;

  dates: string[] = [];
  currentDateIndex = 0;

  constructor(private route: Router, private http: HttpClient, private userService: UserService) {
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });
  }

  getCurrentDateIndex() {
    return this.currentDateIndex;
  }

  updateAttendances(attendances: Attendance[]) {
    const headers = this.headers;
    return this.http.put(this.apiAttendanceRoute, attendances, { headers });
  }

  createAttendances(attendances: AttendanceRequest[]) {
    const headers = this.headers;
    return this.http.post(this.apiAttendanceRoute, attendances, { headers });
  }

  getAttendances(date: string): Observable<Attendance[]> {
    const headers = this.headers;
    return this.http.get<Attendance[]>(this.apiAttendanceRoute+this.userService.getCurrentUser('id')+'/'+date, { headers });
  }
  
  goTodayDate() {
    this.currentDateIndex = this.dates.length - 1;
    this.route.navigate(['/attendance/'+this.dates[this.currentDateIndex]]);
  }

  goNextDate() {
    console.log("[attendance.service - goNextDate] index ", this.currentDateIndex, " going next date ->");
    if (this.currentDateIndex == this.dates.length - 1) return;
    this.currentDateIndex += 1;
    console.log("[attendance.service - goPrevDate] currentIndex now is:", this.currentDateIndex);
    this.route.navigate(['/attendance/'+this.dates[this.currentDateIndex]]);
  }

  goPrevDate() {
    console.log("[attendance.service - goPrevDate] index ", this.currentDateIndex, " going prev date <-");
    if (this.currentDateIndex == 0) return;
    this.currentDateIndex -= 1;
    console.log("[attendance.service - goPrevDate] currentIndex now is:", this.currentDateIndex);
    this.route.navigate(['/attendance/'+this.dates[this.currentDateIndex]]);
  }

  getDates() {
    this.http.get<string[]>(this.apiAttendanceRoute+'dates').subscribe(
      data => {
        this.dates = data;
        const todayDate = new Date().toISOString().split('T')[0];
        if (this.dates[this.dates.length - 1] != todayDate) {
          this.dates.push(todayDate);
        }
        this.currentDateIndex = this.dates.length - 1;
        console.log("[attendance.service - getDates] dates: ", this.dates);
        console.log("[attendance.service - getDates] currentIndex: ", this.currentDateIndex);
      },
      error => console.log("[attendance.page - ngOnInit] An error has ocurred: ", error)
    )
  }
}
