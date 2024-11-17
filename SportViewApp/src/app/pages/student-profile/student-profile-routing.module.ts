import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentProfilePage } from './student-profile.page';

const routes: Routes = [
  {
    path: '',
    component: StudentProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentProfilePageRoutingModule {}
