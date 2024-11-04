import { Component } from '@angular/core';
import { TabsComponent } from '../components/tabs/tabs.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  name: string = '';

  constructor(private userService: UserService) {}

  ionViewWillEnter() {
    this.name = this.userService.getCurrentUser('first_name');
  }

}
