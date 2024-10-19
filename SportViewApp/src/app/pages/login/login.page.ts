import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  login() {
    // implement login validation
    
  }

  goToResetPassword() {
    this.router.navigate(['/reset-password'])
  }

  goToSignUp() {
    this.router.navigate(['/signup'])
  }

}
