export type Perfil = 'jogador' | 'gestor';

export type TipoQuadra = 'Society' | 'Futsal' | 'Areia';

export type StatusReserva = 'Pendente' | 'Confirmada' | 'Recusada' | 'Cancelada';

export type DuracaoHorario = 60 | 90 | 120;

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}

export interface Arena {
  id: string;
  gestorId: string;
  nome: string;
  bairro: string;
  telefone: string;
  prazoCancelamentoHoras: number;
  publicada: boolean;
}

export interface Quadra {
  id: string;
  arenaId: string;
  nome: string;
  tipo: TipoQuadra;
  diasSemana: number[];
  abertura: string;
  fechamento: string;
  duracaoMin: DuracaoHorario;
  valor: number;
}

export interface Bloqueio {
  quadraId: string;
  data: string;
  hora: string;
  motivo: string;
}

export interface Reserva {
  id: string;
  arenaId: string;
  arenaNome: string;
  quadraId: string;
  quadraNome: string;
  jogadorId: string;
  jogadorNome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  valor: number;
  observacao: string;
  status: StatusReserva;
  avisoVisto: boolean;
  comparecimento: boolean | null;
  criadaEm: number;
  atualizadaEm: number;
}

export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

export const PADROES_QUADRA = {
  diasSemana: [0, 1, 2, 3, 4, 5, 6],
  abertura: '17:00',
  fechamento: '23:00',
  duracaoMin: 60 as DuracaoHorario,
  valor: 120,
};
