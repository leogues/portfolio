import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TechnologyComponent } from './technology.component'

describe('TechnologyComponent', () => {
  let component: TechnologyComponent
  let fixture: ComponentFixture<TechnologyComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TechnologyComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('technology', {
      name: 'Go',
      category: 'language',
      image: './assets/techs/go.svg',
      isDarkImage: false,
      link: 'https://go.dev/',
      isRelevant: true,
    })
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
