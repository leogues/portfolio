import { Component, DestroyRef } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { HeaderComponent } from '../../header/header.component'
import { ArchitectureDiagramComponent } from './architecture-diagram.component'
import {
  DiagramFlow,
  INFRA_FLOWS,
  INFRA_NODES,
  STACK_GROUPS,
} from './infra.data'

@Component({
  selector: 'app-infra',
  standalone: true,
  imports: [HeaderComponent, ArchitectureDiagramComponent],
  templateUrl: './infra.component.html',
  styleUrl: './infra.component.scss',
})
export class InfraComponent {
  version: 1 | 2 = 2
  readonly flows = INFRA_FLOWS
  readonly stack = STACK_GROUPS
  flow = INFRA_FLOWS[0]
  selectedId = 'apps'

  constructor(
    private router: Router,
    route: ActivatedRoute,
    destroyRef: DestroyRef,
  ) {
    route.queryParamMap
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((params) => {
        this.version = params.get('v') === '1' ? 1 : 2
      })
  }

  get selectedNode() {
    return INFRA_NODES.find((node) => node.id === this.selectedId)!
  }
  get visibleNodes() {
    return this.flow.nodes.map(
      (position) => INFRA_NODES.find((node) => node.id === position.id)!,
    )
  }

  setVersion(version: 1 | 2): void {
    this.router.navigate([], {
      queryParams: { v: version === 1 ? '1' : null },
      queryParamsHandling: 'merge',
    })
  }

  setFlow(flow: DiagramFlow): void {
    this.flow = flow
    const defaults = {
      overview: 'apps',
      traffic: 'gateway',
      delivery: 'argo',
      telemetry: 'collector',
      platform: 'k3s',
    }
    this.selectedId = defaults[flow.id]
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % this.flows.length
    else if (event.key === 'ArrowLeft')
      next = (index + this.flows.length - 1) % this.flows.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = this.flows.length - 1
    else return
    event.preventDefault()
    this.setFlow(this.flows[next])
    document.getElementById(`flow-${this.flows[next].id}`)?.focus()
  }
}
