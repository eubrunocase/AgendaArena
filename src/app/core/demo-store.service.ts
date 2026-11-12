import { computed, effect, Injectable, signal } from '@angular/core';
import {
  Arena,
  Bloqueio,
  DuracaoHorario,
  Perfil,
  Quadra,
  Reserva,
  Resultado,
  TipoQuadra,
  Usuario,
  PADROES_QUADRA,
} from './models';
import { criarDadosDemo } from './dados-demo';
import { chaveHorario, gerarHorarios, podeCancelar } from './agenda.util';
import { inicioReserva } from './datas.util';

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}

export interface DadosArena {
  nome: string;
  bairro: string;
  telefone: string;
  prazoCancelamentoHoras: number;
}

export interface DadosQuadra {
  nome: string;
  tipo: TipoQuadra;
  diasSemana?: number[];
  abertura?: string;
  fechamento?: string;
  duracaoMin?: DuracaoHorario;
  valor?: number;
}

export interface EntradaReserva {
  arenaId: string;
  quadraId: string;
  data: string;
  hora: string;
  observacao?: string;
}

interface EstadoPersistido {
  usuarios: Usuario[];
  arenas: Arena[];
  quadras: Quadra[];
  bloqueios: Bloqueio[];
  reservas: Reserva[];
  sessaoUsuarioId: string | null;
}

const CHAVE_STORAGE = 'agendaarena.demo.v1';

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function estadoValido(dados: unknown): dados is EstadoPersistido {
  if (!ehObjeto(dados)) {
    return false;
  }
  const { usuarios, arenas, quadras, bloqueios, reservas, sessaoUsuarioId } = dados;
  if (
    !Array.isArray(usuarios) ||
    !Array.isArray(arenas) ||
    !Array.isArray(quadras) ||
    !Array.isArray(bloqueios) ||
    !Array.isArray(reservas)
  ) {
    return false;
  }

  const usuariosValidos = usuarios.every(
    (usuario) =>
      ehObjeto(usuario) &&
      typeof usuario['id'] === 'string' &&
      typeof usuario['nome'] === 'string' &&
      typeof usuario['email'] === 'string' &&
      typeof usuario['senha'] === 'string' &&
      (usuario['perfil'] === 'jogador' || usuario['perfil'] === 'gestor'),
  );

  const arenasValidas = arenas.every(
    (arena) =>
      ehObjeto(arena) &&
      typeof arena['id'] === 'string' &&
      typeof arena['gestorId'] === 'string' &&
      typeof arena['nome'] === 'string' &&
      typeof arena['bairro'] === 'string' &&
      typeof arena['telefone'] === 'string' &&
      typeof arena['prazoCancelamentoHoras'] === 'number' &&
      typeof arena['publicada'] === 'boolean',
  );

  const quadrasValidas = quadras.every(
    (quadra) =>
      ehObjeto(quadra) &&
      typeof quadra['id'] === 'string' &&
      typeof quadra['arenaId'] === 'string' &&
      typeof quadra['nome'] === 'string' &&
      ['Society', 'Futsal', 'Areia'].includes(String(quadra['tipo'])) &&
      Array.isArray(quadra['diasSemana']) &&
      quadra['diasSemana'].every((dia) => typeof dia === 'number') &&
      typeof quadra['abertura'] === 'string' &&
      typeof quadra['fechamento'] === 'string' &&
      [60, 90, 120].includes(Number(quadra['duracaoMin'])) &&
      typeof quadra['valor'] === 'number',
  );

  const bloqueiosValidos = bloqueios.every(
    (bloqueio) =>
      ehObjeto(bloqueio) &&
      typeof bloqueio['quadraId'] === 'string' &&
      typeof bloqueio['data'] === 'string' &&
      typeof bloqueio['hora'] === 'string' &&
      typeof bloqueio['motivo'] === 'string',
  );

  const statusValidos = ['Pendente', 'Confirmada', 'Recusada', 'Cancelada'];
  const reservasValidas = reservas.every(
    (reserva) =>
      ehObjeto(reserva) &&
      typeof reserva['id'] === 'string' &&
      typeof reserva['arenaId'] === 'string' &&
      typeof reserva['arenaNome'] === 'string' &&
      typeof reserva['quadraId'] === 'string' &&
      typeof reserva['quadraNome'] === 'string' &&
      typeof reserva['jogadorId'] === 'string' &&
      typeof reserva['jogadorNome'] === 'string' &&
      typeof reserva['data'] === 'string' &&
      typeof reserva['horaInicio'] === 'string' &&
      typeof reserva['horaFim'] === 'string' &&
      typeof reserva['valor'] === 'number' &&
      typeof reserva['observacao'] === 'string' &&
      statusValidos.includes(String(reserva['status'])) &&
      typeof reserva['avisoVisto'] === 'boolean' &&
      (reserva['comparecimento'] === null || typeof reserva['comparecimento'] === 'boolean') &&
      typeof reserva['criadaEm'] === 'number' &&
      typeof reserva['atualizadaEm'] === 'number',
  );

  return (
    usuariosValidos &&
    arenasValidas &&
    quadrasValidas &&
    bloqueiosValidos &&
    reservasValidas &&
    (sessaoUsuarioId === undefined ||
      sessaoUsuarioId === null ||
      typeof sessaoUsuarioId === 'string')
  );
}

function gerarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable({ providedIn: 'root' })
export class DemoStore {
  readonly usuarios = signal<Usuario[]>([]);
  readonly arenas = signal<Arena[]>([]);
  readonly quadras = signal<Quadra[]>([]);
  readonly bloqueios = signal<Bloqueio[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly sessaoUsuarioId = signal<string | null>(null);

  readonly sessaoUsuario = computed(
    () => this.usuarios().find((usuario) => usuario.id === this.sessaoUsuarioId()) ?? null,
  );

  readonly reservasAtivas = computed(() =>
    this.reservas().filter(
      (reserva) => reserva.status === 'Pendente' || reserva.status === 'Confirmada',
    ),
  );

  readonly arenasPublicadas = computed(() => this.arenas().filter((arena) => arena.publicada));

  readonly arenaDoGestor = computed(() => {
    const usuario = this.sessaoUsuario();
    if (!usuario || usuario.perfil !== 'gestor') {
      return null;
    }
    return this.arenas().find((arena) => arena.gestorId === usuario.id) ?? null;
  });

  readonly quadrasDaArena = computed(() => {
    const arena = this.arenaDoGestor();
    return arena ? this.quadras().filter((quadra) => quadra.arenaId === arena.id) : [];
  });

  readonly solicitacoesPendentes = computed(() => {
    const arena = this.arenaDoGestor();
    if (!arena) {
      return [];
    }
    return this.reservas()
      .filter((reserva) => reserva.arenaId === arena.id && reserva.status === 'Pendente')
      .sort((a, b) => a.criadaEm - b.criadaEm);
  });

  constructor() {
    const persistido = this.carregarPersistencia();
    if (persistido) {
      this.usuarios.set(persistido.usuarios);
      this.arenas.set(persistido.arenas);
      this.quadras.set(persistido.quadras);
      this.bloqueios.set(persistido.bloqueios);
      this.reservas.set(persistido.reservas);
      const sessaoValida = persistido.usuarios.some(
        (usuario) => usuario.id === persistido.sessaoUsuarioId,
      );
      this.sessaoUsuarioId.set(sessaoValida ? persistido.sessaoUsuarioId : null);
    } else {
      this.aplicarDadosDemo();
    }

    effect(() => this.persistir());
  }

  // ---------- Sessão e cadastro ----------

  cadastrarUsuario(dados: DadosCadastro): Resultado<Usuario> {
    const nome = dados.nome.trim();
    const email = normalizarEmail(dados.email);

    if (!nome) {
      return { ok: false, erro: 'Informe seu nome' };
    }
    if (!email) {
      return { ok: false, erro: 'Informe um e-mail válido' };
    }
    if (dados.senha.length < 6) {
      return { ok: false, erro: 'A senha deve ter pelo menos 6 caracteres' };
    }
    if (this.usuarios().some((usuario) => normalizarEmail(usuario.email) === email)) {
      return { ok: false, erro: 'Este e-mail já está cadastrado' };
    }

    const usuario: Usuario = {
      id: gerarId(),
      nome,
      email,
      senha: dados.senha,
      perfil: dados.perfil,
    };
    this.usuarios.update((lista) => [...lista, usuario]);
    return { ok: true, valor: usuario };
  }

  entrar(email: string, senha: string): Resultado<Usuario> {
    const emailNormalizado = normalizarEmail(email);
    if (!emailNormalizado || !senha) {
      return { ok: false, erro: 'E-mail ou senha incorretos' };
    }
    const usuario = this.usuarios().find(
      (item) =>
        item.email !== '' &&
        normalizarEmail(item.email) === emailNormalizado &&
        item.senha === senha,
    );
    if (!usuario) {
      return { ok: false, erro: 'E-mail ou senha incorretos' };
    }
    this.sessaoUsuarioId.set(usuario.id);
    return { ok: true, valor: usuario };
  }

  sair(): void {
    this.sessaoUsuarioId.set(null);
  }

  restaurarDemo(): void {
    const usuarioAnterior = this.sessaoUsuarioId();
    this.aplicarDadosDemo();
    const usuariosDemo = this.usuarios();
    this.sessaoUsuarioId.set(
      usuariosDemo.some((usuario) => usuario.id === usuarioAnterior) ? usuarioAnterior : null,
    );
  }

  // ---------- Arena e quadras ----------

  salvarArena(dados: DadosArena): Resultado<Arena> {
    const usuario = this.sessaoUsuario();
    if (!usuario || usuario.perfil !== 'gestor') {
      return { ok: false, erro: 'Apenas gestores podem salvar uma arena' };
    }

    const nome = dados.nome.trim();
    const bairro = dados.bairro.trim();
    const telefone = dados.telefone.trim();
    const prazo = Number(dados.prazoCancelamentoHoras);

    if (!nome || !bairro || !telefone) {
      return { ok: false, erro: 'Preencha nome, bairro e telefone da arena' };
    }
    if (!Number.isFinite(prazo) || prazo < 0) {
      return { ok: false, erro: 'Informe um prazo de cancelamento válido' };
    }

    const existente = this.arenas().find((arena) => arena.gestorId === usuario.id);
    if (existente) {
      const atualizada: Arena = {
        ...existente,
        nome,
        bairro,
        telefone,
        prazoCancelamentoHoras: prazo,
      };
      this.arenas.update((lista) =>
        lista.map((arena) => (arena.id === existente.id ? atualizada : arena)),
      );
      return { ok: true, valor: atualizada };
    }

    const novaArena: Arena = {
      id: gerarId(),
      gestorId: usuario.id,
      nome,
      bairro,
      telefone,
      prazoCancelamentoHoras: prazo,
      publicada: false,
    };
    this.arenas.update((lista) => [...lista, novaArena]);
    return { ok: true, valor: novaArena };
  }

  salvarQuadra(arenaId: string, dados: DadosQuadra, quadraId?: string): Resultado<Quadra> {
    const arena = this.arenaDoGestor();
    if (!arena || arena.id !== arenaId) {
      return { ok: false, erro: 'Arena não encontrada' };
    }

    const nome = dados.nome.trim();
    if (!nome) {
      return { ok: false, erro: 'Informe o nome da quadra' };
    }
    if (!['Society', 'Futsal', 'Areia'].includes(dados.tipo)) {
      return { ok: false, erro: 'Tipo de quadra inválido' };
    }

    if (quadraId) {
      const existente = this.quadras().find(
        (quadra) => quadra.id === quadraId && quadra.arenaId === arenaId,
      );
      if (!existente) {
        return { ok: false, erro: 'Quadra não encontrada' };
      }
      const atualizada: Quadra = {
        ...existente,
        nome,
        tipo: dados.tipo,
        diasSemana: dados.diasSemana ?? existente.diasSemana,
        abertura: dados.abertura ?? existente.abertura,
        fechamento: dados.fechamento ?? existente.fechamento,
        duracaoMin: dados.duracaoMin ?? existente.duracaoMin,
        valor: dados.valor ?? existente.valor,
      };
      this.quadras.update((lista) =>
        lista.map((quadra) => (quadra.id === quadraId ? atualizada : quadra)),
      );
      return { ok: true, valor: atualizada };
    }

    const novaQuadra: Quadra = {
      id: gerarId(),
      arenaId,
      nome,
      tipo: dados.tipo,
      diasSemana: dados.diasSemana ?? [...PADROES_QUADRA.diasSemana],
      abertura: dados.abertura ?? PADROES_QUADRA.abertura,
      fechamento: dados.fechamento ?? PADROES_QUADRA.fechamento,
      duracaoMin: dados.duracaoMin ?? PADROES_QUADRA.duracaoMin,
      valor: dados.valor ?? PADROES_QUADRA.valor,
    };
    this.quadras.update((lista) => [...lista, novaQuadra]);
    return { ok: true, valor: novaQuadra };
  }

  excluirQuadra(quadraId: string): Resultado<Quadra> {
    const arena = this.arenaDoGestor();
    const quadra = this.quadras().find(
      (item) => item.id === quadraId && item.arenaId === arena?.id,
    );
    if (!arena || !quadra) {
      return { ok: false, erro: 'Quadra não encontrada' };
    }

    const agora = Date.now();
    const temReservaAtivaFutura = this.reservas().some(
      (reserva) =>
        reserva.quadraId === quadraId &&
        (reserva.status === 'Pendente' || reserva.status === 'Confirmada') &&
        inicioReserva(reserva.data, reserva.horaInicio).getTime() > agora,
    );

    if (temReservaAtivaFutura) {
      return { ok: false, erro: 'A quadra tem reservas ativas e não pode ser excluída' };
    }

    this.quadras.update((lista) => lista.filter((item) => item.id !== quadraId));
    this.bloqueios.update((lista) => lista.filter((bloqueio) => bloqueio.quadraId !== quadraId));
    return { ok: true, valor: quadra };
  }

  publicarAgenda(arenaId: string): Resultado<Arena> {
    const arena = this.arenaDoGestor();
    if (!arena || arena.id !== arenaId) {
      return { ok: false, erro: 'Arena não encontrada' };
    }
    if (!this.quadras().some((quadra) => quadra.arenaId === arenaId)) {
      return { ok: false, erro: 'Cadastre ao menos uma quadra antes de publicar' };
    }
    const publicada: Arena = { ...arena, publicada: true };
    this.arenas.update((lista) => lista.map((item) => (item.id === arenaId ? publicada : item)));
    return { ok: true, valor: publicada };
  }

  // ---------- Bloqueios ----------

  bloquearHorario(
    quadraId: string,
    data: string,
    hora: string,
    motivo: string,
  ): Resultado<Bloqueio> {
    const quadroPermitido = this.quadraDoGestor(quadraId);
    if (!quadroPermitido) {
      return { ok: false, erro: 'Quadra não encontrada' };
    }

    const chave = chaveHorario(quadraId, data, hora);
    const temReservaAtiva = this.reservasAtivas().some(
      (reserva) => chaveHorario(reserva.quadraId, reserva.data, reserva.horaInicio) === chave,
    );
    if (temReservaAtiva) {
      return { ok: false, erro: 'Este horário tem uma reserva ativa' };
    }

    const bloqueio: Bloqueio = {
      quadraId,
      data,
      hora,
      motivo: motivo.trim() || 'Indisponível',
    };
    this.bloqueios.update((lista) => {
      const semDuplicado = lista.filter(
        (item) => chaveHorario(item.quadraId, item.data, item.hora) !== chave,
      );
      return [...semDuplicado, bloqueio];
    });
    return { ok: true, valor: bloqueio };
  }

  liberarHorario(quadraId: string, data: string, hora: string): Resultado<Bloqueio> {
    if (!this.quadraDoGestor(quadraId)) {
      return { ok: false, erro: 'Quadra não encontrada' };
    }
    const chave = chaveHorario(quadraId, data, hora);
    const bloqueio = this.bloqueios().find(
      (item) => chaveHorario(item.quadraId, item.data, item.hora) === chave,
    );
    if (!bloqueio) {
      return { ok: false, erro: 'Horário não está bloqueado' };
    }
    this.bloqueios.update((lista) =>
      lista.filter((item) => chaveHorario(item.quadraId, item.data, item.hora) !== chave),
    );
    return { ok: true, valor: bloqueio };
  }

  // ---------- Reservas ----------

  criarReserva(entrada: EntradaReserva): Resultado<string> {
    const jogador = this.sessaoUsuario();
    if (!jogador || jogador.perfil !== 'jogador') {
      return { ok: false, erro: 'Entre como jogador para solicitar uma reserva' };
    }

    const arena = this.arenas().find((item) => item.id === entrada.arenaId);
    const quadra = this.quadras().find(
      (item) => item.id === entrada.quadraId && item.arenaId === entrada.arenaId,
    );
    if (!arena || !quadra) {
      return { ok: false, erro: 'Arena ou quadra não encontrada' };
    }

    const horario = gerarHorarios(quadra, entrada.data).find((item) => item.hora === entrada.hora);
    if (!horario) {
      return { ok: false, erro: 'Este horário não está disponível' };
    }

    if (inicioReserva(entrada.data, entrada.hora).getTime() <= Date.now()) {
      return { ok: false, erro: 'Este horário acabou de ser ocupado' };
    }

    const chave = chaveHorario(quadra.id, entrada.data, entrada.hora);

    const bloqueado = this.bloqueios().some(
      (item) => chaveHorario(item.quadraId, item.data, item.hora) === chave,
    );
    if (bloqueado) {
      return { ok: false, erro: 'Este horário está bloqueado' };
    }

    const ocupado = this.reservasAtivas().some(
      (reserva) => chaveHorario(reserva.quadraId, reserva.data, reserva.horaInicio) === chave,
    );
    if (ocupado) {
      return { ok: false, erro: 'Este horário acabou de ser ocupado' };
    }

    const agora = Date.now();
    const reserva: Reserva = {
      id: gerarId(),
      arenaId: arena.id,
      arenaNome: arena.nome,
      quadraId: quadra.id,
      quadraNome: quadra.nome,
      jogadorId: jogador.id,
      jogadorNome: jogador.nome,
      data: entrada.data,
      horaInicio: horario.hora,
      horaFim: horario.horaFim,
      valor: quadra.valor,
      observacao: entrada.observacao?.trim() ?? '',
      status: 'Pendente',
      avisoVisto: false,
      comparecimento: null,
      criadaEm: agora,
      atualizadaEm: agora,
    };

    this.reservas.update((lista) => [...lista, reserva]);
    return { ok: true, valor: reserva.id };
  }

  aprovarReserva(reservaId: string): Resultado<Reserva> {
    return this.alterarStatusPeloGestor(reservaId, 'Confirmada');
  }

  recusarReserva(reservaId: string): Resultado<Reserva> {
    return this.alterarStatusPeloGestor(reservaId, 'Recusada');
  }

  cancelarReserva(reservaId: string): Resultado<Reserva> {
    const jogador = this.sessaoUsuario();
    const reserva = this.reservas().find((item) => item.id === reservaId);
    if (!jogador || !reserva || reserva.jogadorId !== jogador.id) {
      return { ok: false, erro: 'Reserva não encontrada' };
    }
    if (reserva.status !== 'Pendente' && reserva.status !== 'Confirmada') {
      return { ok: false, erro: 'Esta reserva não está ativa' };
    }

    const inicio = inicioReserva(reserva.data, reserva.horaInicio);
    if (inicio.getTime() <= Date.now()) {
      return { ok: false, erro: 'Este horário já começou' };
    }

    const arena = this.arenas().find((item) => item.id === reserva.arenaId);
    const prazo = arena?.prazoCancelamentoHoras ?? 24;
    if (!podeCancelar(inicio, Date.now(), prazo)) {
      return { ok: false, erro: 'Prazo de cancelamento expirado' };
    }

    return this.atualizarReserva(reserva, { status: 'Cancelada' });
  }

  marcarComparecimento(reservaId: string, compareceu: boolean): Resultado<Reserva> {
    const arena = this.arenaDoGestor();
    const reserva = this.reservas().find(
      (item) => item.id === reservaId && item.arenaId === arena?.id,
    );
    if (!arena || !reserva) {
      return { ok: false, erro: 'Reserva não encontrada' };
    }
    return this.atualizarReserva(reserva, { comparecimento: compareceu });
  }

  marcarAvisoVisto(reservaId: string): void {
    const jogador = this.sessaoUsuario();
    const reserva = this.reservas().find(
      (item) => item.id === reservaId && item.jogadorId === jogador?.id,
    );
    if (!reserva) {
      return;
    }
    this.reservas.update((lista) =>
      lista.map((item) => (item.id === reservaId ? { ...item, avisoVisto: true } : item)),
    );
  }

  // ---------- Auxiliares ----------

  arenaPorId(arenaId: string): Arena | undefined {
    return this.arenas().find((arena) => arena.id === arenaId);
  }

  quadraPorId(quadraId: string): Quadra | undefined {
    return this.quadras().find((quadra) => quadra.id === quadraId);
  }

  private quadraDoGestor(quadraId: string): Quadra | null {
    const arena = this.arenaDoGestor();
    if (!arena) {
      return null;
    }
    return (
      this.quadras().find((quadra) => quadra.id === quadraId && quadra.arenaId === arena.id) ?? null
    );
  }

  private alterarStatusPeloGestor(
    reservaId: string,
    status: 'Confirmada' | 'Recusada',
  ): Resultado<Reserva> {
    const arena = this.arenaDoGestor();
    const reserva = this.reservas().find(
      (item) => item.id === reservaId && item.arenaId === arena?.id,
    );
    if (!arena || !reserva) {
      return { ok: false, erro: 'Reserva não encontrada' };
    }
    if (reserva.status !== 'Pendente') {
      return { ok: false, erro: 'Esta solicitação já foi analisada' };
    }
    return this.atualizarReserva(reserva, { status, avisoVisto: false });
  }

  private atualizarReserva(reserva: Reserva, alteracoes: Partial<Reserva>): Resultado<Reserva> {
    const atualizada: Reserva = { ...reserva, ...alteracoes, atualizadaEm: Date.now() };
    this.reservas.update((lista) =>
      lista.map((item) => (item.id === reserva.id ? atualizada : item)),
    );
    return { ok: true, valor: atualizada };
  }

  private aplicarDadosDemo(): void {
    const dados = criarDadosDemo(new Date());
    this.usuarios.set(dados.usuarios);
    this.arenas.set(dados.arenas);
    this.quadras.set(dados.quadras);
    this.bloqueios.set(dados.bloqueios);
    this.reservas.set(dados.reservas);
    this.sessaoUsuarioId.set(null);
    try {
      localStorage.removeItem(CHAVE_STORAGE);
    } catch {
      // Em ambientes sem localStorage a demonstração continua apenas em memória.
    }
  }

  private carregarPersistencia(): EstadoPersistido | null {
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE);
      if (!bruto) {
        return null;
      }
      const dados: unknown = JSON.parse(bruto);
      if (!estadoValido(dados)) {
        return null;
      }
      return {
        usuarios: dados.usuarios,
        arenas: dados.arenas,
        quadras: dados.quadras,
        bloqueios: dados.bloqueios,
        reservas: dados.reservas,
        sessaoUsuarioId: typeof dados.sessaoUsuarioId === 'string' ? dados.sessaoUsuarioId : null,
      };
    } catch {
      return null;
    }
  }

  private persistir(): void {
    const estado: EstadoPersistido = {
      usuarios: this.usuarios(),
      arenas: this.arenas(),
      quadras: this.quadras(),
      bloqueios: this.bloqueios(),
      reservas: this.reservas(),
      sessaoUsuarioId: this.sessaoUsuarioId(),
    };
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
    } catch {
      // Sem persistência disponível, a demonstração funciona em memória.
    }
  }
}
