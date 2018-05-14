import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ExtensionService } from './extension.service';
import { MockExtensionService } from './mock-extension.service';

const ROUTES = [
  {
    path: 'background',
    loadChildren: './background/background.module#BackgroundModule'
  },
  {
    path: 'popup',
    loadChildren: './popup/popup.module#PopupModule'
  },
  {
    path: 'tagger',
    loadChildren: './tagger/tagger.module#TaggerModule'
  },
  {
    path: 'options',
    loadChildren: './options/options.module#OptionsModule'
  }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [
    // { provide: ExtensionService, useClass: MockExtensionService }
    ExtensionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
