export const RESEARCH_AREAS = [
  'Saúde e Biotecnologia',
  'Tecnologia e Computação',
  'Educação',
  'Meio Ambiente e Sustentabilidade',
  'Engenharia',
  'Ciências Sociais',
  'Economia e Gestão',
  'Comunicação',
  'Direito e Políticas Públicas',
  'Outros',
]

export const MATURITY_LABELS: Record<string, string> = {
  basic: 'Pesquisa Básica',
  developing: 'Em Desenvolvimento',
  ready: 'Pronto para Aplicação',
}

export const MATURITY_COLORS: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-700',
  developing: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Publicada',
  hidden: 'Oculta',
}

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  hidden: 'bg-red-100 text-red-700',
}

export const ROLE_LABELS: Record<string, string> = {
  researcher: 'Pesquisador',
  institution: 'Instituição de Pesquisa',
  business: 'Empresa / Gestor Público',
  investor: 'Investidor',
}

export const ODS_LIST = [
  { id: 1, title: 'Erradicação da Pobreza' },
  { id: 2, title: 'Fome Zero e Agricultura Sustentável' },
  { id: 3, title: 'Saúde e Bem-Estar' },
  { id: 4, title: 'Educação de Qualidade' },
  { id: 5, title: 'Igualdade de Gênero' },
  { id: 6, title: 'Água Potável e Saneamento' },
  { id: 7, title: 'Energia Limpa e Acessível' },
  { id: 8, title: 'Trabalho Decente e Crescimento Econômico' },
  { id: 9, title: 'Indústria, Inovação e Infraestrutura' },
  { id: 10, title: 'Redução das Desigualdades' },
  { id: 11, title: 'Cidades e Comunidades Sustentáveis' },
  { id: 12, title: 'Consumo e Produção Responsáveis' },
  { id: 13, title: 'Ação contra a Mudança Global do Clima' },
  { id: 14, title: 'Vida na Água' },
  { id: 15, title: 'Vida Terrestre' },
  { id: 16, title: 'Paz, Justiça e Instituições Eficazes' },
  { id: 17, title: 'Parcerias e Meios de Implementação' },
]

export const INSTITUTION_TYPES = [
  'Universidade Federal',
  'Universidade Estadual',
  'Universidade Privada',
  'Instituto Federal',
  'Centro de Pesquisa',
  'Startup / Empresa',
  'Órgão Público',
  'Outro',
]
