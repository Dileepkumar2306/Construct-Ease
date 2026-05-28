import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteriorStudioComponent } from './interior-studio.component';

describe('InteriorStudioComponent', () => {
  let component: InteriorStudioComponent;
  let fixture: ComponentFixture<InteriorStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteriorStudioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InteriorStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
