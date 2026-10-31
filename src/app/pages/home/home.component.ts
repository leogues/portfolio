import { Component } from '@angular/core'
import { HeaderComponent } from '../../header/header.component'
import { HeroComponent } from '../../hero/hero.component'
import { AboutComponent } from '../../about/about.component'
import { TechnologiesComponent } from '../../technologies/technologies.component'
import { ProjectsComponent } from '../../projects/projects.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    TechnologiesComponent,
    ProjectsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
