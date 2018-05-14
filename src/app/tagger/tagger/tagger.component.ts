import { Component, NgZone, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { delay } from 'rxjs/operators';
import { ExtensionService } from '../../extension.service';

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
  }

  onCancel() {
    window.close();
  }

  onSubmit() {
    const headers = {
      'Authorization': `Bearer ${this.userToken}`
    };
    this.isSending = true;
    this.http.post(`${environment.api_base_path}/hello`, {
      image_url: this.imgUrl,
      page_url: this.pageUrl
    }, { headers }).pipe(
      delay(2000)
    ).subscribe(() => {
      this.isSending = false;
      this.isDone = true;
    });
  }

}
