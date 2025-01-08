import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinesDasboardComponent } from './fines-dasboard.component';

describe('FinesDasboardComponent', () => {
  let component: FinesDasboardComponent;
  let fixture: ComponentFixture<FinesDasboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinesDasboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinesDasboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
