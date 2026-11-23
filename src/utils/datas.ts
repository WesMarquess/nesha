// Datas exibidas no app (sempre no fuso do aparelho).

export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_LONGOS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const dois = (n: number) => String(n).padStart(2, '0');

// "2026-05-15" no fuso local (não em UTC, como toISOString faria).
export function chaveDoDia(data: Date): string {
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;
}

export function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);
}

export function hora(data: Date): string {
  return `${dois(data.getHours())}:${dois(data.getMinutes())}`;
}

// "15 Mai"
export function dataCurta(data: Date): string {
  return `${dois(data.getDate())} ${MESES[data.getMonth()].slice(0, 3)}`;
}

// "15 de Maio, Quarta-feira"
export function dataLonga(data: Date): string {
  return `${data.getDate()} de ${MESES[data.getMonth()]}, ${DIAS_LONGOS[data.getDay()]}`;
}

// "Quarta-feira, 15 de Maio"
export function diaPorExtenso(data: Date): string {
  return `${DIAS_LONGOS[data.getDay()]}, ${data.getDate()} de ${MESES[data.getMonth()]}`;
}

// "Maio 2026"
export function mesEAno(data: Date): string {
  return `${MESES[data.getMonth()]} ${data.getFullYear()}`;
}

// ISO 8601 com o fuso do aparelho, ex.: "2026-05-15T13:00:00-03:00".
export function isoComFuso(data: Date): string {
  const minutos = -data.getTimezoneOffset();
  const sinal = minutos >= 0 ? '+' : '-';
  const abs = Math.abs(minutos);
  return (
    `${chaveDoDia(data)}T${hora(data)}:00` +
    `${sinal}${dois(Math.floor(abs / 60))}:${dois(abs % 60)}`
  );
}
