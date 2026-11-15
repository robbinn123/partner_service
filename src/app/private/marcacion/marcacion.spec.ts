import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Marcacion } from './marcacion';

describe('Marcacion', () => {
  let component: Marcacion;
  let fixture: ComponentFixture<Marcacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marcacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Marcacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
