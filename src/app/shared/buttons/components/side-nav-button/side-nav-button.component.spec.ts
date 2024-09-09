import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavButtonComponent } from './side-nav-button.component';

describe('SideNavButtonComponent', () => {
  let component: SideNavButtonComponent;
  let fixture: ComponentFixture<SideNavButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SideNavButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
