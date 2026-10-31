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
  sourceOffset?: number
  targetOffset?: number
  labelPosition?: number
  labelOffset?: number
}

export interface DiagramFlow {
  id: FlowId
  label: string
  number: string
  title: string
  description: string
  nodes: { id: string; x: number; y: number }[]
  edges: DiagramEdge[]
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
    'O OCI Cloud Controller Manager provisiona este NLB a partir do Service LoadBalancer criado pelo NGINX Gateway. O balanceador encaminha o tráfego público ao gateway na rede privada.',
    ['Portas 80 / 443', 'OCI Cloud Controller Manager', 'Nó sem IP público'],
  ),
  node(
    'lbservice',
    'Service LoadBalancer',
    'Criado pelo NGINX Gateway',
    'LB',
    'cyan',
    'Provisionamento do balanceador',
    'O NGINX Gateway cria o Service do tipo LoadBalancer. As annotations OCI solicitam um Network Load Balancer, provisionado pelo OCI Cloud Controller Manager.',
    [
      'Recurso do Kubernetes',
      'Owner: Gateway default',
      'Tipo OCI solicitado: NLB',
    ],
  ),
  node(
    'ccm',
    'OCI Cloud Controller',
    'Provisiona o Oracle NLB',
    'OCI',
    'purple',
    'Integração Kubernetes ↔ OCI',
    'O OCI Cloud Controller Manager observa o Service LoadBalancer do NGINX Gateway e provisiona o Network Load Balancer na Oracle. O Terraform prepara a rede, o compute e o bootstrap do controller.',
    [
      'Service LoadBalancer → NLB',
      'OCI Cloud Controller Manager',
      'Rede e compute via Terraform',
    ],
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
    'Testes + build multiarch',
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
    'Imagens versionadas',
    'DH',
    'purple',
    'Registry',
    'As imagens dos produtos são publicadas no Docker Hub. O número da execução do pipeline fornece uma tag versionada que pode ser registrada no GitOps e implantada no cluster ARM64.',
    ['Imagens por aplicação', 'Tags por execução', 'Compatível com ARM64'],
  ),
  node(
    'updater',
    'Image Updater',
    'Imagens → versões no Git',
    '↑',
    'purple',
    'Automação de entrega',
    'O Argo CD Image Updater acompanha as tags no registry e registra a versão escolhida no repositório oracle-gitops. A alteração passa a fazer parte do estado desejado versionado.',
    ['Argo CD Image Updater', 'Write-back no Git', 'Histórico das versões'],
  ),
  node(
    'gitops',
    'oracle-gitops',
    'Estado desejado · Helm',
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
    'OTLP + contexto Kubernetes',
    'OT',
    'green',
    'Pipeline de observabilidade',
    'O OpenTelemetry Collector Contrib recebe logs, traces e métricas das APIs e coleta sinais da infraestrutura. Ele adiciona contexto Kubernetes, processa os dados em lote e exporta para o ClickHouse.',
    [
      'DaemonSet no K3s',
      'k8sattributes + batch',
      'Identidade automática dos serviços',
    ],
  ),
  node(
    'clickhouse',
    'ClickHouse',
    'Logs · traces · métricas',
    'CH',
    'green',
    'Armazenamento de telemetria',
    'O ClickHouse reúne logs, traces e métricas em um único motor para reduzir o uso de memória, CPU e armazenamento da observabilidade no cluster. Armazenamento colunar e compressão completam essa escolha.',
    [
      'Logs, traces e métricas',
      'Memória, CPU e armazenamento',
      'Um motor para os três sinais',
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
    'O Grafana reúne os dashboards e a exploração dos sinais armazenados no ClickHouse. Logs e traces se conectam pelo contexto das requisições para acompanhar cada chamada das APIs.',
    [
      'Dashboards das aplicações',
      'Sinais da infraestrutura',
      'Logs e traces correlacionados',
    ],
  ),
]

const p = (id: string, x: number, y: number) => ({ id, x, y })
const e = (
  from: string,
  to: string,
  tone: Tone,
  label?: string,
  extra: Partial<DiagramEdge> = {},
): DiagramEdge => ({ from, to, tone, label, ...extra })

