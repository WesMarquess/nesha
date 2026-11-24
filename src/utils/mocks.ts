// 1. Definição das Tipagens (Interfaces)
export interface Service {
  id: string;
  title: string;
  basePrice: string; // Ex: "A partir de R$ 130" ou "Sob consulta"
  description?: string; // Usado quando o card expande
  includedItems?: string[]; 
  suggestedPrice?: number;
  keywords?: string[]; // termos extras para a busca (ex.: "faxina", "cozinhar")
  image?: any;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  memberSince: number;
  rating: number;
  reviewsCount: number;
  location: string;
  pricePerDay: string;
  price: number; // valor numérico de pricePerDay, usado na ordenação
  availability: string;
  workDays: number[]; // dias de availability (0 = domingo ... 6 = sábado)
  responseTime: string;
  aboutMe: string;
  specialties: string[];
  avatar: any; // Em um projeto real seria uma URL (string), aqui pode ser um require()
}

// 2. Mock Data de Serviços (catálogo completo do Figma). Os ids 1 a 5 são usados pela home
// e pelos agendamentos antigos; novos serviços entram com ids a partir de 6.
export const mockServices: Service[] = [
  {
    id: '2',
    title: 'Limpeza Residencial',
    keywords: ['faxina', 'diarista', 'limpar casa'],
    basePrice: 'A partir de R$ 130',
    description: 'Faxina padrão ou pesada para manter os ambientes da casa organizados e higienizados.',
    includedItems: [
      'Limpeza de quartos, salas e áreas comuns',
      'Higienização de banheiros e cozinha',
      'Retirada de pó de móveis e superfícies',
    ],
    suggestedPrice: 130.0,
    image: require('../../assets/images/categorias/faxina-residencial.jpg'),
  },
  {
    id: '3',
    title: 'Limpeza reforçada (pós obra)',
    keywords: ['faxina pesada', 'obra', 'reforma'],
    basePrice: 'Sob consulta',
    description: 'Limpeza pesada depois de obras e reformas, removendo poeira fina e resíduos.',
    includedItems: [
      'Remoção de restos de tinta, cimento e massa',
      'Limpeza de vidros, pisos e rodapés',
      'Higienização completa dos ambientes',
    ],
    image: require('../../assets/images/categorias/limpeza-reforcada.jpg'),
  },
  {
    id: '6',
    title: 'Organizador Profissional',
    basePrice: 'A partir de R$ 180',
    description: 'Organização de armários, closets e ambientes para facilitar a rotina.',
    includedItems: [
      'Organização de guarda-roupas e closets',
      'Arrumação de cozinha e despensa',
      'Sugestões de otimização de espaço',
    ],
    suggestedPrice: 180.0,
    image: require('../../assets/images/categorias/organizador.jpg'),
  },
  {
    id: '5',
    title: 'Passadeira e Lavadeira',
    keywords: ['passar roupa', 'lavar roupa'],
    basePrice: 'A partir de R$ 110',
    description: 'Cuidado completo com suas roupas, incluindo lavagem e passagem das peças.',
    includedItems: [
      'Lavagem de roupas do dia a dia',
      'Passagem e dobra das peças',
      'Organização das roupas no armário',
    ],
    suggestedPrice: 110.0,
    image: require('../../assets/images/categorias/passadeira-lavadeira.jpg'),
  },
  {
    id: '7',
    title: 'Limpeza e Manutenção de Piscinas',
    keywords: ['piscineiro'],
    basePrice: 'A partir de R$ 150',
    description: 'Limpeza e tratamento da água para manter a piscina pronta para uso.',
    includedItems: [
      'Aspiração e escovação de paredes e fundo',
      'Tratamento e equilíbrio químico da água',
      'Limpeza de filtros e bordas',
    ],
    suggestedPrice: 150.0,
    image: require('../../assets/images/categorias/limpeza-piscina.jpg'),
  },
  {
    id: '4',
    title: 'Eletricista Residencial',
    basePrice: 'A partir de R$ 90',
    description: 'Instalações e reparos elétricos com segurança para a sua casa.',
    includedItems: [
      'Troca de tomadas, interruptores e disjuntores',
      'Instalação de luminárias e chuveiros',
      'Identificação de curtos e falhas',
    ],
    suggestedPrice: 90.0,
    image: require('../../assets/images/categorias/eletricista.jpg'),
  },
  {
    id: '8',
    title: 'Encanador',
    keywords: ['vazamento', 'hidráulica'],
    basePrice: 'A partir de R$ 80',
    description: 'Reparos hidráulicos para resolver vazamentos e entupimentos.',
    includedItems: [
      'Conserto de vazamentos em torneiras e canos',
      'Desentupimento de pias e ralos',
      'Troca de registros e sifões',
    ],
    suggestedPrice: 80.0,
    image: require('../../assets/images/categorias/encanador.jpg'),
  },
  {
    id: '9',
    title: 'Pintor Residencial',
    basePrice: 'A partir de R$ 120',
    description: 'Pintura de paredes e tetos com acabamento caprichado.',
    includedItems: [
      'Preparação e correção de paredes',
      'Pintura interna e externa',
      'Proteção de móveis e pisos durante o serviço',
    ],
    suggestedPrice: 120.0,
    image: require('../../assets/images/categorias/pintor.jpg'),
  },
  {
    id: '10',
    title: 'Gesseiro',
    basePrice: 'Sob consulta',
    description: 'Instalação e reparo de forros, sancas e divisórias de gesso.',
    includedItems: [
      'Forros e rebaixamento de teto',
      'Sancas e molduras decorativas',
      'Reparo de trincas e buracos no gesso',
    ],
    image: require('../../assets/images/categorias/gesseiro.jpg'),
  },
  {
    id: '11',
    title: 'Pedreiro',
    basePrice: 'A partir de R$ 200',
    description: 'Pequenas obras e reparos de alvenaria na sua casa.',
    includedItems: [
      'Assentamento de pisos e revestimentos',
      'Reparos em paredes e muros',
      'Pequenas reformas e acabamentos',
    ],
    suggestedPrice: 200.0,
    image: require('../../assets/images/categorias/pedreiro.jpg'),
  },
  {
    id: '12',
    title: 'Montador de Móveis',
    keywords: ['montagem'],
    basePrice: 'A partir de R$ 70',
    description: 'Montagem e desmontagem de móveis com cuidado e agilidade.',
    includedItems: [
      'Montagem de guarda-roupas, camas e estantes',
      'Desmontagem para mudança',
      'Fixação de prateleiras e painéis',
    ],
    suggestedPrice: 70.0,
    image: require('../../assets/images/categorias/montador-moveis.jpg'),
  },
  {
    id: '13',
    title: 'Chaveiro',
    basePrice: 'A partir de R$ 60',
    description: 'Abertura de portas, cópias e troca de fechaduras.',
    includedItems: [
      'Abertura de portas e portões',
      'Troca e instalação de fechaduras',
      'Cópia de chaves',
    ],
    suggestedPrice: 60.0,
    image: require('../../assets/images/categorias/chaveiro.jpg'),
  },
  {
    id: '14',
    title: 'Instalação de Redes e Telas de Proteção',
    basePrice: 'A partir de R$ 150',
    description: 'Redes e telas para janelas, sacadas e varandas, protegendo crianças e pets.',
    includedItems: [
      'Medição e instalação de redes de proteção',
      'Telas mosquiteiras para janelas',
      'Troca de redes antigas',
    ],
    suggestedPrice: 150.0,
    image: require('../../assets/images/categorias/redes-protecao.jpg'),
  },
  {
    id: '15',
    title: 'Cozinheiro Doméstico',
    keywords: ['cozinhar', 'marmita', 'comida'],
    basePrice: 'A partir de R$ 150',
    description: 'Preparo de refeições e marmitas no conforto da sua casa.',
    includedItems: [
      'Planejamento do cardápio da semana',
      'Preparo de refeições e marmitas',
      'Organização da cozinha ao final',
    ],
    suggestedPrice: 150.0,
    image: require('../../assets/images/categorias/cozinheiro.jpg'),
  },
  {
    id: '1',
    title: 'Jardineiro',
    basePrice: 'A partir de R$ 120',
    description: 'Manutenção externa para deixar o quintal organizado, limpo e pronto para uso diário.',
    includedItems: [
      'Roçagem, poda leve e limpeza do gramado',
      'Remoção de folhas e resíduos do jardim',
      'Rega e ajustes rápidos em vasos e canteiros',
    ],
    suggestedPrice: 120.0,
    image: require('../../assets/images/categorias/jardineiro.png'),
  },
  {
    id: '16',
    title: 'Controle de Pragas',
    keywords: ['dedetização', 'insetos'],
    basePrice: 'A partir de R$ 190',
    description: 'Dedetização e controle de insetos e roedores com produtos seguros.',
    includedItems: [
      'Dedetização contra baratas e formigas',
      'Controle de cupins e roedores',
      'Orientações de prevenção',
    ],
    suggestedPrice: 190.0,
    image: require('../../assets/images/categorias/controle-pragas.jpg'),
  },
];

