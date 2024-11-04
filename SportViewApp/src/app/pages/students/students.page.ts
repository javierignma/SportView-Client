import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  constructor() { }

  ngOnInit() {
  }

}
