export type FlowId =
  | 'overview'
  | 'traffic'
  | 'delivery'
  | 'telemetry'
  | 'platform'
export type Tone = 'purple' | 'cyan' | 'green' | 'amber'

export interface InfraNode {
  id: string
  name: string
  subtitle: string
  mark: string
  tone: Tone
  category: string
  description: string
  facts: string[]
}

export interface DiagramEdge {
  from: string
  to: string
  label?: string
  tone: Tone
  dashed?: boolean
  source?: 'top' | 'bottom' | 'left' | 'right'
  target?: 'top' | 'bottom' | 'left' | 'right'
  vertices?: { x: number; y: number }[]
}

export interface DiagramFlow {
  id: FlowId
  label: string
  number: string
  title: string
  description: string
  nodes: { id: string; x: number; y: number }[]
  edges: DiagramEdge[]
  lanes: { label: string; y: number; width: number }[]
  steps: { title: string; text: string }[]
}

function node(
  id: string,
  name: string,
  subtitle: string,
  mark: string,
  tone: Tone,
  category: string,
  description: string,
  facts: string[],
): InfraNode {
  return { id, name, subtitle, mark, tone, category, description, facts }
}

export const INFRA_NODES: InfraNode[] = [
  node(
    'visitors',
    'Navegadores',
    'Web · HTTPS',
    '↗',
    'cyan',
    'Acesso público',
    'O ponto de entrada dos três produtos. Os navegadores carregam os frontends e conversam com as APIs por HTTPS, usando os domínios de cada aplicação.',
    ['leogues.com', 'music.leogues.com', 'live.leogues.com'],
  ),
  node(
    'cloudflare',
    'Cloudflare',
    'DNS + proxy de borda',
    'CF',
    'cyan',
    'Borda',
    'Os domínios passam pelo proxy da Cloudflare antes de chegar à infraestrutura Oracle. O external-dns mantém os registros alinhados às rotas do Kubernetes.',
    ['DNS com proxy', 'Entrada HTTP/HTTPS', 'Registros via external-dns'],
  ),
  node(
    'nlb',
    'Oracle NLB',
    'Network Load Balancer',
    'LB',
    'cyan',
    'Rede',
    'O balanceador público encaminha o tráfego para o gateway no nó privado. O OCI Cloud Controller Manager integra o Service do Kubernetes ao load balancer da Oracle.',
    ['Portas 80 / 443', 'OCI Cloud Controller Manager', 'Nó sem IP público'],
  ),
  node(
    'gateway',
    'NGINX Gateway',
    'Gateway API · HTTPRoutes',
    'NG',
    'cyan',
    'Roteamento',
    'O NGINX Gateway Fabric recebe as conexões e distribui as requisições por domínio e caminho. Os certificados TLS são gerenciados pelo cert-manager.',
    ['Kubernetes Gateway API', 'Rotas / e /api/', 'TLS com cert-manager'],
  ),
  node(
    'apps',
    'Aplicações',
    '3 frontends · 2 backends',
    '</>',
    'cyan',
    'Workloads',
    'Portfolio, MusicHub e LiveLink compartilham o cluster. Os frontends são servidos pelo NGINX; as APIs Go e Node.js usam PostgreSQL e exportam telemetria via OTLP.',
    [
      'Portfolio · Angular',
      'MusicHub · Angular + Go',
      'LiveLink · React + Node.js',
    ],
  ),
  node(
    'frontends',
    'Frontends',
    'Angular · React · NGINX',
    'UI',
    'cyan',
    'Interface',
    'O Portfolio e o MusicHub usam Angular. O LiveLink usa React com Vite. Os builds estáticos são entregues por containers NGINX e acessam as APIs pelo mesmo domínio de cada produto.',
    [
      'Portfolio e MusicHub: Angular',
      'LiveLink: React + Vite',
      'Assets estáticos via NGINX',
    ],
  ),
  node(
    'go',
    'MusicHub API',
    'Go · Gin · OpenTelemetry',
    'Go',
    'cyan',
    'Backend · production',
    'A API do MusicHub implementa os endpoints em Go com Gin, integra Google OAuth e Spotify e acessa seu schema no PostgreSQL. Logs, traces e métricas saem diretamente pelo SDK OpenTelemetry.',
    [
      'HTTP e SQL instrumentados',
      'Schema musichub',
      'Google OAuth + Spotify API',
    ],
  ),
  node(
    'node',
    'LiveLink API',
    'Node.js · Express · Prisma',
    'JS',
    'cyan',
    'Backend · production',
    'A API do LiveLink usa Node.js com Express, Prisma e PostgreSQL. A aplicação integra autenticação e exporta logs, traces e métricas pelo OpenTelemetry, com contexto das requisições HTTP e consultas SQL.',
    ['Node.js + Express', 'Prisma + PostgreSQL', 'OpenTelemetry SDK'],
  ),
  node(
    'oauth',
    'APIs externas',
    'Google OAuth · Spotify',
    '↗',
    'amber',
    'Integrações',
    'O Google participa da autenticação dos produtos. O MusicHub também consome a API do Spotify. São dependências externas ao cluster, acessadas pelas aplicações.',
    [
      'Google: autenticação',
      'Spotify: integração musical',
      'Chamadas HTTP de saída',
    ],
  ),
  node(
    'postgres',
    'PostgreSQL',
    'CloudNativePG · 2 schemas',
    'PG',
    'amber',
    'Persistência',
    'Um cluster PostgreSQL gerenciado pelo operador CloudNativePG atende as duas APIs. Os dados de cada produto ficam separados por schema, com armazenamento persistente fornecido pelo Longhorn.',
    [
      'PostgreSQL 16',
      'CloudNativePG + Longhorn',
      'Schemas separados por produto',
    ],
  ),
  node(
    'github',
    'GitHub Actions',
    'Checks + build multiarch',
    'GH',
    'purple',
    'Integração contínua',
    'Os pushes nos repositórios disparam os pipelines. As APIs passam por testes e verificações de dependências; as imagens são construídas para amd64 e arm64 antes da publicação no Docker Hub.',
    [
      'Testes das aplicações',
      'govulncheck / npm audit nas APIs',
      'Build amd64 + arm64',
    ],
  ),
  node(
    'registry',
    'Docker Hub',
    'Imagens com tags de versão',
    'DH',
    'purple',
    'Registry',
    'As imagens dos produtos são publicadas no Docker Hub. O número da execução do pipeline fornece uma tag versionada que pode ser registrada no GitOps e implantada no cluster ARM64.',
    ['Imagens por aplicação', 'Tags por execução', 'Compatível com ARM64'],
  ),
  node(
    'updater',
    'Image Updater',
    'Nova imagem → commit no Git',
    '↑',
    'purple',
    'Automação de entrega',
    'O Argo CD Image Updater acompanha as tags no registry e registra a versão escolhida no repositório oracle-gitops. A alteração passa a fazer parte do estado desejado versionado.',
    ['Argo CD Image Updater', 'Write-back no Git', 'Histórico das versões'],
  ),
  node(
    'gitops',
    'oracle-gitops',
    'Helm · manifests · valores',
    'git',
    'purple',
    'Estado desejado',
    'O repositório GitOps reúne os charts, valores e configurações das aplicações e da plataforma. Ele é a referência usada pelo Argo CD para reconciliar o Kubernetes.',
    [
      'Charts e values Helm',
      'Configuração da plataforma',
      'Histórico de mudanças no Git',
    ],
  ),
  node(
    'argo',
    'Argo CD',
    'Reconciliação + rollout',
    'CD',
    'purple',
    'Entrega contínua',
    'O Argo CD compara o estado do Git com o cluster e aplica as mudanças. Atualizações de imagens percorrem o mesmo fluxo de reconciliação usado pela configuração da plataforma.',
    ['Git → Kubernetes', 'Aplicações e plataforma', 'Rollout dos workloads'],
  ),
  node(
    'terraform',
    'Terraform',
    'Infraestrutura como código',
    'TF',
    'purple',
    'Provisionamento',
    'O projeto oracle-infra provisiona os recursos OCI e prepara a base do K3s com cloud-init. O estado remoto fica no HCP Terraform; a configuração dos workloads segue pelo Argo CD.',
    [
      'OCI: rede e compute',
      'Bootstrap com cloud-init',
      'Estado remoto no HCP Terraform',
    ],
  ),
  node(
    'oci',
    'Oracle Cloud',
    'Ampere A1 · ARM64',
    'OCI',
    'purple',
    'Infraestrutura',
    'A infraestrutura roda em uma instância Ampere A1 da OCI, em subnet privada e sem IP público no nó. A rede conecta os produtos, o armazenamento e os serviços da plataforma na OCI.',
    ['2 OCPUs · 12 GB RAM', 'Boot volume de 100 GB', 'Ubuntu 24.04 LTS'],
  ),
  node(
    'k3s',
    'K3s',
    'Kubernetes · ARM64',
    'K3s',
    'purple',
    'Orquestração',
    'O K3s executa os produtos e os componentes da plataforma em ARM64. CoreDNS e metrics-server completam os serviços básicos; os HPAs das aplicações ajustam a quantidade de pods conforme as métricas.',
    ['Kubernetes em ARM64', 'CoreDNS + metrics-server', 'HPA dos workloads'],
  ),
  node(
    'longhorn',
    'Longhorn',
    'Volumes persistentes · CSI',
    'LH',
    'amber',
    'Armazenamento',
    'O Longhorn fornece os volumes usados pelo PostgreSQL e pela observabilidade. O gerenciamento via CSI integra o armazenamento ao ciclo de vida dos serviços no Kubernetes.',
    [
      'CSI para volumes Kubernetes',
      'Persistência dos serviços',
      'PostgreSQL · ClickHouse · Grafana',
    ],
  ),
  node(
    'tls',
    'TLS + DNS',
    'cert-manager · external-dns',
    'TLS',
    'cyan',
    'Automação de borda',
    'O cert-manager emite certificados Let’s Encrypt com validação DNS-01 pela Cloudflare. O external-dns observa as HTTPRoutes e reconcilia os registros DNS com proxy habilitado.',
    [
      'Let’s Encrypt / ACME',
      'DNS-01 na Cloudflare',
      'HTTPRoutes → registros DNS',
    ],
  ),
  node(
    'warp',
    'Cloudflare WARP',
    'Acesso administrativo',
    'W',
    'purple',
    'Acesso privado',
    'O acesso administrativo usa WARP e Cloudflare Tunnel para alcançar a rede privada. SSH e a API Kubernetes não dependem de um IP público no nó.',
    [
      'WARP → Cloudflare Tunnel',
      'SSH e Kubernetes API privados',
      'cloudflared na rede OCI',
    ],
  ),
  node(
    'secrets',
    'SOPS + age',
    'Secrets criptografados',
    'S',
    'purple',
    'Configuração sensível',
    'Os segredos do provisionamento são protegidos com SOPS e age e chegam às aplicações como Kubernetes Secrets. As credenciais são entregues aos workloads pela configuração da plataforma.',
    [
      'Criptografia com age',
      'Integração no provisionamento',
      'Kubernetes Secrets',
    ],
  ),
  node(
    'infra',
    'Sinais do cluster',
    'Host · kubelet · workloads',
    'K8s',
    'green',
    'Telemetria da plataforma',
    'A coleta cobre o host, kubelet/cAdvisor, kube-state-metrics, endpoints de infraestrutura e logs de containers da plataforma. As APIs enviam seus logs por OTLP para evitar coleta duplicada.',
    [
      'Hostmetrics + kubelet/cAdvisor',
      'kube-state-metrics + scrape',
      'Filelog da infraestrutura',
    ],
  ),
  node(
    'metadata',
    'Contexto Kubernetes',
    'Serviço · namespace · pod',
    '{ }',
    'green',
    'Enriquecimento automático',
    'O Collector associa a telemetria ao pod e enriquece os recursos com os metadados do Kubernetes. Nome do serviço, namespace, versão da imagem e nó vêm do ambiente, sem duplicar essa declaração nas APIs.',
    [
      'Associação pelo UID do pod',
      'Processor k8sattributes',
      'Deployment · namespace · imagem',
    ],
  ),
  node(
    'collector',
    'OTel Collector',
    'OTLP · coleta · processamento',
    'OT',
    'green',
    'Pipeline de observabilidade',
    'O OpenTelemetry Collector Contrib recebe logs, traces e métricas das APIs e coleta sinais da infraestrutura. Ele adiciona contexto Kubernetes, processa os dados em lote e exporta para o ClickHouse.',
    [
      'DaemonSet no K3s',
      'k8sattributes + batch',
      'Métricas delta → cumulativas',
    ],
  ),
  node(
    'clickhouse',
    'ClickHouse',
    'Logs · traces · métricas',
    'CH',
    'green',
    'Armazenamento de telemetria',
    'O ClickHouse centraliza os três sinais. Logs e traces usam o exporter nativo; métricas chegam por Prometheus remote write à tabela TimeSeries. O Grafana consulta esses dados por SQL e pela API compatível com Prometheus.',
    [
      'otel_logs + otel_traces',
      'TimeSeries / remote write',
      'Retenção de telemetria: 72 h',
    ],
  ),
  node(
    'keeper',
    'ClickHouse Keeper',
    'Coordenação do ClickHouse',
    'CK',
    'green',
    'Operação de dados',
    'O Keeper fornece a coordenação usada pela instalação do ClickHouse. O operador oficial gerencia o ciclo de vida dos serviços e integra a configuração ao Kubernetes.',
    [
      'ClickHouse Operator oficial',
      'Coordenação da instalação',
      'Volumes Longhorn',
    ],
  ),
  node(
    'grafana',
    'Grafana',
    'Dashboards · logs · traces',
    'G',
    'green',
    'Exploração de sinais',
    'O Grafana usa o plugin ClickHouse para explorar logs e traces por SQL e uma fonte Prometheus para consultar métricas na API do ClickHouse. Os logs das APIs carregam trace_id para correlação com os traces.',
    [
      'SQL: logs e traces',
      'PromQL: métricas',
      'Correlação de logs por trace_id',
    ],
  ),
]

