import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Student, StudentProgress, StudentProgressAvg } from 'src/app/models/students.models';
import { StudentProgressService } from 'src/app/services/student-progress.service';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.page.html',
  styleUrls: ['./student-profile.page.scss'],
})
export class StudentProfilePage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  studentId?: number | null = null;
  date: string | null = null;

  student?: Student;

  studentStats?: StudentProgressAvg;
  totalPointsAvg = 0;

  selectedDateStudentStats?: StudentProgress;
  selectedDateTotalPoints = 0;

  constructor(
    private studentService: StudentService,
    private studentProgressService: StudentProgressService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (params) => {
        this.studentId = Number(params.get('id'));
        this.date = params.get('date');
      }
    );

    if (this.studentId) {
      this.studentService.getStudent(this.studentId).subscribe(
        (data) => {
          this.student = data;
          console.log("[student-profile.page - ngOnInit] student:", this.student);
        },
        (error) => {
          console.log("[student-profile.page - ngOnInit] An error has ocurred:", error);
        }
      )

      this.studentProgressService.getAvgStudentProgress(this.studentId).subscribe(
        (data) => {
          this.studentStats = data;
          this.totalPointsAvg = data.combat_iq_avg + data.physique_avg + data.technique_avg;
          console.log("[student-profile.page - ngOnInit] studentStats:", this.studentStats);
        },
        (error) => {
          console.log("[student-profile.page - ngOnInit] An error has ocurred:", error);
        }
      )

      if (this.date) {
        this.studentProgressService.getStudentProgress(this.studentId, this.date).subscribe(
          (data) => {
            this.selectedDateStudentStats = data;
            this.selectedDateTotalPoints = data.combat_iq + data.physique + data.technique;
            console.log("[student-profile.page - ngOnInit] selectedDateStudentStats:", this.selectedDateStudentStats);
          },
          (error) => {
            console.log("[student-profile.page - ngOnInit] An error has ocurred:", error);
          }
        )
      }
    } 
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

}
