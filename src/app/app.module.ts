import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BeliefStateGridComponent } from './belief-state-grid/belief-state-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    BeliefStateGridComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
