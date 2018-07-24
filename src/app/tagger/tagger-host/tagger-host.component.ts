import { Component, NgZone, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExtensionService } from '../../extension.service';
import PouchDB from 'pouchdb';
import { v4 as UUIDv4 } from 'uuid';

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
    console.log({ payload });
    const dto = [];
    const imageId = UUIDv4();

    const contentUrl = payload.imgUrl; //.split(/[?#]/)[0];

    const pxToPercent = (a, b) => (b !== 0) ? (a / b) : 0;

    dto.push({
      "@id": `kuid:${imageId}`,
      "@type": "schema:ImageObject",
      "schema:contentUrl": contentUrl,
      "schema:name": new URL(payload.imgUrl).pathname.slice(1),
      "schema:url": payload.pageUrl,
      "schema:width": payload.width,
      "schema:height": payload.height
    });
    payload.tags.forEach((tag, index) => {
      const tagId = UUIDv4();
      dto.push({
        "@id": `kuid:${tagId}`,
        "@type": "schema:Person",
        "schema:name": tag.name
      });
      dto.push({
        "@id": `kuid:${UUIDv4()}`,
        "@type": "kendra:InclusionRelationship",
        "kendra:timestamp": new Date().toISOString(),
        "kendra:source": { "@id": `kuid:${imageId}` },
        "kendra:target": { "@id": `kuid:${tagId}` },
        "kendra:visibility": tag.visibility,
        "kendra:boundingBox": {
          minX: pxToPercent(tag.region.minX, payload.width),
          minY: pxToPercent(tag.region.minY, payload.height),
          maxX: pxToPercent(tag.region.maxX, payload.width),
          maxY: pxToPercent(tag.region.maxY, payload.height)
        }
      });
    });

    return [{
      "@context": {
        "schema": "http://schema.org/",
        "kendra": "http://kendra.io/types#",
        "kuid": "http://kendra.io/uuid#",
        "@vocab": "http://facta.kendra.io/vocab#"
      },
      "graph": dto
    }];
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

    // TODO: add remote DB as a configuration option
    // const remoteDb = 'http://localhost:5984/';
    // const DB_NAME = 'db-test-03';
    // const db = new PouchDB(`${remoteDb}${DB_NAME}`);
    //
    // Promise.all(DTO[0].graph.map(item => {
    //   item['_id'] = item['@id'];
    //   return db.put(item);
    // })).then(console.log);

  }
}
