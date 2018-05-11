import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from './background/background.component';
import { RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: BackgroundComponent
      }
    ])
  ],
  providers: [AuthService],
  declarations: [BackgroundComponent]
})
export class BackgroundModule { }
