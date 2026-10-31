import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { LegacyInfraComponent } from './legacy-infra.component'
import { HeaderComponent } from '../../header/header.component'
import { ArchitectureDiagramComponent } from './architecture-diagram.component'
import { DiagramFlow, INFRA_FLOWS, INFRA_NODES } from './infra.data'

@Component({
  selector: 'app-infra',
  standalone: true,
  imports: [
    HeaderComponent,
    ArchitectureDiagramComponent,
    NgTemplateOutlet,
    LegacyInfraComponent,
  ],
  templateUrl: './infra.component.html',
  styleUrl: './infra.component.scss',
})
export class InfraComponent {
  version: 1 | 2 = 2
  readonly flows = INFRA_FLOWS
  flow = INFRA_FLOWS[0]
  selectedId = 'apps'
  @ViewChild('componentDialog') componentDialog?: ElementRef<HTMLDialogElement>
  @ViewChild('componentPopover') componentPopover?: ElementRef<HTMLDivElement>
  private popoverScroll = { x: 0, y: 0 }
  private previousBodyOverflow: string | null = null

  constructor(
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    route: ActivatedRoute,
    destroyRef: DestroyRef,
  ) {
    route.queryParamMap
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((params) => {
        this.closeComponent()
        this.version = params.get('v') === '1' ? 1 : 2
      })
    destroyRef.onDestroy(() => this.onDialogClosed())
  }

  get selectedNode() {
    return INFRA_NODES.find((node) => node.id === this.selectedId)!
  }
  get visibleNodes() {
    return this.flow.nodes.map(
      (position) => INFRA_NODES.find((node) => node.id === position.id)!,
    )
  }

  openComponent(id: string, anchor?: DOMRect): void {
    this.selectedId = id
    this.changeDetector.detectChanges()
    if (window.matchMedia('(max-width: 700px)').matches) {
      const dialog = this.componentDialog?.nativeElement
      if (dialog && !dialog.open) {
        this.previousBodyOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        dialog.showModal()
      }
      return
    }
    const popover = this.componentPopover?.nativeElement
    if (!popover) return
    if (!popover.matches(':popover-open')) {
      popover.style.left = '16px'
      popover.style.top = '96px'
      popover.showPopover()
    }
    this.positionPopover(popover, anchor)
    popover
      .querySelector<HTMLButtonElement>('button')
      ?.focus({ preventScroll: true })
    this.popoverScroll = { x: window.scrollX, y: window.scrollY }
  }

  openFromList(id: string, event: MouseEvent): void {
    const element = event.currentTarget
    this.openComponent(
      id,
      element instanceof HTMLElement
        ? element.getBoundingClientRect()
        : undefined,
    )
  }

  private positionPopover(popover: HTMLElement, anchor?: DOMRect): void {
    const gap = 16,
      padding = 16
    const width = popover.offsetWidth,
      height = popover.offsetHeight
    const clamp = (value: number, maximum: number) =>
      Math.max(padding, Math.min(value, maximum - padding))
    const origin =
      anchor || new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0)
    let left: number, top: number
    if (origin.right + gap + width <= window.innerWidth - padding) {
      left = origin.right + gap
      top = clamp(
        origin.top + origin.height / 2 - height / 2,
        window.innerHeight - height,
      )
    } else if (origin.left - gap - width >= padding) {
      left = origin.left - gap - width
      top = clamp(
        origin.top + origin.height / 2 - height / 2,
        window.innerHeight - height,
      )
    } else {
      left = clamp(
        origin.left + origin.width / 2 - width / 2,
        window.innerWidth - width,
      )
      top =
        origin.bottom + gap + height <= window.innerHeight - padding
          ? origin.bottom + gap
          : clamp(origin.top - gap - height, window.innerHeight - height)
    }
    popover.style.left = `${Math.round(left)}px`
    popover.style.top = `${Math.round(top)}px`
  }

  closeComponent(): void {
    this.closePopover()
    this.componentDialog?.nativeElement.close()
    this.onDialogClosed()
  }

  @HostListener('window:scroll')
  onPageScroll(): void {
    if (
      window.scrollX !== this.popoverScroll.x ||
      window.scrollY !== this.popoverScroll.y
    )
      this.closePopover()
  }

  @HostListener('window:resize')
  closePopover(): void {
    const popover = this.componentPopover?.nativeElement
    if (popover?.matches(':popover-open')) popover.hidePopover()
  }

  onDialogClosed(): void {
    if (this.previousBodyOverflow !== null) {
      document.body.style.overflow = this.previousBodyOverflow
      this.previousBodyOverflow = null
    }
  }

  closeOnBackdrop(event: MouseEvent): void {
    const dialog = this.componentDialog?.nativeElement
    if (!dialog || event.target !== dialog) return
    const bounds = dialog.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      this.closeComponent()
  }

  exploreArchitecture(event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    document.getElementById('architecture')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    })
  }

  setVersion(version: 1 | 2): void {
    this.router.navigate([], {
      queryParams: { v: version === 1 ? '1' : null },
      queryParamsHandling: 'merge',
    })
  }

  setFlow(flow: DiagramFlow): void {
    this.closeComponent()
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
