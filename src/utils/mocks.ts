// 1. Definição das Tipagens (Interfaces)
export interface Service {
  id: string;
  title: string;
  basePrice: string; // Ex: "A partir de R$ 130" ou "Sob consulta"
  description?: string; // Usado quando o card expande
  includedItems?: string[]; 
  suggestedPrice?: number;
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

// 2. Mock Data de Serviços (Baseado no catálogo)
export const mockServices: Service[] = [
  {
    id: '1',
    title: 'Jardineiro',
    basePrice: 'A partir de R$ 120',
    description: 'Manutenção externa para deixar o quintal organizado, limpo e pronto para uso diário.',
    includedItems: [
      'Roçagem, poda leve e limpeza do gramado',
      'Remoção de folhas e resíduos do jardim',
      'Rega e ajustes rápidos em vasos e canteiros'
    ],
    suggestedPrice: 120.00,
    image: require('../../assets/images/categorias/jardineiro.png'),
  },
  {
    id: '2',
    title: 'Limpeza Residencial',
    basePrice: 'A partir de R$ 130',
    description: 'Limpeza para manter os ambientes da casa organizados e higienizados.',
    includedItems: ['Limpeza de quartos e salas', 'Higienização de banheiro e cozinha'],
    suggestedPrice: 130.00,
    image: require('../../assets/images/categorias/faxina-residencial.jpg'),
  },
  {
    id: '3',
    title: 'Limpeza reforçada (pós obra)',
    basePrice: 'Sob consulta',
    image: require('../../assets/images/categorias/limpeza-reforcada.jpg'),
  },
  {
    id: '4',
    title: 'Eletricista Residencial',
    basePrice: 'A partir de R$ 90',
    image: require('../../assets/images/categorias/eletricista.jpg'),
  },
  {
    id: '5',
    title: 'Passadeira e Lavadeira',
    basePrice: 'A partir de R$ 110',
    description: 'Cuidado com suas roupas, incluindo lavagem e passagem das peças.',
    includedItems: ['Lavagem de roupas do dia a dia', 'Passagem e organização das peças'],
    suggestedPrice: 110.00,
    image: require('../../assets/images/categorias/passadeira-lavadeira.jpg'),
  }
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