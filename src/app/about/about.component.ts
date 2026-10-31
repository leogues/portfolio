import { Component } from '@angular/core'
import { WORK_RESULTS } from '../pages/home/home.data'

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly results = WORK_RESULTS
}
