import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { NewStudent, Student } from 'src/app/models/students.models';
import { StudentService } from 'src/app/services/student.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  newStudent: NewStudent;

  updatingStudent: NewStudent;
  updatingStudentId?: number;

  students: Student[] = [];

  badForm: boolean = false;

  selectedStudent?: Student;

  @ViewChild(IonModal) editStudentModal!: IonModal;

  constructor(
    private userService: UserService, 
    private studentService: StudentService, 
    private modalController: ModalController,
  ) {
    this.newStudent = {
      instructor_id: userService.getCurrentUser('id'), 
      name: '',
      email: '',
      rut: '',
      sex: undefined,
      age: undefined,
      weight: undefined,
      height: undefined,
    };

    this.updatingStudent = {
      instructor_id: userService.getCurrentUser('id'), 
      name: '',
      email: '',
      rut: '',
      sex: undefined,
      age: undefined,
      weight: undefined,
      height: undefined,
    };
  }

  async ngOnInit() {
    this.fetchStudents();
  }

  fetchStudents() {
    this.studentService.getStudents().subscribe(
      (data) => {
        console.log(data);
        this.students = data;
      },
      (error) => {
        console.log("[students.page - constructor] An error has ocurred: ", error);
      }
    )
  }

  async selectStudentToEdit(student: Student) {
    this.updatingStudentId = student.id;
    this.updatingStudent = {
      instructor_id: this.userService.getCurrentUser('id'), 
      name: student.name,
      email: student.email,
      rut: student.rut,
      sex: student.sex,
      age: student.age,
      weight: student.weight,
      height: student.height,
    }

    this.editStudentModal.present();
  }

  updateStudent() {
    {
      if (!this.updatingStudentId || !this.updatingStudent.name || !this.updatingStudent.email || !this.updatingStudent.rut || !this.updatingStudent.sex) {
        this.badForm = true;
        return;
      }
      //add student
      this.studentService.updateStudent(this.updatingStudentId, this.updatingStudent).subscribe(
        (res) => {
          this.fetchStudents();
          this.modalController.dismiss();
          this.badForm = false;
          this.updatingStudent = {
            instructor_id: this.userService.getCurrentUser('id'), 
            name: '',
            email: '',
            rut: '',
            sex: undefined,
            age: undefined,
            weight: undefined,
            height: undefined,
          }
        },
        (error) => {
          console.log("[students.page - updateStudent] An error has ocurred: ", error);
        }
      )
    }
  }

  deleteStudent(studentId: number) {
    this.studentService.deleteStudent(studentId).subscribe(
      (res) => {
        this.fetchStudents();
      },
      (error) => {
        console.log("[students.page - deleteStudent] An error has ocurred: ", error);
      }
    )
  }

  addStudent() {
    if (!this.newStudent.name || !this.newStudent.email || !this.newStudent.rut || !this.newStudent.sex) {
      this.badForm = true;
      return;
    }
    //add student
    this.studentService.createStudent(this.newStudent).subscribe(
      (res) => {
        this.fetchStudents();
        this.modalController.dismiss();
        this.badForm = false;
        this.newStudent = {
          instructor_id: this.userService.getCurrentUser('id'), 
          name: '',
          email: '',
          rut: '',
          sex: undefined,
          age: undefined,
          weight: undefined,
          height: undefined,
        }
      },
      (error) => {
        console.log("[students.page - addStudent] An error has ocurred: ", error);
      }
    )
  }

}
