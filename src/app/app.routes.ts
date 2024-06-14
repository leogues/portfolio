import { Routes } from '@angular/router'
import { HomeComponent } from './pages/home/home.component'
import { InfraComponent } from './pages/infra/infra.component'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'infra', component: InfraComponent },
]
