import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaggerComponent } from './tagger/tagger.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaggerHostComponent } from './tagger-host/tagger-host.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TaggerHostComponent
      }
    ])
  ],
  declarations: [TaggerComponent, TaggerHostComponent]
})
export class TaggerModule { }
