import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrinsicParamDownloadComponent } from './extrinsic-param-download.component';

describe('ExtrinsicParamDownloadComponent', () => {
  let component: ExtrinsicParamDownloadComponent;
  let fixture: ComponentFixture<ExtrinsicParamDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtrinsicParamDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtrinsicParamDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
