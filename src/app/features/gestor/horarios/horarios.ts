import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../../../core/demo-store.service';
import {
  chaveHorario,
  EstadoHorario,
  estadoDoHorario,
  gerarHorarios,
  Horario,
  minutosDeHora,
} from '../../../core/agenda.util';
import {
  hojeIso,
  nomeDiaSemanaCurto,
  proximosDias,
  rotuloDataNumerica,
} from '../../../core/datas.util';
import { DuracaoHorario, PADROES_QUADRA, Quadra } from '../../../core/models';
import { EstadoVazioComponent } from '../../../shared/estado-vazio/estado-vazio';
import { ToastService } from '../../../shared/toast/toast.service';

interface LinhaBloqueio extends Horario {
  estado: EstadoHorario;
  motivo?: string;
}

@Component({
  selector: 'app-horarios',
  imports: [ReactiveFormsModule, RouterLink, EstadoVazioComponent],
  templateUrl: './horarios.html',
})
export class HorariosComponent implements OnDestroy {
  private readonly store = inject(DemoStore);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly arena = this.store.arenaDoGestor;
  readonly quadras = this.store.quadrasDaArena;
  readonly quadraId = signal('');
  readonly data = signal(hojeIso());
  readonly motivo = signal('Indisponível');
  readonly agora = signal(Date.now());
  readonly erroConfiguracao = signal('');
  readonly dias = computed(() => proximosDias(14));

  readonly quadraAtual = computed(
    () =>
      this.quadras().find((quadra) => quadra.id === this.quadraId()) ?? this.quadras()[0] ?? null,
  );

  readonly diasSemana = [
    { valor: 0, rotulo: 'Dom', nome: 'Domingo' },
    { valor: 1, rotulo: 'Seg', nome: 'Segunda-feira' },
    { valor: 2, rotulo: 'Ter', nome: 'Terça-feira' },
    { valor: 3, rotulo: 'Qua', nome: 'Quarta-feira' },
    { valor: 4, rotulo: 'Qui', nome: 'Quinta-feira' },
    { valor: 5, rotulo: 'Sex', nome: 'Sexta-feira' },
    { valor: 6, rotulo: 'Sáb', nome: 'Sábado' },
  ];
  readonly duracoes: DuracaoHorario[] = [60, 90, 120];

  readonly form = this.fb.nonNullable.group({
    diasSemana: this.fb.nonNullable.control<number[]>([...PADROES_QUADRA.diasSemana]),
    abertura: [PADROES_QUADRA.abertura, [Validators.required]],
    fechamento: [PADROES_QUADRA.fechamento, [Validators.required]],
    duracaoMin: this.fb.nonNullable.control<DuracaoHorario>(PADROES_QUADRA.duracaoMin),
    valor: [PADROES_QUADRA.valor, [Validators.required, Validators.min(1)]],
  });

  readonly linhas = computed<LinhaBloqueio[]>(() => {
    const quadra = this.quadraAtual();
    if (!quadra) {
      return [];
    }
    const data = this.data();
    const bloqueios = this.store.bloqueios();
    return gerarHorarios(quadra, data).map((horario) => {
      const bloqueio = bloqueios.find(
        (item) =>
          chaveHorario(item.quadraId, item.data, item.hora) ===
          chaveHorario(quadra.id, data, horario.hora),
      );
      return {
        ...horario,
        estado: estadoDoHorario(
          horario,
          data,
          bloqueios,
          this.store.reservasAtivas(),
          this.agora(),
        ),
        motivo: bloqueio?.motivo,
      };
    });
  });

  private quadraCarregadaId: string | null = null;
  private readonly intervalo = setInterval(() => this.agora.set(Date.now()), 30_000);

