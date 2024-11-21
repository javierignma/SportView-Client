import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewStudentProgress, Student, StudentProgress, StudentProgressAvg } from 'src/app/models/students.models';
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

  technique: number | null = null;
  physique: number | null = null;
  combatIq: number | null = null;

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
          this.studentStats.physique_avg = Math.round(this.studentStats.physique_avg * 10)/10;
          this.studentStats.technique_avg = Math.round(this.studentStats.technique_avg * 10)/10;
          this.studentStats.combat_iq_avg = Math.round(this.studentStats.combat_iq_avg * 10)/10;
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

  isToday() {
    return this.studentProgressService.isToday();
  }

  isOldestDate() {
    return this.studentProgressService.isOldestDate();
  }

  nextDate() {
    if (this.studentId) this.studentProgressService.goNextDate(this.studentId);
  }

  prevDate() {
    if (this.studentId) this.studentProgressService.goPrevDate(this.studentId);
  }

  progressExists() {
    if (this.selectedDateStudentStats) return true;
    else return false;
  }

  checkTechniqueNumber() {
    if (this.technique) {
      if (this.technique > 10) this.technique = 10;
      else if (this.technique < 0) this.technique = 0;
    } 
  }

  checkPhysiqueNumber() {
    if (this.physique) {
      if (this.physique > 10) this.physique = 10;
      else if (this.physique < 0) this.physique = 0;
    }
  }

  checkCombatIqNumber() {
    if (this.combatIq) {
      if (this.combatIq > 10) this.combatIq = 10;
      else if (this.combatIq < 0) this.combatIq = 0;
    }
  }

  addRegistry() {
    if (!this.studentId || !this.date || !this.technique || !this.physique || !this.combatIq) {
      console.log("[student-profile.page - addRegistry] some data is missing!");
      return;
    }

    console.log("[student-profile.page - addRegistry] Creating newStudent object");

    const newStudent: NewStudentProgress = {
      student_id: this.studentId,
      progress_date: this.date,
      technique: this.technique,
      physique: this.physique,
      combat_iq: this.combatIq
    };

    this.studentProgressService.addStudentProgress(newStudent).subscribe(
      (res) => {
        console.log("[student-profile.page - addRegistry] data was saved");
        this.ngOnInit();
      },
      (error) => {
        console.log("[student-profile.page - addRegistry] An error has ocurred:", error);
      }
    )
  }

  modifyRegistry() {

  }

}
