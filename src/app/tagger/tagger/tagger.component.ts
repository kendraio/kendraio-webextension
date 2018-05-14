import { Component, NgZone, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { delay } from 'rxjs/operators';
import { ExtensionService } from '../../extension.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

const TAG_WIDTH = 100;
const TAG_HEIGHT = 100;

@Component({
  selector: 'app-tagger',
  templateUrl: './tagger.component.html',
  styleUrls: ['./tagger.component.scss']
})
export class TaggerComponent implements OnInit {

  userToken = '';
  imgUrl = '';
  pageUrl = '';

  isDone = false;
  isSending = false;
  isError = false;

  tagForm: FormGroup;

  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private ext: ExtensionService,
    private fb: FormBuilder
  ) {
    this.ext.getUserToken(token => this.userToken = token);
    this.tagForm = this.fb.group({
      tags: this.fb.array([])
    })
  }

  ngOnInit() {
    this.ext.initTagger(({ srcUrl, pageUrl }) => {
      this.zone.run(() => {
        console.log({ srcUrl, pageUrl });
        this.imgUrl = srcUrl;
        this.pageUrl = pageUrl;
      });
    });
  }

  getRegionFromPoint(x, y, limitX, limitY) {
    const x1 = x - (TAG_WIDTH / 2);
    const y1 = y - (TAG_HEIGHT / 2);
    const x2 = x + (TAG_WIDTH / 2);
    const y2 = y + (TAG_HEIGHT / 2);
    return {
      minX: Math.max(0, x1),
      minY: Math.max(0, y1),
      maxX: Math.min(limitX, x2),
      maxY: Math.min(limitY, y2)
    };
  }

  get tagFormTags(): FormArray {
    return this.tagForm.get('tags') as FormArray;
  }

  addTagZone(region) {
    console.log(`Adding tag zone at (${region.minX},${region.minY})-(${region.maxX},${region.maxY})`);
    this.tagFormTags.push(this.fb.group({ region, personName: ['', Validators.required ] }));
  }

  imageClicked(event: MouseEvent) {
    const { offsetX: x, offsetY: y , target } = event;
    this.addTagZone(this.getRegionFromPoint(x, y, target['clientWidth'], target['clientHeight']));
  }

  onCancel() {
    window.close();
  }

  formatDataObject() {
    const object = {
      ...this.tagForm.getRawValue(),
      user: this.userToken,
      source: this.pageUrl,
      image: this.imgUrl
    };
    console.log(object);
    return object;
  }

  onSubmit() {
    const DTO = this.formatDataObject();
    const headers = {
      'Authorization': `Bearer ${this.userToken}`
    };
    this.isSending = true;
    this.http.post(`${environment.api_base_path}/hello`, DTO, { headers }).pipe(
      // Example delay for when testing local server
      delay(2000)
    ).subscribe(() => {
      this.isSending = false;
      this.isDone = true;
    });
  }

}
