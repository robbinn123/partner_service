import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelRrhh } from './panel-rrhh';

describe('PanelRrhh', () => {
  let component: PanelRrhh;
  let fixture: ComponentFixture<PanelRrhh>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelRrhh],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelRrhh);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
