import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Attendance, AttendanceRequest } from 'src/app/models/attendances.models';
import { Student } from 'src/app/models/students.models';
import { AttendanceService } from 'src/app/services/attendance.service';
import { StudentService } from 'src/app/services/student.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  date: string | null = '';

  pageIsLoaded: boolean = false;

  isToday: boolean = true;

  students: AttendanceRequest[] = [];

  studentsRegistered: Attendance[] = [];

  attendance: Attendance[] = [];

  uploadingData: boolean = false;

  dataUpdated: boolean = false;

  constructor(private userService: UserService, private studentService: StudentService, private attendanceService: AttendanceService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.students = [];
    this.studentsRegistered = [];
    this.attendance = [];
    this.dataUpdated = false;

    this.route.paramMap.subscribe(
      (params) => {
        this.date = params.get('date');
        if (this.date) {
          this.isToday = this.isTodayFunction(this.date);
          if (this.isToday) this.attendanceService.getDates();
          this.attendanceService.getAttendances(this.date).subscribe(
            (data) => {
              this.studentsRegistered = data;
              console.log(this.studentsRegistered);
            },
            (error) => {
              this.studentsRegistered = [];
              console.log("[attendance.page - ngOnInit] An error has ocurred: ", error);
              this.studentService.getStudents().subscribe(
                (data: Student[]) => {
                  this.students = [];
                  data.forEach((student) => {
                    const newAttendance = {
                      instructor_id: this.userService.getCurrentUser('id'), 
                      student_id: student.id,
                      student_name: student.name,
                      date: this.date!,
                      present: false,
                    };
                    this.students.push(newAttendance);
                  })
                },
                (error) => {
                  console.log("[attendance.page - ngOnInit] An error has ocurred: ", error);
                }
              );
            }
          );
        }
      }
    );
  }

  ngAfterViewInit() {
    this.pageIsLoaded = true;
  }

  isOldestDate() {
    if (this.attendanceService.getCurrentDateIndex() == 0) return true;
    else return false;
  }

  nextDate() {
    if (!this.pageIsLoaded) return;
    this.attendanceService.goNextDate();
  }

  prevDate() {
    if (!this.pageIsLoaded) return;
    this.attendanceService.goPrevDate();
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  isTodayFunction(date: string): boolean {
    const [year, month, day] = date.split('-').map(Number); 
    const inputDate = new Date(year, month - 1, day); 
  
    const today = new Date(); 
    
    return (
      inputDate.getDate() === today.getDate() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getFullYear() === today.getFullYear()
    );
  }

  createAttendances() {
    if (this.uploadingData) return;
    this.uploadingData = true;
    this.attendanceService.createAttendances(this.students).subscribe(
      (res) => {
        console.log(res);
        this.uploadingData = false;
        this.ngOnInit();
      },
      (error) => {
        this.uploadingData = false;
        console.log(error);
      }
    )
  }

  updateAttendances() {
    if (this.uploadingData) return;
    this.uploadingData = true;
    this.dataUpdated = false;
    this.attendanceService.updateAttendances(this.studentsRegistered).subscribe(
      (res) => {
        console.log(res);
        this.uploadingData = false;
        this.dataUpdated = true;
      },
      (error) => {
        this.uploadingData = false;
        console.log(error);
      }
    )
  }

}
