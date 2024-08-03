import { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'infra',
    loadChildren: () =>
      import('./pages/infra/infra.routes').then((m) => m.INFRA_ROUTES),
  },
]
