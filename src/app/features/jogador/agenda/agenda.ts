import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DemoStore } from '../../../core/demo-store.service';
import { EstadoHorario, estadoDoHorario, gerarHorarios, Horario } from '../../../core/agenda.util';
import {
  formatarMoeda,
  hojeIso,
  nomeDiaSemanaCurto,
  proximosDias,
  rotuloDataNumerica,
} from '../../../core/datas.util';
import { EstadoVazioComponent } from '../../../shared/estado-vazio/estado-vazio';

interface LinhaAgenda extends Horario {
  estado: EstadoHorario;
}

@Component({
  selector: 'app-agenda',
  imports: [EstadoVazioComponent],
  templateUrl: './agenda.html',
})
export class AgendaComponent implements OnDestroy {
  private readonly store = inject(DemoStore);
  private readonly router = inject(Router);

  readonly arenas = this.store.arenasPublicadas;
  readonly arenaId = signal('');
  readonly quadraId = signal('');
  readonly data = signal(hojeIso());
  readonly horaSelecionada = signal<string | null>(null);
  readonly agora = signal(Date.now());
  readonly dias = computed(() => proximosDias(7));

  readonly arenaAtual = computed(
    () => this.arenas().find((arena) => arena.id === this.arenaId()) ?? this.arenas()[0] ?? null,
  );

  readonly quadras = computed(() => {
    const arena = this.arenaAtual();
    return arena ? this.store.quadras().filter((quadra) => quadra.arenaId === arena.id) : [];
  });

  readonly quadraAtual = computed(
    () =>
      this.quadras().find((quadra) => quadra.id === this.quadraId()) ?? this.quadras()[0] ?? null,
  );

  readonly linhas = computed<LinhaAgenda[]>(() => {
    const quadra = this.quadraAtual();
    if (!quadra) {
      return [];
    }
    const data = this.data();
    return gerarHorarios(quadra, data).map((horario) => ({
      ...horario,
      estado: estadoDoHorario(
        horario,
        data,
        this.store.bloqueios(),
        this.store.reservasAtivas(),
        this.agora(),
      ),
    }));
  });

  readonly selecionada = computed(
    () =>
      this.linhas().find(
        (linha) => linha.hora === this.horaSelecionada() && linha.estado === 'Livre',
      ) ?? null,
  );

  readonly legenda: { estado: EstadoHorario; classe: string }[] = [
    { estado: 'Livre', classe: 'bg-primary' },
    { estado: 'Ocupado', classe: 'bg-slate-400' },
    { estado: 'Bloqueado', classe: 'bg-error' },
    { estado: 'Encerrado', classe: 'bg-slate-300' },
  ];

  private readonly intervalo = setInterval(() => this.agora.set(Date.now()), 30_000);

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  trocarArena(arenaId: string): void {
    this.arenaId.set(arenaId);
    this.quadraId.set('');
    this.horaSelecionada.set(null);
  }

  trocarQuadra(quadraId: string): void {
    this.quadraId.set(quadraId);
    this.horaSelecionada.set(null);
  }

  trocarData(data: string): void {
    this.data.set(data);
    this.horaSelecionada.set(null);
  }

  selecionarHorario(linha: LinhaAgenda): void {
    if (linha.estado === 'Livre') {
      this.horaSelecionada.set(linha.hora);
    }
  }

  estaSelecionado(linha: LinhaAgenda): boolean {
    return this.selecionada()?.hora === linha.hora;
  }

  rotuloFaixa(data: string): string {
    return data === hojeIso() ? 'Hoje' : nomeDiaSemanaCurto(data);
  }

  dataCurta(data: string): string {
    return rotuloDataNumerica(data);
  }

  valorAtual(): string {
    return formatarMoeda(this.quadraAtual()?.valor ?? 0);
  }

  classeHorario(linha: LinhaAgenda): string {
    if (this.estaSelecionado(linha)) {
      return 'border-primary bg-primary text-white shadow-md';
    }
    switch (linha.estado) {
      case 'Livre':
        return 'border-primary/25 bg-white text-on-surface hover:border-primary hover:shadow-sm';
      case 'Ocupado':
        return 'border-outline bg-slate-100 text-slate-500';
      case 'Bloqueado':
        return 'border-error/25 bg-error-bg/50 text-error';
      default:
        return 'border-outline bg-slate-50 text-slate-400';
    }
  }

  corEstado(linha: LinhaAgenda): string {
    if (this.estaSelecionado(linha)) {
      return 'text-white/90';
    }
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

  solicitar(): void {
    const selecionada = this.selecionada();
    const arena = this.arenaAtual();
    const quadra = this.quadraAtual();
    if (!selecionada || !arena || !quadra) {
      return;
    }
    this.router.navigate(['/reserva/nova'], {
      queryParams: {
        arena: arena.id,
        quadra: quadra.id,
        data: this.data(),
        hora: selecionada.hora,
      },
    });
  }
}
