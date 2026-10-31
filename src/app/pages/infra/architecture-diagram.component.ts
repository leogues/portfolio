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
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import type { Graph } from '@antv/x6'
import { DiagramEdge, DiagramFlow, INFRA_NODES, Tone } from './infra.data'

type Side = NonNullable<DiagramEdge['source']>
const COLORS: Record<Tone, string> = {
  purple: '#b89aff',
  cyan: '#76cfe8',
  green: '#79d6b5',
  amber: '#edc488',
}
const DIRECTIONS: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function anchor(side: Side, offset = 0) {
  return {
    name: side,
    args: side === 'top' || side === 'bottom' ? { dx: offset } : { dy: offset },
  }
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
  private graph?: Graph
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
      Graph.registerConnector(
        'portfolio-curve',
        (
          start,
          end,
          _route,
          options: { raw?: boolean; sourceSide?: Side; targetSide?: Side },
        ) => {
          const source = DIRECTIONS[options.sourceSide || 'right']
          const target = DIRECTIONS[options.targetSide || 'left']
          const distance = Math.min(
            160,
            Math.max(45, Math.hypot(end.x - start.x, end.y - start.y) * 0.45),
          )
          return `M ${start.x} ${start.y} C ${start.x + source.x * distance} ${start.y + source.y * distance}, ${end.x + target.x * distance} ${end.y + target.y * distance}, ${end.x} ${end.y}`
        },
        true,
      )
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
            minScale: 0.2,
            maxScale: 1.8,
            zoomAtMousePosition: true,
          },
          scaling: { min: 0.2, max: 1.8 },
          connecting: {
            connectionPoint: { name: 'boundary', args: { offset: 6 } },
          },
          interacting: false,
          async: false,
        })
        this.graph.on('node:click', ({ node }) =>
          this.zone.run(() => this.selected.emit(node.id)),
        )
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

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.graph) return
    this.zone.runOutsideAngular(() => {
      if (changes['flow']) this.render()
      else this.updateSelection()
    })
  }

  private render(): void {
    const graph = this.graph
    if (!graph) return
    graph.clearCells()
    this.flow.nodes.forEach((position) => {
      const item = INFRA_NODES.find((node) => node.id === position.id)!
      const color = COLORS[item.tone]
      graph.addNode({
        id: item.id,
        x: position.x,
        y: position.y,
        width: 224,
        height: 88,
        zIndex: 2,
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'rect', selector: 'iconBg' },
          { tagName: 'text', selector: 'icon' },
          { tagName: 'text', selector: 'title' },
          { tagName: 'text', selector: 'subtitle' },
        ],
        attrs: {
          body: {
            width: '100%',
            height: '100%',
            rx: 16,
            fill: '#261e34',
            stroke: '#534260',
            strokeWidth: 1,
            cursor: 'pointer',
            tabindex: 0,
            role: 'button',
            'aria-label': `${item.name}: ${item.subtitle}. Ver detalhes`,
            'data-node': item.id,
          },
          iconBg: {
            x: 14,
            y: 23,
            width: 36,
            height: 40,
            rx: 11,
            stroke: 'none',
            fill: color,
            fillOpacity: 0.09,
            pointerEvents: 'none',
          },
          icon: {
            text: item.mark,
            x: 32,
            y: 43,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'Poppins, sans-serif',
            refX: 0,
            refY: 0,
            textAnchor: 'middle',
            fill: color,
            pointerEvents: 'none',
          },
          title: {
            text: item.name,
            x: 64,
            y: 32,
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
            x: 64,
            y: 54,
            fontSize: 10,
            fontFamily: 'Poppins, sans-serif',
            refX: 0,
            refY: 0,
            textAnchor: 'start',
            fill: '#bbaacb',
            pointerEvents: 'none',
          },
        },
      })
    })
    this.flow.edges.forEach((edge, index) =>
      graph.addEdge({
        id: `edge-${index}`,
        zIndex: 1,
        source: {
          cell: edge.from,
          anchor: anchor(edge.source || 'right', edge.sourceOffset),
        },
        target: {
          cell: edge.to,
          anchor: anchor(edge.target || 'left', edge.targetOffset),
        },
        connector: {
          name: 'portfolio-curve',
          args: {
            sourceSide: edge.source || 'right',
            targetSide: edge.target || 'left',
          },
        },
        attrs: {
          line: {
            stroke: COLORS[edge.tone],
            strokeWidth: 1.7,
            strokeOpacity: 0.7,
            strokeDasharray: edge.dashed ? '4 6' : '',
            targetMarker: { name: 'block', width: 7, height: 6 },
          },
        },
        labels: edge.label
          ? [
              {
                position: {
                  distance: edge.labelPosition ?? 0.5,
                  offset: edge.labelOffset ?? -16,
                },
                attrs: {
                  label: {
                    text: edge.label,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 10,
                    fill: COLORS[edge.tone],
                  },
                  body: {
                    fill: '#1b1428',
                    stroke: '#1b1428',
                    strokeWidth: 6,
                    rx: 4,
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
      const item = INFRA_NODES.find((item) => item.id === node.id)!
      const active = node.id === this.selectedId
      node.attr('body/stroke', active ? COLORS[item.tone] : '#534260')
      node.attr('body/strokeWidth', active ? 1.8 : 1)
      node.attr('body/fill', active ? '#32253f' : '#261e34')
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
      padding: this.stage.nativeElement.clientWidth < 600 ? 20 : 50,
      maxScale: 1,
    })
  }

  changeZoom(direction: number): void {
    this.graph?.zoom(direction * 0.15, { minScale: 0.2, maxScale: 1.8 })
  }

  async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await this.frame.nativeElement.requestFullscreen()
    } catch {
      /* Fullscreen availability depends on the browser. */
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.fitFrame)
    this.observer?.disconnect()
    this.graph?.dispose()
  }
}
