import { Component, NgZone, OnInit } from '@angular/core';
import { ExtensionService } from '../../extension.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  userName = '';
  isLoggedIn = false;

  constructor(private ext: ExtensionService, private zone: NgZone) { }

  ngOnInit() {
    // console.log('init popup');
    this.ext.getUser((user: any)=> {
      if (user) {
        const { exp, nickname } = user;
        // Check user token is not past expiry time
        if ((exp * 1000) >= new Date().getTime()) {
          this.zone.run(() => {
            this.userName = nickname || 'Kendraio User';
            this.isLoggedIn = true;
          });
        }
      }
    });
  }

  login() {
    this.ext.sendMessage('authenticate');
    window.close();
  }

  logout() {
    this.ext.sendMessage('logout');
    window.close();
  }

}
