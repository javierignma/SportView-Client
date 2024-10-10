import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  constructor() { }

  ngOnInit() {
  }

}