// 3. Mock Data de Profissionais (Baseado na lista de Jardineiros)
export const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Francisco Oliveira',
    role: 'Jardineiro parceiro',
    memberSince: 2021,
    rating: 4.9,
    reviewsCount: 82,
    location: 'São Paulo - Zona Sul e Oeste',
    pricePerDay: 'R$ 130 / dia',
    price: 130,
    availability: 'Seg a Sáb',
    workDays: [1, 2, 3, 4, 5, 6],
    responseTime: 'Menos de 1 hora',
    aboutMe: 'Olá! Sou o Francisco, jardineiro com experiência em manutenção de quintais, poda, replantio e organização de espaços externos. Trabalho com cuidado, pontualidade e foco em deixar cada jardim bem cuidado e pronto para uso.',
    specialties: [
      'Manutenção de jardim e quintal',
      'Poda de árvores e arbustos',
      'Roçagem e limpeza de terreno',
      'Replantio e organização de canteiros',
      'Manutenção de gramado e áreas verdes'
    ],
    avatar: null // Substituir pelo caminho da imagem local quando tiver
  },
  {
    id: '2',
    name: 'Marta Rocha',
    role: 'Jardineiro parceiro',
    memberSince: 2023,
    rating: 4.8,
    reviewsCount: 45,
    location: 'São Paulo - Centro e Zona Norte',
    pricePerDay: 'R$ 120 / dia',
    price: 120,
    availability: 'Seg, Qua e Sex',
    workDays: [1, 3, 5],
    responseTime: 'Cerca de 2 horas',
    aboutMe: 'Trabalho focado em hortas e pequenos jardins residenciais.',
    specialties: ['Manutenção de jardim', 'Poda leve'],
    avatar: null
  }
];
// Normaliza para a busca: minúsculas e sem acentos ("Dedetização" -> "dedetizacao").
function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Busca do catálogo: cada palavra digitada precisa aparecer no título, na descrição,
// nos itens incluídos ou nas palavras-chave do serviço.
export function buscarServicos(servicos: Service[], termo: string) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return servicos;
  return servicos.filter((servico) => {
    const texto = normalizar(
      [servico.title, servico.description, ...(servico.includedItems ?? []), ...(servico.keywords ?? [])].join(' ')
    );
    return palavras.every((palavra) => texto.includes(palavra));
  });
}
