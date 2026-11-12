import { chaveHorario, estadoDoHorario, gerarHorarios, Horario, podeCancelar } from './agenda.util';
import { Quadra, Reserva } from './models';

function criarQuadra(alteracoes: Partial<Quadra> = {}): Quadra {
  return {
    id: 'quadra-teste',
    arenaId: 'arena-teste',
    nome: 'Quadra Teste',
    tipo: 'Society',
    diasSemana: [0, 1, 2, 3, 4, 5, 6],
    abertura: '17:00',
    fechamento: '23:00',
    duracaoMin: 60,
    valor: 120,
    ...alteracoes,
  };
}

function criarReserva(quadraId: string, data: string, horaInicio: string): Reserva {
  return {
    id: 'reserva-teste',
    arenaId: 'arena-teste',
    arenaNome: 'Arena Teste',
    quadraId,
    quadraNome: 'Quadra Teste',
    jogadorId: 'jogador-teste',
    jogadorNome: 'Jogador Teste',
    data,
    horaInicio,
    horaFim: '19:00',
    valor: 120,
    observacao: '',
    status: 'Confirmada',
    avisoVisto: true,
    comparecimento: null,
    criadaEm: 0,
    atualizadaEm: 0,
  };
}

describe('gerarHorarios', () => {
  const data = '2026-11-20';

  it('gera 6 horários de 60 minutos entre 17:00 e 23:00', () => {
    const horarios = gerarHorarios(criarQuadra(), data);
    expect(horarios).toHaveLength(6);
    expect(horarios[0]).toEqual({ quadraId: 'quadra-teste', hora: '17:00', horaFim: '18:00' });
    expect(horarios[5]).toEqual({ quadraId: 'quadra-teste', hora: '22:00', horaFim: '23:00' });
  });

  it('gera 4 horários de 90 minutos, com o último terminando às 23:00', () => {
    const horarios = gerarHorarios(criarQuadra({ duracaoMin: 90 }), data);
    expect(horarios).toHaveLength(4);
    expect(horarios.map((horario) => horario.hora)).toEqual(['17:00', '18:30', '20:00', '21:30']);
    expect(horarios[3].horaFim).toBe('23:00');
  });

  it('retorna lista vazia quando o dia da semana não está configurado', () => {
    const domingo = '2026-11-15';
    const horarios = gerarHorarios(criarQuadra({ diasSemana: [1, 2, 3] }), domingo);
    expect(horarios).toEqual([]);
  });
});

describe('estadoDoHorario', () => {
  const data = '2026-11-20';
  const horario: Horario = { quadraId: 'quadra-teste', hora: '18:00', horaFim: '19:00' };
  const antesDoHorario = new Date(2026, 10, 20, 17, 0);
  const depoisDoHorario = new Date(2026, 10, 20, 18, 30);

  it('marca como Encerrado mesmo com bloqueio e reserva', () => {
    const bloqueios = [{ quadraId: 'quadra-teste', data, hora: '18:00', motivo: 'Teste' }];
    const reservas = [criarReserva('quadra-teste', data, '18:00')];
    expect(estadoDoHorario(horario, data, bloqueios, reservas, depoisDoHorario)).toBe('Encerrado');
  });

  it('marca como Bloqueado antes de verificar a reserva', () => {
    const bloqueios = [{ quadraId: 'quadra-teste', data, hora: '18:00', motivo: 'Teste' }];
    const reservas = [criarReserva('quadra-teste', data, '18:00')];
    expect(estadoDoHorario(horario, data, bloqueios, reservas, antesDoHorario)).toBe('Bloqueado');
  });

  it('marca como Ocupado quando existe reserva ativa', () => {
    const reservas = [criarReserva('quadra-teste', data, '18:00')];
    expect(estadoDoHorario(horario, data, [], reservas, antesDoHorario)).toBe('Ocupado');
  });

  it('marca como Livre quando não há bloqueio nem reserva', () => {
    expect(estadoDoHorario(horario, data, [], [], antesDoHorario)).toBe('Livre');
  });

  it('usa a chave quadra_data_hora para comparar', () => {
    expect(chaveHorario('quadra-teste', data, '18:00')).toBe('quadra-teste_2026-11-20_18:00');
  });
});

describe('podeCancelar', () => {
  const agora = new Date(2026, 10, 20, 10, 0);

  it('permite cancelar com exatamente 24 horas de antecedência', () => {
    const inicio = new Date(2026, 10, 21, 10, 0);
    expect(podeCancelar(inicio, agora, 24)).toBe(true);
  });

  it('não permite cancelar com 23 horas e 59 minutos de antecedência', () => {
    const inicio = new Date(2026, 10, 21, 9, 59);
    expect(podeCancelar(inicio, agora, 24)).toBe(false);
  });
});
