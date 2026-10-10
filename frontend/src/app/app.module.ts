import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { LayoutModule } from './views/layout/layout.module';
import { AuthGuard } from './core/guard/auth.guard';

import { AppComponent } from './app.component';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';

import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    ErrorPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    HttpClientModule,
    MatSnackBarModule,
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    // {
    //   provide: HIGHLIGHT_OPTIONS, // https://www.npmjs.com/package/ngx-highlightjs
    //   useValue: {
    //     coreLibraryLoader: () => import('highlight.js/lib/core'),
    //     languages: {
    //       xml: () => import('highlight.js/lib/languages/xml'),
    //       typescript: () => import('highlight.js/lib/languages/typescript'),
    //       scss: () => import('highlight.js/lib/languages/scss'),
    //     }
    //   }
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
