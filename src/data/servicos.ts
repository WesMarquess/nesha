import { mockServices } from '../utils/mocks';

// Opções de serviço principal do prestador. Enquanto o catálogo não vem do backend,
// são as mesmas categorias do mock do catálogo do cliente.
export const SERVICOS_PRESTADOR = mockServices.map((servico) => servico.title);
