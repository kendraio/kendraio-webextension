import { Component, NgZone, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExtensionService } from '../../extension.service';

@Component({
  selector: 'app-tagger-host',
  templateUrl: './tagger-host.component.html',
  styleUrls: ['./tagger-host.component.scss']
})
export class TaggerHostComponent implements OnInit {

  userToken = '';
  imgUrl = '';
  pageUrl = '';

  backendUrl = 'https://facta.kendra.io';

  isDone = false;
  isSending = false;
  isError = false;
  errorTitle = 'No Auth';
  errorMessage = 'Login via the toolbar to start tagging.';

  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private ext: ExtensionService
  ) {
    this.ext.getUserToken(token => {
      if (token) {
        this.userToken = token
      } else {
        this.isError = true;
        this.errorTitle = 'No Auth';
        this.errorMessage = 'Login via the toolbar to start tagging.';
      }
    });
  }

  ngOnInit() {
    this.ext.initTagger(({ srcUrl, pageUrl }) => {
      this.zone.run(() => {
        // console.log({ srcUrl, pageUrl });
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
      "coordinateSystem": "CSS (as displayed)",
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
        "timestamp": new Date().toISOString(),
        "frame": { "@id": "IMAGE_NODE" },
        "content": { "@id": `PERSON-${index}` },
        "coordinateSystem": "CSS (as displayed)",
        "visibility": tag.visibility,
        "boundingBox": tag.region
      });
    });

    return dto;
  }

  onCancel() {
    window.close();
  }

  onTaggedSubmitted(payload) {
    const DTO = this.formatDataObject(payload);
    console.log({ DTO });
    const headers = {
      'Authorization': `Bearer ${this.userToken}`
    };
    this.isSending = true;
    this.http
      .post(`${this.backendUrl}/api/assert`, DTO, { headers })
      .subscribe(() => {
        this.isSending = false;
        this.isDone = true;
      }, ({ error, status }) => {
        this.isError = true;
        this.errorTitle = 'Error';
        this.errorMessage = 'Unknown error';
        if (status === 500) {
          this.isError = true;
          this.errorTitle = 'Server Error';
          this.errorMessage = error.details;
        }
        if (status === 401) {
          this.isError = true;
          this.errorTitle = 'No Auth';
          this.errorMessage = 'Login via the toolbar to start tagging.';
        }
      });
  }
}
