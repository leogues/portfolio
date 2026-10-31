import { Component, EventEmitter, Output } from '@angular/core'

@Component({
  selector: 'app-legacy-infra',
  standalone: true,
  templateUrl: './legacy-infra.component.html',
  styleUrl: './legacy-infra.component.scss',
})
export class LegacyInfraComponent {
  @Output() explore = new EventEmitter<MouseEvent>()
}
