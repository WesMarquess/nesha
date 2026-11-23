import type { Href } from 'expo-router';
import type { Perfil } from '../types/auth';

// Primeira tela de cada perfil depois do login (ou ao restaurar a sessão).
export function rotaInicial(perfil: Perfil): Href {
  return (perfil === 'PRESTADOR' ? '/prestador/agenda' : '/home') as Href;
}
