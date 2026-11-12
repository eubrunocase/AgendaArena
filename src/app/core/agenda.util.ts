import { Bloqueio, Quadra, Reserva } from './models';
import { deIso, inicioReserva } from './datas.util';

export interface Horario {
  quadraId: string;
  hora: string;
  horaFim: string;
}

export type EstadoHorario = 'Livre' | 'Ocupado' | 'Bloqueado' | 'Encerrado';

export function minutosDeHora(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

export function horaDeMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

export function chaveHorario(quadraId: string, data: string, hora: string): string {
  return `${quadraId}_${data}_${hora}`;
}

export function gerarHorarios(quadra: Quadra, data: string): Horario[] {
  const diaSemana = deIso(data).getDay();
  if (!quadra.diasSemana.includes(diaSemana)) {
    return [];
  }

  const abertura = minutosDeHora(quadra.abertura);
  const fechamento = minutosDeHora(quadra.fechamento);
  const horarios: Horario[] = [];

  for (
    let inicio = abertura;
    inicio + quadra.duracaoMin <= fechamento;
    inicio += quadra.duracaoMin
  ) {
    horarios.push({
      quadraId: quadra.id,
      hora: horaDeMinutos(inicio),
      horaFim: horaDeMinutos(inicio + quadra.duracaoMin),
    });
  }

  return horarios;
}

export function estadoDoHorario(
  horario: Horario,
  data: string,
  bloqueios: Bloqueio[],
  reservasAtivas: Reserva[],
  agora: Date | number = new Date(),
): EstadoHorario {
  const agoraMs = typeof agora === 'number' ? agora : agora.getTime();
  const chave = chaveHorario(horario.quadraId, data, horario.hora);

  if (inicioReserva(data, horario.hora).getTime() <= agoraMs) {
    return 'Encerrado';
  }

  if (
    bloqueios.some(
      (bloqueio) => chaveHorario(bloqueio.quadraId, bloqueio.data, bloqueio.hora) === chave,
    )
  ) {
    return 'Bloqueado';
  }

  if (
    reservasAtivas.some(
      (reserva) => chaveHorario(reserva.quadraId, reserva.data, reserva.horaInicio) === chave,
    )
  ) {
    return 'Ocupado';
  }

  return 'Livre';
}

/** O início entra como Date ou milissegundos; nunca converte para UTC. */
export function podeCancelar(
  inicio: Date | number,
  agora: Date | number,
  prazoHoras: number,
): boolean {
  const inicioMs = typeof inicio === 'number' ? inicio : inicio.getTime();
  const agoraMs = typeof agora === 'number' ? agora : agora.getTime();
  return inicioMs - agoraMs >= prazoHoras * 3_600_000;
}
