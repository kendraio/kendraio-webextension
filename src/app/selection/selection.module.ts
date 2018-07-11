import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SelectionHostComponent } from './selection-host/selection-host.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: SelectionHostComponent
      }
    ])
  ],
  declarations: [SelectionHostComponent]
})
export class SelectionModule { }
