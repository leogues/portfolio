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

export interface ComponentSelection {
  id: string
  anchor?: DOMRect
}

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

function anchor(side: Side, offset = 0, gap = 8) {
  const direction = DIRECTIONS[side]
  return {
    name: side,
    args: {
      dx: direction.x * gap + (direction.y ? offset : 0),
      dy: direction.y * gap + (direction.x ? offset : 0),
    },
  }
}

function roundedRoute(points: { x: number; y: number }[], radius = 18): string {
  const route = points.filter(
    (point, index) =>
      index === 0 ||
      point.x !== points[index - 1].x ||
      point.y !== points[index - 1].y,
  )
  let path = `M ${route[0].x} ${route[0].y}`
  for (let i = 1; i < route.length - 1; i++) {
    const previous = route[i - 1],
      corner = route[i],
      next = route[i + 1]
    const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y)
    const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y)
    const r = Math.min(radius, incoming / 2, outgoing / 2)
    const entry = {
      x: corner.x + ((previous.x - corner.x) * r) / incoming,
      y: corner.y + ((previous.y - corner.y) * r) / incoming,
    }
    const exit = {
      x: corner.x + ((next.x - corner.x) * r) / outgoing,
      y: corner.y + ((next.y - corner.y) * r) / outgoing,
    }
    path += ` L ${entry.x} ${entry.y} Q ${corner.x} ${corner.y} ${exit.x} ${exit.y}`
  }
  const end = route[route.length - 1]
  return `${path} L ${end.x} ${end.y}`
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
  @Output() selected = new EventEmitter<ComponentSelection>()
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

  get diagramHeight(): number {
    return (
      Math.max(
        ...this.flow.lanes.map((lane) => lane.y + (lane.height || 190)),
      ) + 80
    )
  }

  constructor(private zone: NgZone) {}

  async ngAfterViewInit(): Promise<void> {
    try {
      const { Graph } = await import('@antv/x6')
      if (this.destroyed) return
      Graph.registerConnector(
        'portfolio-route',
        (
          start,
          end,
          _route,
          options: {
            raw?: boolean
            sourceSide?: Side
            targetSide?: Side
            channel?: number
          },
        ) => {
          const source = DIRECTIONS[options.sourceSide || 'right']
          const target = DIRECTIONS[options.targetSide || 'left']
          if (
            (start.x === end.x && source.y && target.y) ||
            (start.y === end.y && source.x && target.x)
          )
            return roundedRoute([start, end])
          let bends: { x: number; y: number }[]
          if (source.y && target.y) {
            const channel =
              options.channel ??
              (source.y === target.y
                ? source.y > 0
                  ? Math.max(start.y, end.y) + 84
                  : Math.min(start.y, end.y) - 84
                : (start.y + end.y) / 2)
            bends = [
              { x: start.x, y: channel },
              { x: end.x, y: channel },
            ]
          } else if (source.x && target.x) {
            const channel =
              options.channel ??
              (source.x === target.x
                ? source.x > 0
                  ? Math.max(start.x, end.x) + 84
                  : Math.min(start.x, end.x) - 84
                : (start.x + end.x) / 2)
            bends = [
              { x: channel, y: start.y },
              { x: channel, y: end.y },
            ]
          } else
            bends = source.y
              ? [{ x: start.x, y: end.y }]
              : [{ x: end.x, y: start.y }]
          return roundedRoute([start, ...bends, end])
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
            connectionPoint: { name: 'anchor' },
          },
          interacting: false,
          async: false,
        })
        this.graph.on('node:click', ({ node }) => {
          if (INFRA_NODES.some((item) => item.id === node.id))
            this.zone.run(() => this.selectComponent(node.id))
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
    const laneWidth = Math.max(...this.flow.nodes.map((node) => node.x)) + 312
    this.flow.lanes.forEach((lane, index) =>
      graph.addNode({
        id: `lane-${index}`,
        x: -20,
        y: lane.y,
        width: laneWidth,
        height: lane.height || 190,
        zIndex: 0,
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'text', selector: 'label' },
        ],
        attrs: {
          body: {
            width: '100%',
            height: '100%',
            rx: 18,
            fill: '#271c36',
            fillOpacity: 0.45,
            stroke: '#78608e',
            strokeOpacity: 0.28,
            strokeWidth: 1,
            pointerEvents: 'none',
          },
          label: {
            text: lane.label,
            x: 20,
            y: 24,
            refX: 0,
            refY: 0,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 1,
            fontFamily: 'Poppins, sans-serif',
            textAnchor: 'start',
            fill: '#bfadcf',
            pointerEvents: 'none',
            'data-lane-label': lane.label,
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
        width: 272,
        height: 100,
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
            y: 29,
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
            y: 49,
            fontSize: 14,
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
            y: 36,
            fontSize: 17,
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
            y: 64,
            fontSize: 13,
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
          anchor: anchor(edge.source || 'right', edge.sourceOffset, 4),
        },
        target: {
          cell: edge.to,
          anchor: anchor(edge.target || 'left', edge.targetOffset, 4),
        },
        connector: {
          name: 'portfolio-route',
          args: {
            sourceSide: edge.source || 'right',
            targetSide: edge.target || 'left',
            channel: edge.channel,
          },
        },
        attrs: {
          line: {
            stroke: COLORS[edge.tone],
            strokeWidth: 2,
            strokeOpacity: 0.82,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeDasharray: edge.dashed ? '5 7' : '',
            targetMarker: { name: 'block', width: 8, height: 8 },
          },
        },
        labels: edge.label
          ? [
              {
                position: {
                  distance: edge.labelPosition ?? 0.5,
                  offset: 0,
                },
                attrs: {
                  label: {
                    text: edge.label,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fill: COLORS[edge.tone],
                  },
                  body: {
                    ref: 'label',
                    refWidth: 12,
                    refHeight: 8,
                    refX: -6,
                    refY: -4,
                    fill: '#251b33',
                    stroke: COLORS[edge.tone],
                    strokeOpacity: 0.25,
                    strokeWidth: 1,
                    rx: 5,
                    ry: 5,
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
      const item = INFRA_NODES.find((item) => item.id === node.id)
      if (!item) return
      const active = node.id === this.selectedId
      node.attr('body/stroke', active ? COLORS[item.tone] : '#534260')
      node.attr('body/strokeWidth', active ? 1.8 : 1)
      node.attr('body/fill', active ? '#32253f' : '#261e34')
      node.attr('body/aria-pressed', String(active))
    })
    if (this.stage.nativeElement.clientWidth < 600) {
      const cell = this.graph?.getCellById(this.selectedId)
      if (cell) {
        this.graph?.zoomTo(Math.max(this.graph.zoom(), 1))
        this.graph?.centerCell(cell)
      }
    }
  }

  private selectComponent(id: string): void {
    const element = this.canvas.nativeElement.querySelector(
      `[data-node="${id}"]`,
    )
    this.selected.emit({ id, anchor: element?.getBoundingClientRect() })
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const id = (event.target as Element).getAttribute('data-node')
    if (id) {
      event.preventDefault()
      this.selectComponent(id)
    }
  }

  private scheduleFit(): void {
    cancelAnimationFrame(this.fitFrame)
    this.fitFrame = requestAnimationFrame(() => {
      if (this.stage.nativeElement.clientWidth < 600) {
        this.graph?.zoomTo(1)
        const cell = this.graph?.getCellById(this.selectedId)
        if (cell) this.graph?.centerCell(cell)
      } else this.fit()
    })
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
