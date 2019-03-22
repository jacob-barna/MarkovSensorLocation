import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeliefStateGridComponent } from './belief-state-grid.component';

describe('BeliefStateGridComponent', () => {
  let component: BeliefStateGridComponent;
  let fixture: ComponentFixture<BeliefStateGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeliefStateGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeliefStateGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
