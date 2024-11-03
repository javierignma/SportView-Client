import { Component, OnInit } from '@angular/core';

import { addIcons } from 'ionicons';
import { home, document, person, trendingUp } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent  implements OnInit {

  constructor() {
    addIcons({ home, document, person, trendingUp });
  }

  ngOnInit() {}

  goToHome() {

  }

  goToAttendance() {
    
  }

  goToProgress() {
    
  }

  goToProfile() {
    
  }
}