const p = (id: string, col: number, row: number) => ({
  id,
  x: col * 250,
  y: row * 190 + 38,
})
const e = (
  from: string,
  to: string,
  tone: Tone,
  label?: string,
  extra: Partial<DiagramEdge> = {},
): DiagramEdge => ({ from, to, tone, label, ...extra })
const lane = (label: string, row: number, width = 1200) => ({
  label,
  y: row * 190,
  width,
})

export const INFRA_FLOWS: DiagramFlow[] = [
  {
    id: 'overview',
    label: 'Panorama',
    number: '01',
    title: 'Uma visão de ponta a ponta.',
    description:
      'Da imagem publicada à requisição atendida, com dados e telemetria no mesmo mapa.',
    lanes: [
      lane('ENTREGA CONTÍNUA', 0),
      lane('CAMINHO DA REQUISIÇÃO', 1),
      lane('PLATAFORMA, DADOS E OBSERVABILIDADE', 2),
    ],
    nodes: [
      p('github', 0, 0),
      p('registry', 1, 0),
      p('updater', 2, 0),
      p('gitops', 3, 0),
      p('argo', 4, 0),
      p('visitors', 0, 1),
      p('cloudflare', 1, 1),
      p('nlb', 2, 1),
      p('gateway', 3, 1),
      p('apps', 4, 1),
      p('terraform', 0, 2),
      p('grafana', 1, 2),
      p('clickhouse', 2, 2),
      p('collector', 3, 2),
      p('postgres', 4, 2),
    ],
    edges: [
      e('github', 'registry', 'purple'),
      e('registry', 'updater', 'purple'),
      e('updater', 'gitops', 'purple'),
      e('gitops', 'argo', 'purple'),
      e('argo', 'apps', 'purple', 'rollout', {
        source: 'bottom',
        target: 'top',
      }),
      e('visitors', 'cloudflare', 'cyan'),
      e('cloudflare', 'nlb', 'cyan'),
      e('nlb', 'gateway', 'cyan'),
      e('gateway', 'apps', 'cyan'),
      e('apps', 'postgres', 'amber', 'SQL', {
        source: 'bottom',
        target: 'top',
      }),
      e('apps', 'collector', 'green', 'OTLP', {
        source: 'bottom',
        target: 'top',
        vertices: [
          { x: 1100, y: 360 },
          { x: 850, y: 360 },
        ],
      }),
      e('collector', 'clickhouse', 'green', 'export', {
        source: 'left',
        target: 'right',
      }),
      e('clickhouse', 'grafana', 'green', 'consultas', {
        source: 'left',
        target: 'right',
      }),
      e('terraform', 'nlb', 'purple', 'provisiona', {
        dashed: true,
        source: 'top',
        target: 'bottom',
        vertices: [
          { x: 100, y: 365 },
          { x: 600, y: 365 },
        ],
      }),
    ],
    steps: [
      {
        title: 'Código vira versão',
        text: 'O CI publica a imagem; o Image Updater registra a tag no Git e o Argo CD reconcilia o cluster.',
      },
      {
        title: 'Acesso chega ao produto',
        text: 'Cloudflare, Oracle NLB e Gateway API encaminham cada domínio e caminho à aplicação.',
      },
      {
        title: 'Cada chamada deixa contexto',
        text: 'As APIs usam PostgreSQL e enviam logs, traces e métricas para o pipeline OpenTelemetry.',
      },
    ],
  },
  {
    id: 'traffic',
    label: 'Requisições',
    number: '02',
    title: 'Do navegador até o banco.',
    description:
      'Frontends, APIs, autenticação e persistência, com os caminhos de cada integração.',
    lanes: [
      lane('BORDA E ROTEAMENTO', 0),
      lane('APLICAÇÕES', 1),
      lane('DADOS E INTEGRAÇÕES', 2),
    ],
    nodes: [
      p('visitors', 0, 0),
      p('cloudflare', 1, 0),
      p('nlb', 2, 0),
      p('gateway', 3, 0),
      p('tls', 4, 0),
      p('frontends', 0, 1),
      p('go', 3, 1),
      p('node', 4, 1),
      p('oauth', 3, 2),
      p('postgres', 4, 2),
    ],
    edges: [
      e('visitors', 'cloudflare', 'cyan'),
      e('cloudflare', 'nlb', 'cyan'),
      e('nlb', 'gateway', 'cyan'),
      e('tls', 'gateway', 'cyan', 'TLS / DNS', {
        dashed: true,
        source: 'left',
        target: 'right',
      }),
      e('gateway', 'frontends', 'cyan', '/', {
        source: 'bottom',
        target: 'top',
        vertices: [
          { x: 850, y: 180 },
          { x: 100, y: 180 },
        ],
      }),
      e('gateway', 'go', 'cyan', '/api/', { source: 'bottom', target: 'top' }),
      e('gateway', 'node', 'cyan', '/api/', {
        source: 'bottom',
        target: 'top',
        vertices: [
          { x: 960, y: 180 },
          { x: 1100, y: 180 },
        ],
      }),
      e('go', 'oauth', 'amber', 'OAuth / Spotify', {
        source: 'bottom',
        target: 'top',
      }),
      e('node', 'oauth', 'amber', 'Google OAuth', {
        dashed: true,
        source: 'bottom',
        target: 'right',
      }),
      e('go', 'postgres', 'amber', 'MusicHub', {
        source: 'bottom',
        target: 'left',
        vertices: [
          { x: 850, y: 355 },
          { x: 970, y: 355 },
          { x: 970, y: 466 },
        ],
      }),
      e('node', 'postgres', 'amber', 'LiveLink', {
        source: 'bottom',
        target: 'top',
      }),
    ],
    steps: [
      {
        title: 'Roteamento por produto',
        text: 'Portfolio, MusicHub e LiveLink têm seus próprios domínios. HTTPRoutes separam os arquivos estáticos das APIs.',
      },
      {
        title: 'Integrações das APIs',
        text: 'Go atende o MusicHub e integra Spotify. Node.js atende o LiveLink, com Express e Prisma.',
      },
      {
        title: 'Persistência por produto',
        text: 'As APIs usam schemas separados no PostgreSQL. CloudNativePG gerencia o banco e Longhorn fornece o armazenamento persistente.',
      },
    ],
  },
  {
    id: 'delivery',
    label: 'Deploy',
    number: '03',
    title: 'O Git descreve o que está rodando.',
    description:
      'Provisionamento, integração contínua e reconciliação têm responsabilidades próprias.',
    lanes: [
      lane('DA APLICAÇÃO AO ESTADO DESEJADO', 0),
      lane('DA INFRAESTRUTURA AO CLUSTER', 1),
      lane('EXECUÇÃO', 2),
    ],
    nodes: [
      p('github', 0, 0),
      p('registry', 1, 0),
      p('updater', 2, 0),
      p('gitops', 3, 0),
      p('argo', 4, 0),
      p('terraform', 0, 1),
      p('oci', 1, 1),
      p('k3s', 2, 1),
      p('secrets', 0, 2),
      p('longhorn', 2, 2),
      p('apps', 4, 2),
    ],
    edges: [
      e('github', 'registry', 'purple', 'build'),
      e('registry', 'updater', 'purple', 'nova tag'),
      e('updater', 'gitops', 'purple', 'commit'),
      e('gitops', 'argo', 'purple', 'sync'),
      e('terraform', 'oci', 'purple'),
      e('oci', 'k3s', 'purple', 'bootstrap'),
      e('argo', 'apps', 'purple', 'rollout', {
        source: 'bottom',
        target: 'top',
      }),
      e('argo', 'k3s', 'purple', 'plataforma', {
        source: 'bottom',
        target: 'right',
        vertices: [
          { x: 1100, y: 185 },
          { x: 730, y: 185 },
          { x: 730, y: 270 },
        ],
      }),
      e('k3s', 'longhorn', 'amber', 'CSI', { source: 'bottom', target: 'top' }),
      e('secrets', 'apps', 'purple', 'Kubernetes Secrets', {
        dashed: true,
        vertices: [
          { x: 220, y: 545 },
          { x: 975, y: 545 },
        ],
      }),
    ],
    steps: [
      {
        title: 'Validar e empacotar',
        text: 'GitHub Actions executa os checks das aplicações e publica imagens compatíveis com amd64 e arm64.',
      },
      {
        title: 'Versionar e reconciliar',
        text: 'Image Updater grava a tag no oracle-gitops. O Argo CD aplica o estado desejado via charts e manifests.',
      },
      {
        title: 'Separar base e workloads',
        text: 'Terraform cuida de rede, compute e bootstrap. Argo CD gerencia as aplicações e a plataforma Kubernetes.',
      },
    ],
  },
  {
    id: 'telemetry',
    label: 'Observabilidade',
    number: '04',
    title: 'Três sinais. Um contexto.',
    description:
      'As aplicações emitem telemetria; o Kubernetes fornece a identidade; o ClickHouse centraliza os dados.',
    lanes: [
      lane('ORIGEM DOS SINAIS', 0),
      lane('COLETA, CONTEXTO E PROCESSAMENTO', 1),
      lane('ARMAZENAMENTO E EXPLORAÇÃO', 2),
    ],
    nodes: [
      p('go', 0, 0),
      p('node', 1, 0),
      p('infra', 3, 0),
      p('metadata', 0, 1),
      p('collector', 2, 1),
      p('clickhouse', 2, 2),
      p('keeper', 0, 2),
      p('grafana', 4, 2),
    ],
    edges: [
      e('go', 'collector', 'green', 'OTLP: logs, traces, métricas', {
        source: 'bottom',
        target: 'top',
        vertices: [
          { x: 100, y: 170 },
          { x: 600, y: 170 },
        ],
      }),
      e('node', 'collector', 'green', 'OTLP', {
        source: 'bottom',
        target: 'top',
        vertices: [
          { x: 350, y: 190 },
          { x: 600, y: 190 },
        ],
      }),
      e('infra', 'collector', 'green', 'receivers / scrape', {
        source: 'bottom',
        target: 'right',
      }),
      e('metadata', 'collector', 'green', 'k8sattributes', { dashed: true }),
      e('collector', 'clickhouse', 'green', 'logs + traces / exporter nativo', {
        source: 'bottom',
        target: 'top',
      }),
      e('collector', 'clickhouse', 'green', 'métricas / remote write', {
        source: 'right',
        target: 'right',
        vertices: [
          { x: 850, y: 276 },
          { x: 850, y: 466 },
        ],
      }),
      e('keeper', 'clickhouse', 'green', 'coordenação', { dashed: true }),
      e('clickhouse', 'grafana', 'green', 'SQL + PromQL'),
    ],
    steps: [
      {
        title: 'Instrumentação nas duas APIs',
        text: 'Spans HTTP e SQL formam os traces. Logs carregam trace_id; métricas descrevem o comportamento das aplicações.',
      },
      {
        title: 'Identidade vem do cluster',
        text: 'O Collector associa o pod e adiciona serviço, namespace, imagem e nó. As APIs não precisam repetir esses metadados.',
      },
      {
        title: 'Exploração no Grafana',
        text: 'Logs e traces usam SQL; métricas usam PromQL na API do ClickHouse. A correlação entre logs e traces usa o trace_id.',
      },
    ],
  },
  {
    id: 'platform',
    label: 'Plataforma',
    number: '05',
    title: 'Uma base automatizada e reproduzível.',
    description:
      'Rede privada, acesso administrativo, persistência e os operadores que sustentam os produtos.',
    lanes: [
      lane('PROVISIONAMENTO E ACESSO', 0),
      lane('SERVIÇOS DA PLATAFORMA', 1),
      lane('WORKLOADS E PERSISTÊNCIA', 2),
    ],
    nodes: [
      p('terraform', 0, 0),
      p('oci', 1, 0),
      p('k3s', 2, 0),
      p('warp', 4, 0),
      p('argo', 0, 1),
      p('secrets', 1, 1),
      p('longhorn', 2, 1),
      p('tls', 3, 1),
      p('gateway', 4, 1),
      p('postgres', 1, 2),
      p('clickhouse', 2, 2),
      p('grafana', 3, 2),
      p('apps', 4, 2),
    ],
    edges: [
      e('terraform', 'oci', 'purple'),
      e('oci', 'k3s', 'purple'),
      e('warp', 'k3s', 'purple', 'túnel privado', {
        dashed: true,
        source: 'left',
        target: 'right',
      }),
      e('argo', 'k3s', 'purple', 'reconcilia', {
        source: 'top',
        target: 'bottom',
        vertices: [
          { x: 100, y: 180 },
          { x: 600, y: 180 },
        ],
      }),
      e('k3s', 'longhorn', 'amber', 'CSI', { source: 'bottom', target: 'top' }),
      e('tls', 'gateway', 'cyan', 'certificados'),
      e('gateway', 'apps', 'cyan', 'HTTPRoutes', {
        source: 'bottom',
        target: 'top',
      }),
      e('secrets', 'apps', 'purple', 'configuração', {
        dashed: true,
        source: 'bottom',
        target: 'left',
        vertices: [
          { x: 350, y: 360 },
          { x: 970, y: 360 },
          { x: 970, y: 460 },
        ],
      }),
      e('longhorn', 'postgres', 'amber', 'volume', {
        source: 'bottom',
        target: 'top',
      }),
      e('longhorn', 'clickhouse', 'amber', 'volume', {
        source: 'bottom',
        target: 'top',
      }),
      e('longhorn', 'grafana', 'amber', 'volume', {
        source: 'bottom',
        target: 'top',
      }),
    ],
    steps: [
      {
        title: 'Entrada pública, nó privado',
        text: 'A borda pública passa por Cloudflare e OCI NLB. WARP e Tunnel oferecem o caminho administrativo para a rede privada.',
      },
      {
        title: 'Operadores cuidam dos serviços',
        text: 'CloudNativePG e ClickHouse Operator gerenciam os bancos. cert-manager e external-dns automatizam certificados e DNS.',
      },
      {
        title: 'Plataforma integrada',
        text: 'K3s orquestra os workloads em ARM64 na Oracle Cloud. Longhorn fornece persistência e os HPAs acompanham as métricas das aplicações.',
      },
    ],
  },
]

