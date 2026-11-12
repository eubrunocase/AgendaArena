import { Arena, Bloqueio, Quadra, Reserva, Usuario } from './models';
import { adicionarDiasIso, paraIso } from './datas.util';

export interface DadosDemo {
  usuarios: Usuario[];
  arenas: Arena[];
  quadras: Quadra[];
  bloqueios: Bloqueio[];
  reservas: Reserva[];
}

export function criarDadosDemo(hoje: Date): DadosDemo {
  const hojeIso = paraIso(hoje);
  const agora = hoje.getTime();
  const dia = (deslocamento: number): string => adicionarDiasIso(hojeIso, deslocamento);

  const usuarios: Usuario[] = [
    {
      id: 'u-gestor-0001',
      nome: 'Marcos Oliveira',
      email: 'gestor@agendaarena.demo',
      senha: '123456',
      perfil: 'gestor',
    },
    {
      id: 'u-jogador-0001',
      nome: 'Carlos Silva',
      email: 'jogador@agendaarena.demo',
      senha: '123456',
      perfil: 'jogador',
    },
    { id: 'u-rafael-0001', nome: 'Rafael Menezes', email: '', senha: '', perfil: 'jogador' },
    { id: 'u-marcos-lima-0001', nome: 'Marcos Lima', email: '', senha: '', perfil: 'jogador' },
    { id: 'u-ana-0001', nome: 'Ana Souza', email: '', senha: '', perfil: 'jogador' },
  ];

  const arena: Arena = {
    id: 'arena-boa-bola',
    gestorId: 'u-gestor-0001',
    nome: 'Arena Boa Bola',
    bairro: 'Pituba, Salvador',
    telefone: '(71) 98765-4321',
    prazoCancelamentoHoras: 24,
    publicada: true,
  };

  const quadras: Quadra[] = [
    {
      id: 'quadra-1',
      arenaId: arena.id,
      nome: 'Quadra 1',
      tipo: 'Society',
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      abertura: '18:00',
      fechamento: '23:00',
      duracaoMin: 60,
      valor: 120,
    },
    {
      id: 'quadra-2',
      arenaId: arena.id,
      nome: 'Quadra 2',
      tipo: 'Society',
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      abertura: '18:00',
      fechamento: '23:00',
      duracaoMin: 60,
      valor: 110,
    },
  ];

  const bloqueios: Bloqueio[] = [
    {
      quadraId: 'quadra-1',
      data: dia(1),
      hora: '22:00',
      motivo: 'Manutenção dos refletores',
    },
  ];

  const reserva = (
    indice: number,
    quadra: Quadra,
    data: string,
    horaInicio: string,
    jogador: Usuario,
    status: Reserva['status'],
    opcoes: {
      observacao?: string;
      criadaEm: number;
      avisoVisto?: boolean;
      comparecimento?: boolean | null;
    },
  ): Reserva => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const horaFim = `${String(horas + 1).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    return {
      id: `a${String(indice).padStart(7, '0')}-0000-4000-8000-00000000000${indice}`,
      arenaId: arena.id,
      arenaNome: arena.nome,
      quadraId: quadra.id,
      quadraNome: quadra.nome,
      jogadorId: jogador.id,
      jogadorNome: jogador.nome,
      data,
      horaInicio,
      horaFim,
      valor: quadra.valor,
      observacao: opcoes.observacao ?? '',
      status,
      avisoVisto: opcoes.avisoVisto ?? true,
      comparecimento: opcoes.comparecimento ?? null,
      criadaEm: opcoes.criadaEm,
      atualizadaEm: opcoes.criadaEm,
    };
  };

  const rafael = usuarios[2];
  const marcosLima = usuarios[3];
  const ana = usuarios[4];
  const carlos = usuarios[1];
  const [quadra1, quadra2] = quadras;

  const reservas: Reserva[] = [
    reserva(1, quadra1, hojeIso, '19:00', marcosLima, 'Confirmada', {
      observacao: 'Turma do Sextou FC',
      criadaEm: agora - 3 * 3_600_000,
    }),
    reserva(2, quadra1, hojeIso, '21:00', rafael, 'Confirmada', {
      observacao: 'Baba dos Amigos da Pituba',
      criadaEm: agora - 4 * 3_600_000,
    }),
    reserva(3, quadra2, hojeIso, '20:00', ana, 'Confirmada', {
      observacao: 'Veteranos do Imbuí',
      criadaEm: agora - 5 * 3_600_000,
    }),
    reserva(4, quadra1, dia(3), '20:00', carlos, 'Confirmada', {
      criadaEm: agora - 26 * 3_600_000,
      avisoVisto: false,
    }),
    reserva(5, quadra1, dia(-6), '19:00', carlos, 'Confirmada', {
      criadaEm: agora - 9 * 24 * 3_600_000,
    }),
    reserva(6, quadra1, dia(1), '20:00', rafael, 'Pendente', {
      observacao: 'Baba semanal dos amigos, levaremos 2 bolas',
      criadaEm: agora - 10 * 60_000,
    }),
    reserva(7, quadra2, dia(2), '18:00', marcosLima, 'Pendente', {
      criadaEm: agora - 25 * 60_000,
    }),
    reserva(8, quadra1, dia(3), '21:00', ana, 'Pendente', {
      criadaEm: agora - 40 * 60_000,
    }),
    reserva(9, quadra2, dia(5), '19:00', carlos, 'Pendente', {
      criadaEm: agora - 55 * 60_000,
    }),
    reserva(10, quadra2, dia(-2), '20:00', carlos, 'Recusada', {
      criadaEm: agora - 3 * 24 * 3_600_000,
    }),
    reserva(11, quadra1, dia(-4), '20:00', carlos, 'Cancelada', {
      criadaEm: agora - 5 * 24 * 3_600_000,
    }),
  ];

  return { usuarios, arenas: [arena], quadras, bloqueios, reservas };
}
