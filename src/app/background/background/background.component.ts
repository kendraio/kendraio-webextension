import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {

  taggerInfo: any = {};

  constructor(private authService: AuthService) { }

  ngOnInit() {
    chrome.runtime.onMessage.addListener(({ type }, sender, sendResponse) => {
      console.log(`Run command ${type}`);
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

    chrome.contextMenus.create({
      id: "image-tagger",
      title: 'Tag Image (Kendraio)',
      contexts: ["image"]
    }, (...e) => {
      console.log(e);
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      switch (info.menuItemId) {
        case "image-tagger":
          console.log({ info, tab });
          const createData = {
            url: "/index.html#/tagger",
          };
          this.taggerInfo = info;
          const creating = chrome.tabs.create(createData, tab => {
            console.log(`Send message to tab ${tab.id}`);
            chrome.runtime.sendMessage(info);
          });
          console.log({ creating });
          break;
      }
    });
  }
}