export const STACK_GROUPS = [
  {
    number: '01',
    title: 'Produtos & aplicações',
    tone: 'cyan',
    items: [
      'Angular',
      'React',
      'Vite',
      'TypeScript',
      'Go',
      'Gin',
      'Node.js',
      'Express',
      'Prisma',
      'Passport',
      'Google OAuth',
      'Spotify API',
      'NGINX',
    ],
  },
  {
    number: '02',
    title: 'Cloud & rede',
    tone: 'purple',
    items: [
      'Oracle Cloud',
      'Ampere A1 / ARM64',
      'Ubuntu LTS',
      'VCN + subnets',
      'OCI NLB',
      'OCI Cloud Controller',
      'Cloudflare',
      'WARP',
      'Cloudflare Tunnel',
    ],
  },
  {
    number: '03',
    title: 'Entrega & configuração',
    tone: 'purple',
    items: [
      'Terraform',
      'HCP Terraform',
      'cloud-init',
      'GitHub Actions',
      'Docker Buildx',
      'Docker Hub',
      'Helm',
      'Argo CD',
      'Image Updater',
      'SOPS',
      'age',
      'govulncheck',
      'npm audit',
    ],
  },
  {
    number: '04',
    title: 'Kubernetes & persistência',
    tone: 'amber',
    items: [
      'K3s',
      'Gateway API',
      'NGINX Gateway Fabric',
      'cert-manager',
      'Let’s Encrypt',
      'external-dns',
      'CoreDNS',
      'metrics-server',
      'HPA',
      'Longhorn CSI',
      'CloudNativePG',
      'PostgreSQL',
    ],
  },
  {
    number: '05',
    title: 'Coleta & instrumentação',
    tone: 'green',
    items: [
      'OpenTelemetry SDKs',
      'OTLP',
      'OTel Collector Contrib',
      'k8sattributes',
      'Hostmetrics',
      'kubelet / cAdvisor',
      'kube-state-metrics',
      'Prometheus scrape',
      'Filelog',
      'Prometheus remote write',
    ],
  },
  {
    number: '06',
    title: 'Observabilidade & exploração',
    tone: 'green',
    items: [
      'ClickHouse',
      'ClickHouse Operator',
      'ClickHouse Keeper',
      'TimeSeries',
      'Grafana',
      'ClickHouse datasource',
      'SQL',
      'PromQL',
      'Logs ↔ traces / trace_id',
    ],
  },
]
