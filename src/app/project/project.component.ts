import { Component, Input } from '@angular/core'
import { CommonModule, NgOptimizedImage } from '@angular/common'

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  @Input() handleSave?: () => void
  @Input() handleCancel?: () => void
  @Input({ required: true, alias: 'ngClass' }) customClass!:
    | string
    | string[]
    | Set<string>
    | { [klass: string]: any }
}
