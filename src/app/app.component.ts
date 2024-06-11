import { AfterViewInit, Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { HeaderComponent } from './header/header.component'
import { HeroComponent } from './hero/hero.component'
import { AboutComponent } from './about/about.component'
import { TechnologiesComponent } from './technologies/technologies.component'
import { ProjectsComponent } from './projects/projects.component'
import LocomotiveScroll from 'locomotive-scroll'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    TechnologiesComponent,
    ProjectsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'portfolio'

  private locomotiveScroll: LocomotiveScroll | undefined

  ngAfterViewInit() {
    this.locomotiveScroll = new LocomotiveScroll({
      lenisOptions: {
        content: document.querySelector(
          '[data-scroll-container]',
        ) as HTMLElement,
        duration: 1.8,
        smoothWheel: true,
      },
    })
  }

  ngOnDestroy() {
    if (this.locomotiveScroll) {
      this.locomotiveScroll.destroy()
    }
  }
}
