import { Component, NgZone, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExtensionService } from '../../extension.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-tagger-host',
  templateUrl: './tagger-host.component.html',
  styleUrls: ['./tagger-host.component.scss']
})
export class TaggerHostComponent implements OnInit {

  userToken = '';
  imgUrl = '';
  pageUrl = '';

  backendUrl = 'http://localhost:8080';

  isDone = false;
  isSending = false;
  isError = false;

  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private ext: ExtensionService
  ) {
    this.ext.getUserToken(token => this.userToken = token);
  }

  ngOnInit() {
    this.ext.initTagger(({ srcUrl, pageUrl }) => {
      this.zone.run(() => {
        console.log({ srcUrl, pageUrl });
        this.imgUrl = srcUrl;
        this.pageUrl = pageUrl;
      });
    });
    this.ext.get({
      kendraioOptions: { backend: this.backendUrl }
    }, (items) => {
      if (items.kendraioOptions.backend) {
        this.backendUrl = items.kendraioOptions.backend;
      }
    });
  }

  formatDataObject(payload) {
    const dto = [];

    dto.push({
      "@context": "http://kendraio.org/schema-v1",
      "@id": `IMAGE-1`,
      "@type": "image",
      "url": payload.imgUrl,
      "sourceUrl": payload.pageUrl,
      "width": payload.width,
      "height": payload.height
    });
    payload.tags.forEach((tag, index) => {
      dto.push({
        "@context": "http://schema.org",
        "@id": `PERSON-${index}`,
        "@type": "Person",
        "name": tag.name
      });
      dto.push({
        "@context": "http://kendraio.org/schema-v1",
        "@id": `TAG-${index}`,
        "@type": "inclusion-relationship",
        "frame": { "@id": "IMAGE_NODE" },
        "content": { "@id": `PERSON-${index}` },
        "bounding-box": [tag.region.minX, tag.region.minY, tag.region.maxX, tag.region.maxY]
      })
    });

    return dto;
  }

  onCancel() {
    window.close();
  }

  onTaggedSubmitted(payload) {
    const DTO = this.formatDataObject(payload);
    // console.log({ DTO });
    const headers = {
      'Authorization': `Bearer ${this.userToken}`
    };
    this.isSending = true;
    this.http.post(`${this.backendUrl}/api/assert`, DTO, { headers }).pipe(
      // Example delay for when testing local server
      // delay(2000)
    ).subscribe(() => {
      this.isSending = false;
      this.isDone = true;
    });
  }
}



// import { Component, NgZone, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';
// import { delay } from 'rxjs/operators';
// import { ExtensionService } from '../../extension.service';
// import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
//
// const TAG_WIDTH = 100;
// const TAG_HEIGHT = 100;
//
// @Component({
//   selector: 'app-tagger',
//   templateUrl: './tagger.component.html',
//   styleUrls: ['./tagger.component.scss']
// })
// export class TaggerComponent implements OnInit {
//
//   userToken = '';
//   imgUrl = '';
//   pageUrl = '';
//
//   isDone = false;
//   isSending = false;
//   isError = false;
//
//   tagForm: FormGroup;
//
//   backendUrl = 'http://localhost:8080';
//
//   constructor(
//     private zone: NgZone,
//     private http: HttpClient,
//     private ext: ExtensionService,
//     private fb: FormBuilder
//   ) {
//     this.ext.getUserToken(token => this.userToken = token);
//     this.tagForm = this.fb.group({
//       tags: this.fb.array([])
//     })
//   }
//
//   ngOnInit() {
//     this.ext.initTagger(({ srcUrl, pageUrl }) => {
//       this.zone.run(() => {
//         console.log({ srcUrl, pageUrl });
//         this.imgUrl = srcUrl;
//         this.pageUrl = pageUrl;
//       });
//     });
//     this.ext.get({
//       kendraioOptions: { backend: this.backendUrl }
//     }, (items) => {
//       if (items.kendraioOptions.backend) {
//         this.backendUrl = items.kendraioOptions.backend;
//       }
//     });
//   }
//
//   getRegionFromPoint(x, y, limitX, limitY) {
//     const x1 = x - (TAG_WIDTH / 2);
//     const y1 = y - (TAG_HEIGHT / 2);
//     const x2 = x + (TAG_WIDTH / 2);
//     const y2 = y + (TAG_HEIGHT / 2);
//     return {
//       minX: Math.max(0, x1),
//       minY: Math.max(0, y1),
//       maxX: Math.min(limitX, x2),
//       maxY: Math.min(limitY, y2)
//     };
//   }
//
//   get tagFormTags(): FormArray {
//     return this.tagForm.get('tags') as FormArray;
//   }
//
//   addTagZone(region) {
//     console.log(`Adding tag zone at (${region.minX},${region.minY})-(${region.maxX},${region.maxY})`);
//     this.tagFormTags.push(this.fb.group({ region, personName: ['', Validators.required ] }));
//   }
//
//   imageClicked(event: MouseEvent) {
//     const { offsetX: x, offsetY: y , target } = event;
//     this.addTagZone(this.getRegionFromPoint(x, y, target['clientWidth'], target['clientHeight']));
//   }
//
//   onCancel() {
//     window.close();
//   }
//
//   formatDataObject() {
//     const object = {
//       ...this.tagForm.getRawValue(),
//       user: this.userToken,
//       source: this.pageUrl,
//       image: this.imgUrl
//     };
//     console.log(object);
//     return object;
//   }
//
//   onSubmit() {
//     const DTO = this.formatDataObject();
//     console.log({ DTO });
//     const headers = {
//       'Authorization': `Bearer ${this.userToken}`
//     };
//     this.isSending = true;
//     this.http.post(`${this.backendUrl}/api/assert`, DTO, { headers }).pipe(
//       // Example delay for when testing local server
//       delay(2000)
//     ).subscribe(() => {
//       this.isSending = false;
//       this.isDone = true;
//     });
//   }
//
// }