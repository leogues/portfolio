import { Component, Input } from '@angular/core'
import { HomeProject } from '../pages/home/home.data'

@Component({
  selector: 'app-project',
  standalone: true,
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  @Input({ required: true }) project!: HomeProject
}
