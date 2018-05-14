import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  optionsForm: FormGroup;
  statusTextContent = '';

  constructor(private fb: FormBuilder, private zone: NgZone) {
    this.optionsForm = this.fb.group({
      backend: ['http://localhost:8080', Validators.required]
    })
  }

  ngOnInit() {
    chrome.storage.local.get({
      kendraioOptions: { backend: 'http://localhost:8080' }
    }, (items) => {
      this.zone.run(() => {
        this.optionsForm.patchValue(items.kendraioOptions);
      });
    });
  }

  save() {
    const { backend } = this.optionsForm.getRawValue();
    chrome.storage.local.set({ kendraioOptions: { backend }}, () => {
      this.zone.run(() => {
        this.statusTextContent = 'Options saved.';
      });
      setTimeout(() => {
        this.zone.run(() => {
          this.statusTextContent= '';
        });
      }, 750);
    });
  }

}
