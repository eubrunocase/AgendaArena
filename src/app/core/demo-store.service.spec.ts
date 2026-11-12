import { TestBed } from '@angular/core/testing';
import { DemoStore } from './demo-store.service';
import { criarDadosDemo } from './dados-demo';
import { adicionarDiasIso, hojeIso } from './datas.util';
import { chaveHorario } from './agenda.util';

describe('DemoStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  });

  function criarStore(): DemoStore {
    return TestBed.inject(DemoStore);
  }

  function entrarComoJogador(store: DemoStore): void {
    const resultado = store.entrar('jogador@agendaarena.demo', '123456');
    expect(resultado.ok).toBe(true);
  }

  function entrarComoGestor(store: DemoStore): void {
    const resultado = store.entrar('gestor@agendaarena.demo', '123456');
    expect(resultado.ok).toBe(true);
  }

  it('recusa a segunda reserva ativa no mesmo horário (RN01)', () => {
    const store = criarStore();
    entrarComoJogador(store);
    const data = adicionarDiasIso(hojeIso(), 7);
    const entrada = {
      arenaId: 'arena-boa-bola',
      quadraId: 'quadra-1',
      data,
      hora: '19:00',
    };

    const primeira = store.criarReserva(entrada);
    const segunda = store.criarReserva(entrada);

    expect(primeira.ok).toBe(true);
    expect(segunda.ok).toBe(false);
    if (!segunda.ok) {
      expect(segunda.erro).toBe('Este horário acabou de ser ocupado');
    }
  });

  it('libera o horário ao recusar a solicitação (RN06)', () => {
    const store = criarStore();
    const data = adicionarDiasIso(hojeIso(), 8);
    const entrada = {
      arenaId: 'arena-boa-bola',
      quadraId: 'quadra-1',
      data,
      hora: '20:00',
    };

    entrarComoJogador(store);
    const criada = store.criarReserva(entrada);
    expect(criada.ok).toBe(true);
    if (!criada.ok) {
      return;
    }

    store.sair();
    entrarComoGestor(store);
    const recusada = store.recusarReserva(criada.valor);
    expect(recusada.ok).toBe(true);

    store.sair();
    entrarComoJogador(store);
    const novamente = store.criarReserva(entrada);
    expect(novamente.ok).toBe(true);
  });

  it('libera o horário ao cancelar a reserva (RN06)', () => {
    const store = criarStore();
    const data = adicionarDiasIso(hojeIso(), 9);
    const entrada = {
      arenaId: 'arena-boa-bola',
      quadraId: 'quadra-1',
      data,
      hora: '21:00',
    };

    entrarComoJogador(store);
    const criada = store.criarReserva(entrada);
    expect(criada.ok).toBe(true);
    if (!criada.ok) {
      return;
    }

    const cancelada = store.cancelarReserva(criada.valor);
    expect(cancelada.ok).toBe(true);

    const novamente = store.criarReserva(entrada);
    expect(novamente.ok).toBe(true);
  });

  it('cria dados de demonstração sem duas reservas ativas na mesma chave', () => {
    const dados = criarDadosDemo(new Date());
    const chaves = dados.reservas
      .filter((reserva) => reserva.status === 'Pendente' || reserva.status === 'Confirmada')
      .map((reserva) => chaveHorario(reserva.quadraId, reserva.data, reserva.horaInicio));

    expect(new Set(chaves).size).toBe(chaves.length);
  });

  it('não autentica os jogadores de exemplo que não têm login', () => {
    const store = criarStore();
    expect(store.entrar('', '').ok).toBe(false);
    expect(store.entrar('rafael@exemplo.com', '').ok).toBe(false);
  });

  it('recarrega os dados de exemplo quando o localStorage está inválido', () => {
    localStorage.setItem('agendaarena.demo.v1', '{"usuarios": "inválido"}');
    const store = criarStore();
    expect(store.usuarios().length).toBeGreaterThan(0);
    expect(store.arenas()).toHaveLength(1);
    expect(store.sessaoUsuarioId()).toBeNull();
  });
});
