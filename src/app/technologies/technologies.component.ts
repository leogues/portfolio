import { Component } from '@angular/core'
import {
  ENGINEERING_PRACTICES,
  TECHNOLOGY_GROUPS,
} from '../pages/home/home.data'

@Component({
  selector: 'app-technologies',
  standalone: true,
  templateUrl: './technologies.component.html',
  styleUrl: './technologies.component.scss',
})
export class TechnologiesComponent {
  readonly groups = TECHNOLOGY_GROUPS
  readonly practices = ENGINEERING_PRACTICES
}
