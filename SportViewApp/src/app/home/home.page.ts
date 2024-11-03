import { Component } from '@angular/core';
import { TabsComponent } from '../components/tabs/tabs.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  sportViewLogo: string = '../../../assets/sportview-logo.png';

  constructor() {}

}
