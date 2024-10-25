import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginCredentials } from 'src/app/models/users.models';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  badCredentials: boolean = false;

  loginCredentials: LoginCredentials = {
    email: '',
    password: ''
  }

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit() {
  }

  login() {
    // implement login validation
    this.userService.login(this.loginCredentials).subscribe(
      (data) => {
        console.log('Login successful:', data);
        this.badCredentials = false;
      },
      (error) => {
        if (error.status == 401) {
          console.log('Invalid login credentials');
          this.badCredentials = true;
        }
        else console.log('An unexpected error occurred. Please try again.');
      }
    )
  }

  goToResetPassword() {
    this.router.navigate(['/reset-password'])
  }

  goToSignUp() {
    this.router.navigate(['/signup'])
  }

}
