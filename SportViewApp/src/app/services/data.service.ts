import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { api, routes } from 'src/environments/environment';
import { UserService } from './user.service';
import { NewStudentProgress, StudentProgress, StudentProgressAvg } from '../models/students.models';


@Injectable({
  providedIn: 'root',
})

export class DataService {
  private apiUrl: string = api.backend;
  apiStudentsRoute: string = api.backend+routes.students+'progress/';
  private apiAttendanceRoute = `${api.backend}${routes.attendance}`;
  private apiStudentProgressRoute = `${api.backend}${routes.students}`;
  private headers: HttpHeaders;
  dates: string[] = [];
  currentDateIndex: number = 0;

  constructor(private http: HttpClient, private userService: UserService) {
    this.headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('auth_token'),
    });
  }

  // Obtener fechas y promedio de asistencia
  GetD(): Observable<string[]> {
    const currentUser = this.userService.getCurrentUser("id")

    return new Observable(observer => {
      this.http.get<string[]>(`${this.apiAttendanceRoute}dates/${currentUser}`).subscribe(
        data => {
          this.dates = data;
          const todayDate = new Date().toISOString().split('T')[0];
          if (this.dates[this.dates.length - 1] !== todayDate) {
            this.dates.push(todayDate);
          }
          this.currentDateIndex = this.dates.length - 1;

          console.log('[attendance.service - getDates] dates:', this.dates);
          console.log('[attendance.service - getDates] currentIndex:', this.currentDateIndex);

          observer.next(this.dates);
          observer.complete();
        },
        error => {
          const todayDate = new Date().toISOString().split('T')[0];
          this.dates = [todayDate];
          this.currentDateIndex = 0;

          console.log('[attendance.service - getDates] Error:', error);

          observer.next(this.dates);
          observer.complete();
        }
      );
    });
  }
  // Obtener KPI y datos del gráfico para el estudiante
  getStudentProgress(studentId: number): Observable<StudentProgress[]> {
    return this.http.get<StudentProgress[]>(`${this.apiStudentsRoute}student/${studentId}`);
  }
  
  getStudentProgressByRange(studentId: number, startDate: string, endDate: string): Observable<StudentProgress[]> {
    const headers = this.headers; // Si tienes encabezados configurados
    const url = `${this.apiStudentsRoute}student/${studentId}/progress?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<StudentProgress[]>(url, { headers });
  }
  getAvgStudentP(studentId: number, year?: number, month?: string) {
    let params = new HttpParams().set('studentId', studentId.toString());
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month);

    return this.http.get<any>(this.apiUrl, { params });
  }
}
