import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Student } from 'src/app/models/students.models';
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

  constructor(
    private studentService: StudentService,
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
    } 
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

}
