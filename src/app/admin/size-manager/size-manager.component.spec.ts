import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeManagerComponent } from './size-manager.component';

describe('SizeManagerComponent', () => {
  let component: SizeManagerComponent;
  let fixture: ComponentFixture<SizeManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SizeManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
