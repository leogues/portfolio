import { Component } from '@angular/core'
import { ProjectComponent } from '../project/project.component'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ProjectComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  handleSave = () => {
    console.log('handleSave')
  }

  handleCancel = () => {
    console.log('handleCancel')
  }
}
