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
  channel?: number
  labelPosition?: number
}

export interface DiagramFlow {
  id: FlowId
  label: string
  number: string
  title: string
  description: string
  nodes: { id: string; x: number; y: number }[]
  edges: DiagramEdge[]
  lanes: { label: string; y: number; height?: number }[]
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
    'Os domínios passam pelo proxy da Cloudflare antes de chegar à infraestrutura Oracle. O External DNS mantém os registros alinhados às rotas do Kubernetes.',
    ['DNS com proxy', 'Entrada HTTP/HTTPS', 'Registros via External DNS'],
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
    'O NGINX Gateway Fabric recebe as conexões e distribui as requisições por domínio e caminho. Os certificados TLS são gerenciados pelo Cert Manager.',
    ['Kubernetes Gateway API', 'Rotas / e /api/', 'TLS com Cert Manager'],
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
    'O projeto oracle-infra provisiona os recursos OCI e prepara a base do K3s com Cloud Init. O estado remoto fica no HCP Terraform; a configuração dos workloads segue pelo Argo CD.',
    [
      'OCI: rede e compute',
      'Bootstrap com Cloud Init',
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
    'Cert Manager · External DNS',
    'TLS',
    'cyan',
    'Automação de borda',
    'O Cert Manager emite certificados Let’s Encrypt com validação DNS-01 pela Cloudflare. O External DNS observa as HTTPRoutes e reconcilia os registros DNS com proxy habilitado.',
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
const lane = (label: string, row: number, height = 190) => ({
  label,
  y: row * 230,
  height,
})
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
    lanes: [
      lane('ENTREGA CONTÍNUA', 0),
      lane('ACESSO ÀS APLICAÇÕES', 1),
      lane('DADOS E OBSERVABILIDADE', 2),
    ],
    nodes: [
      p('gitops', 340, 50),
      p('argo', 680, 50),
      p('cloudflare', 0, 280),
      p('gateway', 340, 280),
      p('apps', 680, 280),
      p('grafana', 0, 510),
      p('clickhouse', 340, 510),
      p('collector', 680, 510),
      p('postgres', 1020, 510),
    ],
    edges: [
      e('cloudflare', 'gateway', 'cyan', 'NLB'),
      e('gateway', 'apps', 'cyan'),
      e('gitops', 'argo', 'purple'),
      e('argo', 'apps', 'purple', 'Reconcilia', {
        source: 'bottom',
        target: 'top',
      }),
      e('apps', 'postgres', 'amber', 'SQL', { target: 'top' }),
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
    lanes: [
      lane('PROVISIONAMENTO DO NLB', 0),
      lane('TRÁFEGO PÚBLICO', 1),
      lane('APLICAÇÕES E DADOS', 2, 410),
    ],
    nodes: [
      p('ccm', 340, 50),
      p('lbservice', 680, 50),
      p('cloudflare', 0, 280),
      p('nlb', 340, 280),
      p('gateway', 680, 280),
      p('frontends', 0, 510),
      p('go', 340, 510),
      p('node', 680, 510),
      p('postgres', 340, 710),
    ],
    edges: [
      e('cloudflare', 'nlb', 'cyan'),
      e('nlb', 'gateway', 'cyan'),
      e('gateway', 'frontends', 'cyan', '/', {
        source: 'bottom',
        target: 'top',
        sourceOffset: -70,
        targetOffset: 80,
        channel: 410,
      }),
      e('gateway', 'go', 'cyan', '/api/', {
        source: 'bottom',
        target: 'top',
        channel: 440,
      }),
      e('gateway', 'node', 'cyan', '/api/', {
        source: 'bottom',
        target: 'top',
        sourceOffset: 70,
        channel: 470,
      }),
      e('go', 'postgres', 'amber', undefined, {
        source: 'bottom',
        target: 'top',
      }),
      e('node', 'postgres', 'amber', undefined, {
        source: 'bottom',
        target: 'top',
        targetOffset: 50,
      }),
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
      e('ccm', 'nlb', 'purple', 'Provisiona', {
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
    lanes: [
      lane('INTEGRAÇÃO CONTÍNUA', 0),
      lane('ESTADO DESEJADO E RECONCILIAÇÃO', 1),
      lane('APLICAÇÕES', 2),
    ],
    nodes: [
      p('github', 0, 50),
      p('registry', 340, 50),
      p('updater', 680, 50),
      p('gitops', 680, 280),
      p('argo', 340, 280),
      p('apps', 340, 510),
    ],
    edges: [
      e('github', 'registry', 'purple', 'Build'),
      e('registry', 'updater', 'purple', 'Tag'),
      e('updater', 'gitops', 'purple', 'Commit', {
        source: 'bottom',
        target: 'top',
      }),
      e('gitops', 'argo', 'purple', 'Sync', {
        source: 'left',
        target: 'right',
      }),
      e('argo', 'apps', 'purple', 'Rollout', {
        source: 'bottom',
        target: 'top',
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
    lanes: [
      lane('ORIGEM DOS SINAIS', 0),
      lane('COLETA E CONTEXTO', 1),
      lane('ARMAZENAMENTO E EXPLORAÇÃO', 2),
    ],
    nodes: [
      p('go', 0, 50),
      p('node', 510, 50),
      p('infra', 1020, 50),
      p('metadata', 0, 280),
      p('collector', 510, 280),
      p('keeper', 0, 510),
      p('clickhouse', 510, 510),
      p('grafana', 1020, 510),
    ],
    edges: [
      e('go', 'collector', 'green', undefined, {
        source: 'bottom',
        target: 'top',
        targetOffset: -64,
      }),
      e('node', 'collector', 'green', 'OTLP', {
        source: 'bottom',
        target: 'top',
      }),
      e('infra', 'collector', 'green', undefined, {
        source: 'bottom',
        target: 'top',
        targetOffset: 64,
      }),
      e('metadata', 'collector', 'green', undefined, { dashed: true }),
      e('collector', 'clickhouse', 'green', 'Três sinais', {
        source: 'bottom',
        target: 'top',
      }),
      e('clickhouse', 'grafana', 'green', 'Consultas'),
      e('keeper', 'clickhouse', 'green', undefined, { dashed: true }),
    ],
  },
  {
    id: 'platform',
    label: 'Plataforma',
    number: '05',
    title: 'A base que sustenta os produtos.',
    description:
      'Provisionamento, acesso privado e persistência ao redor do K3s.',
    lanes: [
      lane('PROVISIONAMENTO E ACESSO', 0),
      lane('SERVIÇOS DA PLATAFORMA', 1),
      lane('PERSISTÊNCIA', 2, 410),
    ],
    nodes: [
      p('terraform', 0, 50),
      p('oci', 510, 50),
      p('warp', 1020, 50),
      p('secrets', 0, 280),
      p('k3s', 510, 280),
      p('tls', 1020, 280),
      p('longhorn', 510, 510),
      p('clickhouse', 0, 710),
      p('postgres', 1020, 710),
    ],
    edges: [
      e('terraform', 'oci', 'purple'),
      e('oci', 'k3s', 'purple', 'Bootstrap', {
        source: 'bottom',
        target: 'top',
        channel: 200,
      }),
      e('warp', 'k3s', 'purple', 'Acesso privado', {
        source: 'bottom',
        target: 'top',
        targetOffset: 64,
        channel: 240,
        dashed: true,
      }),
      e('secrets', 'k3s', 'purple', 'Secrets', { dashed: true }),
      e('tls', 'k3s', 'cyan', undefined, {
        source: 'left',
        target: 'right',
        dashed: true,
      }),
      e('k3s', 'longhorn', 'amber', 'CSI', { source: 'bottom', target: 'top' }),
      e('longhorn', 'clickhouse', 'amber', undefined, {
        source: 'bottom',
        target: 'top',
        sourceOffset: -50,
      }),
      e('longhorn', 'postgres', 'amber', undefined, {
        source: 'bottom',
        target: 'top',
        sourceOffset: 50,
      }),
    ],
  },
]
