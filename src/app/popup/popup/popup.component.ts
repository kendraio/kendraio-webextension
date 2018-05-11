import { Component, OnInit } from '@angular/core';
import { isLoggedIn } from '../utils';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  isLoggedIn = false;

  constructor() { }

  ngOnInit() {
    this.isLoggedIn = isLoggedIn();
  }

  login() {
    chrome.runtime.sendMessage({ type: "authenticate" });
    window.close();
  }

  logout() {
    chrome.runtime.sendMessage({ type: "logout" });
    window.close();
  }

}