  constructor() {
    effect(() => {
      const quadra = this.quadraAtual();
      if (quadra && quadra.id !== this.quadraCarregadaId) {
        this.quadraCarregadaId = quadra.id;
        this.carregarConfiguracao(quadra);
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  trocarQuadra(id: string): void {
    this.quadraId.set(id);
    this.erroConfiguracao.set('');
  }

  alternarDia(dia: number): void {
    const atuais = this.form.controls.diasSemana.value;
    const novos = atuais.includes(dia)
      ? atuais.filter((item) => item !== dia)
      : [...atuais, dia].sort((a, b) => a - b);
    this.form.controls.diasSemana.setValue(novos);
  }

  diaAtivo(dia: number): boolean {
    return this.form.controls.diasSemana.value.includes(dia);
  }

  salvarConfiguracao(): void {
    this.erroConfiguracao.set('');
    this.form.markAllAsTouched();
    const quadra = this.quadraAtual();
    const arena = this.arena();
    if (!quadra || !arena) {
      return;
    }
    if (this.form.invalid) {
      this.erroConfiguracao.set('Preencha os campos de funcionamento corretamente.');
      return;
    }

    const { abertura, fechamento, duracaoMin, valor, diasSemana } = this.form.getRawValue();
    if (minutosDeHora(abertura) >= minutosDeHora(fechamento)) {
      this.erroConfiguracao.set('A abertura deve ser anterior ao fechamento.');
      return;
    }
    if (valor <= 0) {
      this.erroConfiguracao.set('O valor por horário deve ser maior que zero.');
      return;
    }

    const resultado = this.store.salvarQuadra(
      arena.id,
      {
        nome: quadra.nome,
        tipo: quadra.tipo,
        diasSemana,
        abertura,
        fechamento,
        duracaoMin,
        valor,
      },
      quadra.id,
    );
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Configuração salva');
  }

  aoTocarHorario(linha: LinhaBloqueio): void {
    const quadra = this.quadraAtual();
    if (!quadra || linha.estado === 'Encerrado') {
      return;
    }
    if (linha.estado === 'Ocupado') {
      this.toast.mostrar('Este horário tem uma reserva ativa', 'erro');
      return;
    }
    if (linha.estado === 'Bloqueado') {
      const resultado = this.store.liberarHorario(quadra.id, this.data(), linha.hora);
      if (!resultado.ok) {
        this.toast.mostrar(resultado.erro, 'erro');
        return;
      }
      this.toast.mostrar('Horário liberado');
      return;
    }

    const resultado = this.store.bloquearHorario(quadra.id, this.data(), linha.hora, this.motivo());
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Horário bloqueado');
  }

  publicar(): void {
    const arena = this.arena();
    if (!arena) {
      return;
    }
    const resultado = this.store.publicarAgenda(arena.id);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Agenda publicada! Os jogadores já podem ver os horários.');
  }

  rotuloFaixa(data: string): string {
    return data === hojeIso() ? 'Hoje' : nomeDiaSemanaCurto(data);
  }

  dataCurta(data: string): string {
    return rotuloDataNumerica(data);
  }

  classeHorario(linha: LinhaBloqueio): string {
    switch (linha.estado) {
      case 'Livre':
        return 'border-primary/25 bg-white text-on-surface hover:border-primary';
      case 'Ocupado':
        return 'border-outline bg-slate-100 text-slate-500';
      case 'Bloqueado':
        return 'border-error/30 bg-error-bg/50 text-error';
      default:
        return 'border-outline bg-slate-50 text-slate-400';
    }
  }

  corEstado(linha: LinhaBloqueio): string {
    switch (linha.estado) {
      case 'Livre':
        return 'text-primary';
      case 'Ocupado':
        return 'text-slate-500';
      case 'Bloqueado':
        return 'text-error';
      default:
        return 'text-slate-400';
    }
  }

  private carregarConfiguracao(quadra: Quadra): void {
    this.form.patchValue({
      diasSemana: [...quadra.diasSemana],
      abertura: quadra.abertura,
      fechamento: quadra.fechamento,
      duracaoMin: quadra.duracaoMin,
      valor: quadra.valor,
    });
    this.erroConfiguracao.set('');
  }
}
