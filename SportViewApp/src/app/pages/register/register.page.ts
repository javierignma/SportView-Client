import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterCredentials } from 'src/app/models/users.models';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  registerCredentials: RegisterCredentials = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  }

  passwordConfirmation: string = '';

  passwordDoesNotMatch: boolean = false;
  emailInUse: boolean = false;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit() {
  }

  matchPasswords() {
    if (this.passwordConfirmation != this.registerCredentials.password) this.passwordDoesNotMatch = true;
    else this.passwordDoesNotMatch = false;
  }

  goLogin() {
    this.router.navigate(['/login'])
  }

  register() {
    if (this.passwordDoesNotMatch) {
      return;
    }

    this.userService.createNewUser(this.registerCredentials).subscribe(
      (data) => {
        console.log('Succesfully registered:', data);
        this.emailInUse = false;
        this.router.navigate(['/login'])
      },
      (error) => {
        if (error.status == 409) {
          console.log('Email is already in use.');
          this.emailInUse = true;
        }
        else console.log('An unexpected error occurred. Please try again.');
      }
    )

    console.log(this.registerCredentials);
    console.log(this.passwordConfirmation);
  }

}
