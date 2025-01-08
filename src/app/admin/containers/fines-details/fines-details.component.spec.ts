import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinesDetailsComponent } from './fines-details.component';

describe('FinesDetailsComponent', () => {
  let component: FinesDetailsComponent;
  let fixture: ComponentFixture<FinesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinesDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
