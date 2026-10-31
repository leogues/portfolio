import { TestBed } from '@angular/core/testing'
import { AppComponent } from './app.component'
import { provideRouter, Router } from '@angular/router'
import { routes } from './app.routes'

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it(`should have the 'portfolio' title`, () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app.title).toEqual('portfolio')
  })

  it('should render the home page', async () => {
    const fixture = TestBed.createComponent(AppComponent)
    fixture.detectChanges()
    await TestBed.inject(Router).navigateByUrl('/')
    fixture.detectChanges()
    await fixture.whenStable()
    const compiled: HTMLElement = fixture.nativeElement
    expect(compiled.querySelector('#home-title')?.textContent).toContain(
      'Leonardo',
    )
  })
})
