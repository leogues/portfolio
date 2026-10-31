export type HomeTone = 'purple' | 'cyan' | 'green' | 'amber'

export interface TechnologyGroup {
  number: string
  title: string
  mark: string
  tone: HomeTone
  description: string
  tools: string[]
}

export const TECHNOLOGY_GROUPS: TechnologyGroup[] = [
  {
    number: '01',
    title: 'Back-end & linguagens',
    mark: '</>',
    tone: 'cyan',
    description:
      'Serviços, APIs e integrações com responsabilidades e contratos claros.',
    tools: ['Go', 'Node.js', 'TypeScript', 'Python'],
  },
  {
    number: '02',
    title: 'Dados & processamento',
    mark: '↗',
    tone: 'green',
    description: 'Ingestão, orquestração e processamento contínuo e em lotes.',
    tools: ['Kafka', 'ClickHouse', 'Dagster', 'CDC'],
  },
  {
    number: '03',
    title: 'Bancos & persistência',
    mark: 'DB',
    tone: 'amber',
    description: 'Modelagem, consultas, armazenamento e operação dos dados.',
    tools: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Memorystore',
      'CloudNativePG',
      'Longhorn',
      'ClickHouse',
    ],
  },
  {
    number: '04',
    title: 'Cloud & infraestrutura',
    mark: '☁',
    tone: 'purple',
    description:
      'Ambientes em nuvem, orquestração e infraestrutura versionada.',
    tools: [
      'AWS',
      'GCP',
      'GKE',
      'EKS',
      'Oracle Cloud',
      'Kubernetes',
      'K3s',
      'Terraform',
      'OpenTofu',
      'Terragrunt',
      'Helm',
      'HCP Terraform',
      'Cloud Init',
    ],
  },
  {
    number: '05',
    title: 'GitOps & plataforma',
    mark: 'git',
    tone: 'purple',
    description:
      'Entrega contínua, configuração, acesso e automação da plataforma.',
    tools: [
      'Argo CD',
      'Image Updater',
      'GitHub Actions',
      'SOPS',
      'age',
      'Gateway API',
      'NGINX Gateway Fabric',
      'Cert Manager',
      'External DNS',
      'Cloudflare WARP',
      'Cloudflare Tunnel',
      'OCI Cloud Controller',
    ],
  },
  {
    number: '06',
    title: 'Observabilidade',
    mark: '◎',
    tone: 'green',
    description:
      'Contexto para investigar falhas, capacidade e gargalos em produção.',
    tools: [
      'OpenTelemetry',
      'OTel Collector',
      'Grafana',
      'Prometheus',
      'Loki',
      'Tempo',
      'Mimir',
      'PromQL',
      'kube-state-metrics',
      'cAdvisor',
    ],
  },
]

export const ENGINEERING_PRACTICES = [
  'Clean Architecture',
  'DDD',
  'TDD',
  'Testes de integração e contrato',
  'Profiling',
  'Testes de carga',
  'Idempotência e consistência',
]

export const WORK_RESULTS = [
  {
    value: '~90%',
    title: 'Menos memória no Redis',
    detail: 'De 50 GB para 5,5 GB com compressão de dados.',
    tone: 'purple',
  },
  {
    value: 'até ~60×',
    title: 'Consultas analíticas mais rápidas',
    detail: 'Com ClickHouse, em comparação ao MySQL.',
    tone: 'green',
  },
  {
    value: '~700 mil/s',
    title: 'Registros migrados por segundo',
    detail: 'Ferramenta em Go para migrar bilhões de registros.',
    tone: 'cyan',
  },
  {
    value: '~95%',
    title: 'Menos armazenamento analítico',
    detail: 'De 18,1 TB para 910 GB com ClickHouse.',
    tone: 'amber',
  },
  {
    value: 'até 30%',
    title: 'FinOps · Quick wins',
    detail: 'Redução dos gastos totais com otimizações pontuais.',
    tone: 'green',
  },
]

export interface HomeProject {
  id: string
  number: string
  title: string
  category: string
  description: string
  picture: string
  pictureAlt: string
  github: string
  demo: string
  tools: string[]
  tone: HomeTone
}

export const HOME_PROJECTS: HomeProject[] = [
  {
    id: 'music-hub',
    number: '01',
    title: 'MusicHub',
    category: 'Go · APIs & integrações',
    description:
      'Autenticação e integração com o Spotify em uma API Go, com persistência em PostgreSQL e telemetria para acompanhar as requisições.',
    picture: './assets/musichub.png',
    pictureAlt: 'Interface do projeto MusicHub',
    github: 'https://github.com/leogues/MusicHub',
    demo: 'https://music.leogues.com/',
    tools: ['Go', 'PostgreSQL', 'OAuth', 'Spotify API', 'OpenTelemetry'],
    tone: 'cyan',
  },
  {
    id: 'live-link',
    number: '02',
    title: 'LiveLink',
    category: 'Node.js · Serviços & dados',
    description:
      'Uma aplicação para conectar pessoas em salas online, com autenticação, API Node.js e persistência em PostgreSQL.',
    picture: './assets/video-call-app.png',
    pictureAlt: 'Interface do projeto LiveLink',
    github: 'https://github.com/leogues/project-webrtc',
    demo: 'https://live.leogues.com/login',
    tools: ['Node.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'OpenTelemetry'],
    tone: 'purple',
  },
]
