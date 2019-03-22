import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BeliefStateGridComponent } from './belief-state-grid/belief-state-grid.component';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        BeliefStateGridComponent
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
