import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorsTableComponent } from './sensors-table.component';

describe('SensorsTableComponent', () => {
  let component: SensorsTableComponent;
  let fixture: ComponentFixture<SensorsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
