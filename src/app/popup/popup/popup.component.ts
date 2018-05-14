import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { JwtPayload } from '../../model/jwt-payload';
import * as jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  jwtPayload$: Subject<JwtPayload> = new Subject<JwtPayload>();
  user$: Observable<any>;
  isLoggedIn$: Observable<boolean>;

  constructor() { }

  ngOnInit() {
    console.log('init popup');
    this.user$ = this.jwtPayload$.pipe(
      tap(console.log),
      map((payload: JwtPayload) => jwtDecode(payload.id_token)),
      tap(console.log)
    );
    this.isLoggedIn$ = this.user$.pipe(
      tap(console.log),
      map(user => !!user),
      startWith(false)
    );
    this.jwtPayload$.next(JSON.parse(localStorage.getItem('kendraio.authParams')));
    this.jwtPayload$.subscribe(console.log);
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
