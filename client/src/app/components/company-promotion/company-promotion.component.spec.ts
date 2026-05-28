import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyPromotionComponent } from './company-promotion.component';

describe('CompanyPromotionComponent', () => {
  let component: CompanyPromotionComponent;
  let fixture: ComponentFixture<CompanyPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPromotionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
