import { Component } from '@angular/core';
import { AttendanceService } from './services/attendance.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private attendanceService: AttendanceService) {
    this.attendanceService.getDates();
  }
}
