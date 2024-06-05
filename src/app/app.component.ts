import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { HeaderComponent } from './header/header.component'
import { HeroComponent } from './hero/hero.component'
import { AboutComponent } from './about/about.component'
import { TechnologiesComponent } from './technologies/technologies.component'
import { ProjectsComponent } from './projects/projects.component'

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
export class AppComponent {
  title = 'portfolio'
}
