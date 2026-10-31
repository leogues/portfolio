import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProjectComponent } from './project.component'
import { HOME_PROJECTS } from '../pages/home/home.data'

describe('ProjectComponent', () => {
  let component: ProjectComponent
  let fixture: ComponentFixture<ProjectComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ProjectComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('project', HOME_PROJECTS[0])
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