export const INFRA_FLOWS: DiagramFlow[] = [
  {
    id: 'overview',
    label: 'Panorama',
    number: '01',
    title: 'Os caminhos principais.',
    description:
      'Acesso, entrega e observabilidade. Os detalhes ficam em cada componente.',
    nodes: [
      p('cloudflare', 0, 230),
      p('gateway', 320, 260),
      p('apps', 660, 240),
      p('postgres', 990, 100),
      p('gitops', 320, 20),
      p('argo', 660, 0),
      p('collector', 660, 470),
      p('clickhouse', 320, 510),
      p('grafana', 0, 480),
    ],
    edges: [
      e('cloudflare', 'gateway', 'cyan', 'via OCI NLB'),
      e('gateway', 'apps', 'cyan'),
      e('gitops', 'argo', 'purple'),
      e('argo', 'apps', 'purple', 'reconcilia', {
        source: 'bottom',
        target: 'top',
      }),
      e('apps', 'postgres', 'amber', 'SQL'),
      e('apps', 'collector', 'green', 'OTLP', {
        source: 'bottom',
        target: 'top',
      }),
      e('collector', 'clickhouse', 'green', undefined, {
        source: 'left',
        target: 'right',
      }),
      e('clickhouse', 'grafana', 'green', undefined, {
        source: 'left',
        target: 'right',
      }),
    ],
  },
  {
    id: 'traffic',
    label: 'Requisições',
    number: '02',
    title: 'Da borda às aplicações.',
    description:
      'Tráfego público em azul. O Service do NGINX solicita o NLB ao Cloud Controller.',
    nodes: [
      p('cloudflare', 0, 260),
      p('nlb', 280, 260),
      p('gateway', 560, 260),
      p('frontends', 880, 20),
      p('go', 880, 260),
      p('node', 880, 500),
      p('postgres', 1190, 380),
      p('lbservice', 560, 20),
      p('ccm', 280, 20),
    ],
    edges: [
      e('cloudflare', 'nlb', 'cyan'),
      e('nlb', 'gateway', 'cyan'),
      e('gateway', 'frontends', 'cyan', '/'),
      e('gateway', 'go', 'cyan', '/api/'),
      e('gateway', 'node', 'cyan', '/api/', {
        source: 'bottom',
        target: 'left',
      }),
      e('go', 'postgres', 'amber', undefined, { targetOffset: -18 }),
      e('node', 'postgres', 'amber', undefined, { targetOffset: 18 }),
      e('gateway', 'lbservice', 'purple', undefined, {
        source: 'top',
        target: 'bottom',
        dashed: true,
      }),
      e('lbservice', 'ccm', 'purple', undefined, {
        source: 'left',
        target: 'right',
        dashed: true,
      }),
      e('ccm', 'nlb', 'purple', 'provisiona', {
        source: 'bottom',
        target: 'top',
        dashed: true,
      }),
    ],
  },
  {
    id: 'delivery',
    label: 'Deploy',
    number: '03',
    title: 'Do commit à produção.',
    description:
      'Uma versão percorre o pipeline até ser reconciliada pelo Argo CD.',
    nodes: [
      p('github', 0, 160),
      p('registry', 330, 0),
      p('updater', 680, 60),
      p('gitops', 1010, 240),
      p('argo', 680, 470),
      p('apps', 320, 430),
    ],
    edges: [
      e('github', 'registry', 'purple', 'build'),
      e('registry', 'updater', 'purple', 'nova imagem'),
      e('updater', 'gitops', 'purple', 'commit'),
      e('gitops', 'argo', 'purple', 'sync', {
        source: 'bottom',
        target: 'right',
      }),
      e('argo', 'apps', 'purple', 'rollout', {
        source: 'left',
        target: 'right',
      }),
    ],
  },
  {
    id: 'telemetry',
    label: 'Observabilidade',
    number: '04',
    title: 'Três sinais, um destino.',
    description:
      'O Collector reúne os sinais e o contexto. ClickHouse centraliza; Grafana explora.',
    nodes: [
      p('go', 0, 0),
      p('node', 0, 180),
      p('infra', 0, 400),
      p('metadata', 380, 480),
      p('collector', 380, 190),
      p('clickhouse', 750, 190),
      p('grafana', 1100, 190),
      p('keeper', 750, 450),
    ],
    edges: [
      e('go', 'collector', 'green', undefined, { targetOffset: -23 }),
      e('node', 'collector', 'green', 'OTLP'),
      e('infra', 'collector', 'green', 'coleta', { targetOffset: 23 }),
      e('metadata', 'collector', 'green', 'contexto', {
        source: 'top',
        target: 'bottom',
        dashed: true,
      }),
      e('collector', 'clickhouse', 'green', '3 sinais'),
      e('clickhouse', 'grafana', 'green', 'consultas'),
      e('keeper', 'clickhouse', 'green', 'coordenação', {
        source: 'top',
        target: 'bottom',
        dashed: true,
      }),
    ],
  },
  {
    id: 'platform',
    label: 'Plataforma',
    number: '05',
    title: 'A base que sustenta os produtos.',
    description:
      'Provisionamento, acesso privado e persistência ao redor do K3s.',
    nodes: [
      p('terraform', 0, 70),
      p('oci', 320, 0),
      p('k3s', 660, 240),
      p('warp', 660, 0),
      p('secrets', 0, 280),
      p('tls', 320, 480),
      p('longhorn', 660, 480),
      p('clickhouse', 990, 350),
      p('postgres', 990, 560),
    ],
    edges: [
      e('terraform', 'oci', 'purple'),
      e('oci', 'k3s', 'purple', 'bootstrap', { targetOffset: -23 }),
      e('warp', 'k3s', 'purple', 'acesso privado', {
        source: 'bottom',
        target: 'top',
        dashed: true,
      }),
      e('secrets', 'k3s', 'purple', 'Secrets', { dashed: true }),
      e('tls', 'k3s', 'cyan', 'TLS + DNS', {
        target: 'left',
        targetOffset: 23,
        dashed: true,
      }),
      e('k3s', 'longhorn', 'amber', 'CSI', { source: 'bottom', target: 'top' }),
      e('longhorn', 'clickhouse', 'amber'),
      e('longhorn', 'postgres', 'amber'),
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
      'Grafana',
      'ClickHouse datasource',
      'Logs ↔ traces / trace_id',
    ],
  },
]
