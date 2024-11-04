import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { home, document, logOutOutline, peopleOutline } from 'ionicons/icons';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent  implements OnInit {

  constructor(private router: Router, private userService: UserService) {
    addIcons({ home, document, logOutOutline, peopleOutline });
  }

  ngOnInit() {}

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToAttendance() {
    
  }

  goToStudents() {
    this.router.navigate(['/students']);
  }

  logout() {
    this.userService.logout();
  }
}
