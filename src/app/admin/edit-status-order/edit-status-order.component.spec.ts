import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStatusOrderComponent } from './edit-status-order.component';

describe('EditStatusOrderComponent', () => {
  let component: EditStatusOrderComponent;
  let fixture: ComponentFixture<EditStatusOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStatusOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStatusOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
