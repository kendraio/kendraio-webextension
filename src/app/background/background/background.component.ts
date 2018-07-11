import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ExtensionService } from '../../extension.service';

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {

  taggerInfo: any = {};

  constructor(private authService: AuthService, private ext: ExtensionService) { }

  ngOnInit() {
    this.ext.setBackgroundListener(({ type }, sender, sendResponse) => {
      // console.log(`Run command ${type}`);
      switch (type) {
        case 'authenticate':
          this.authService.authenticate();
          break;
        case 'logout':
          this.authService.logout();
          break;
        case 'taggerGetInfo':
          console.log('sendResponse', this.taggerInfo);
          sendResponse(this.taggerInfo);
          break;
      }
    });
    this.ext.setMenuListener((info, tab) => {
      // console.log(window.getSelection());
      // console.log({ info, tab });
      switch (info.menuItemId) {
        case "image-tagger":
          this.taggerInfo = info;
          chrome.tabs.create({
            url: "/index.html#/tagger",
          });
          break;
        case "selection-tagger":
          this.taggerInfo = info;
          chrome.tabs.create({
            url: "/index.html#selection",
          });
          break;
      }
    });
  }
}
