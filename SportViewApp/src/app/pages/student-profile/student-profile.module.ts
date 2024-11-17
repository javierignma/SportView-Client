import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudentProfilePageRoutingModule } from './student-profile-routing.module';

import { StudentProfilePage } from './student-profile.page';
import { TabsComponentModule } from 'src/app/components/tabs/tabs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudentProfilePageRoutingModule,
    TabsComponentModule
  ],
  declarations: [StudentProfilePage]
})
export class StudentProfilePageModule {}
