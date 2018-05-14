import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaggerComponent } from './tagger/tagger.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TaggerComponent
      }
    ])
  ],
  declarations: [TaggerComponent]
})
export class TaggerModule { }
