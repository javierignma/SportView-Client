import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
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

  ngOnInit() {}

  ionViewDidEnter() {
    console.log("[login page - ionViewDidEnter] Validating token...");
    this.userService.verifyToken().subscribe(
      (isValid) => {
        console.log("[login page - ionViewDidEnter] token is valid: "+isValid.email);
        if (isValid.email) this.router.navigate(['/home']);
      }
    )
  }

  login() {
    this.userService.login(this.loginCredentials).subscribe(
      (data) => {
        console.log('Login successful:', data);
        this.badCredentials = false;
        this.loginCredentials.email = '';
        this.loginCredentials.password = '';
        this.router.navigate(['/home'])
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

  goToRegister() {
    this.router.navigate(['/register'])
  }

}
