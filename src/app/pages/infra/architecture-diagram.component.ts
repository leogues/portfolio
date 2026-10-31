import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import type { Graph } from '@antv/x6'
import { DiagramFlow, INFRA_NODES, Tone } from './infra.data'

const COLORS: Record<Tone, string> = {
  purple: '#b89aff',
  cyan: '#76cfe8',
  green: '#79d6b5',
  amber: '#edc488',
}

@Component({
  selector: 'app-architecture-diagram',
  standalone: true,
  templateUrl: './architecture-diagram.component.html',
  styleUrl: './architecture-diagram.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ArchitectureDiagramComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) flow!: DiagramFlow
  @Input() selectedId = 'apps'
  @Output() selected = new EventEmitter<string>()
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLDivElement>
  @ViewChild('stage', { static: true }) stage!: ElementRef<HTMLDivElement>
  @ViewChild('frame', { static: true }) frame!: ElementRef<HTMLDivElement>
  graph?: Graph
  zoom = 100
  loading = true
  failed = false
  private observer?: ResizeObserver
  private destroyed = false
  private fitFrame = 0

  constructor(private zone: NgZone) {}

  async ngAfterViewInit(): Promise<void> {
    try {
      const { Graph } = await import('@antv/x6')
      if (this.destroyed) return
      this.zone.runOutsideAngular(() => {
        this.graph = new Graph({
          container: this.canvas.nativeElement,
          width: this.stage.nativeElement.clientWidth,
          height: this.stage.nativeElement.clientHeight,
          background: { color: 'transparent' },
          panning: {
            enabled: true,
            eventTypes: ['leftMouseDown', 'mouseWheelDown'],
          },
          mousewheel: {
            enabled: true,
            modifiers: 'ctrl|meta',
            minScale: 0.25,
            maxScale: 1.8,
            zoomAtMousePosition: true,
          },
          scaling: { min: 0.25, max: 1.8 },
          interacting: false,
          async: false,
        })
        this.graph.on('node:click', ({ node }) => {
          if (INFRA_NODES.some((item) => item.id === node.id))
            this.zone.run(() => this.selected.emit(node.id))
        })
        this.graph.on('scale', ({ sx }) =>
          this.zone.run(() => {
            this.zoom = Math.round(sx * 100)
          }),
        )
        this.render()
        this.observer = new ResizeObserver(() => {
          this.graph?.resize(
            this.stage.nativeElement.clientWidth,
            this.stage.nativeElement.clientHeight,
          )
          this.scheduleFit()
        })
        this.observer.observe(this.stage.nativeElement)
      })
      this.loading = false
    } catch {
      this.loading = false
      this.failed = true
    }
  }

  ngOnChanges(): void {
    if (!this.graph) return
    this.zone.runOutsideAngular(() => {
      if (
        this.graph?.getCellById(this.flow.nodes[0].id) &&
        this.graph
          .getNodes()
          .filter((item) => item.getData()?.['component'])
          .map((item) => item.id)
          .join() === this.flow.nodes.map((item) => item.id).join()
      ) {
        this.updateSelection()
      } else {
        this.render()
      }
    })
  }

  private render(): void {
    const graph = this.graph
    if (!graph) return
    graph.clearCells()
    this.flow.lanes.forEach((lane, index) =>
      graph.addNode({
        id: `lane-${index}`,
        x: -20,
        y: lane.y - 4,
        width: lane.width + 40,
        height: 162,
        zIndex: 0,
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'text', selector: 'label' },
        ],
        attrs: {
          body: {
            width: '100%',
            height: '100%',
            rx: 16,
            fill: '#21192f',
            fillOpacity: 0.55,
            stroke: '#382c48',
            strokeOpacity: 0.6,
          },
          label: {
            text: lane.label,
            x: 20,
            y: 21,
            fontSize: 10,
            fontWeight: 500,
            fontFamily: 'Poppins, sans-serif',
            refX: 0,
            refY: 0,
            letterSpacing: 1.9,
            fill: '#9a8caa',
            textAnchor: 'start',
          },
        },
      }),
    )
    this.flow.nodes.forEach((position) => {
      const item = INFRA_NODES.find((node) => node.id === position.id)!
      const color = COLORS[item.tone]
      graph.addNode({
        id: item.id,
        x: position.x,
        y: position.y,
        width: 200,
        height: 96,
        zIndex: 2,
        data: { component: true },
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'rect', selector: 'iconBg' },
          { tagName: 'text', selector: 'icon' },
          { tagName: 'circle', selector: 'dot' },
          { tagName: 'text', selector: 'title' },
          { tagName: 'text', selector: 'subtitle' },
        ],
        attrs: {
          body: {
            width: '100%',
            height: '100%',
            rx: 12,
            fill: '#292036',
            stroke: '#4a3a5d',
            strokeWidth: 1,
            cursor: 'pointer',
            tabindex: 0,
            role: 'button',
            'aria-label': `${item.name}: ${item.subtitle}. Ver detalhes`,
            'data-node': item.id,
          },
          iconBg: {
            x: 13,
            y: 12,
            width: 32,
            height: 28,
            rx: 8,
            stroke: 'none',
            fill: color,
            fillOpacity: 0.11,
            pointerEvents: 'none',
          },
          icon: {
            text: item.mark,
            x: 29,
            y: 26,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'Poppins, sans-serif',
            refX: 0,
            refY: 0,
            textAnchor: 'middle',
            fill: color,
            pointerEvents: 'none',
          },
          dot: {
            cx: 182,
            cy: 26,
            r: 3,
            fill: color,
            opacity: 0.7,
            pointerEvents: 'none',
          },
          title: {
            text: item.name,
            x: 13,
            y: 61,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'Poppins, sans-serif',
            refX: 0,
            refY: 0,
            textAnchor: 'start',
            fill: '#f4eefb',
            pointerEvents: 'none',
          },
          subtitle: {
            text: item.subtitle,
            x: 13,
            y: 80,
            fontSize: 9,
            fontFamily: 'Poppins, sans-serif',
            refX: 0,
            refY: 0,
            textAnchor: 'start',
            fill: '#b6a6c5',
            pointerEvents: 'none',
          },
        },
      })
    })
    this.flow.edges.forEach((edge, index) =>
      graph.addEdge({
        id: `edge-${index}`,
        zIndex: 1,
        source: { cell: edge.from, anchor: { name: edge.source || 'right' } },
        target: { cell: edge.to, anchor: { name: edge.target || 'left' } },
        vertices: edge.vertices,
        router: edge.vertices
          ? undefined
          : { name: 'orth', args: { padding: 20 } },
        connector: { name: 'rounded', args: { radius: 12 } },
        attrs: {
          line: {
            stroke: COLORS[edge.tone],
            strokeWidth: 1.4,
            strokeOpacity: 0.65,
            strokeDasharray: edge.dashed ? '5 5' : '',
            targetMarker: { name: 'block', width: 6, height: 5 },
          },
        },
        labels: edge.label
          ? [
              {
                position: 0.5,
                attrs: {
                  label: {
                    text: edge.label,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 9,
                    fill: COLORS[edge.tone],
                  },
                  body: {
                    fill: '#1b1428',
                    stroke: '#1b1428',
                    strokeWidth: 5,
                    rx: 3,
                  },
                },
              },
            ]
          : [],
      }),
    )
    this.updateSelection()
    this.scheduleFit()
  }

  private updateSelection(): void {
    this.graph?.getNodes().forEach((node) => {
      if (!node.getData()?.['component']) return
      const item = INFRA_NODES.find((item) => item.id === node.id)!
      const active = node.id === this.selectedId
      node.attr('body/stroke', active ? COLORS[item.tone] : '#4a3a5d')
      node.attr('body/strokeWidth', active ? 2 : 1)
      node.attr('body/fill', active ? '#342747' : '#292036')
      node.attr('body/aria-pressed', String(active))
    })
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const id = (event.target as Element).getAttribute('data-node')
    if (id) {
      event.preventDefault()
      this.selected.emit(id)
    }
  }

  private scheduleFit(): void {
    cancelAnimationFrame(this.fitFrame)
    this.fitFrame = requestAnimationFrame(() => this.fit())
  }

  fit(): void {
    this.graph?.zoomToFit({
      padding: this.stage.nativeElement.clientWidth < 600 ? 16 : 32,
      maxScale: 1,
    })
  }

  changeZoom(direction: number): void {
    this.graph?.zoom(direction * 0.15, { minScale: 0.25, maxScale: 1.8 })
  }

  async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await this.frame.nativeElement.requestFullscreen()
    } catch {
      /* The diagram remains usable when fullscreen is unavailable. */
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.fitFrame)
    this.observer?.disconnect()
    this.graph?.dispose()
  }
}
