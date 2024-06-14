import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AboutComponent } from '../../about/about.component'
import { HeaderComponent } from '../../header/header.component'
import { HeroComponent } from '../../hero/hero.component'
import { TechnologiesComponent } from '../../technologies/technologies.component'
import { ProjectsComponent } from '../../projects/projects.component'
import LocomotiveScroll from 'locomotive-scroll'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    TechnologiesComponent,
    ProjectsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
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
