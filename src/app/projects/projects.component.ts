import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ProjectComponent } from '../project/project.component'
import { HOME_PROJECTS } from '../pages/home/home.data'

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ProjectComponent, RouterLink],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  readonly projects = HOME_PROJECTS
}
