import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../../../core/demo-store.service';
import { gerarHorarios, Horario } from '../../../core/agenda.util';
import { hojeIso, inicioReserva, rotuloDia } from '../../../core/datas.util';
import { Bloqueio, Reserva } from '../../../core/models';
import { EstadoVazioComponent } from '../../../shared/estado-vazio/estado-vazio';
import { ChipStatusComponent } from '../../../shared/chip-status/chip-status';
import { SeletorDataComponent } from '../../../shared/seletor-data/seletor-data';
import { ToastService } from '../../../shared/toast/toast.service';

type TipoLinha = 'confirmada' | 'pendente' | 'livre' | 'bloqueado' | 'encerrado';

interface LinhaDia {
  horario: Horario;
  tipo: TipoLinha;
  reserva?: Reserva;
  bloqueio?: Bloqueio;
}

@Component({
  selector: 'app-reservas-dia',
  imports: [RouterLink, EstadoVazioComponent, SeletorDataComponent, ChipStatusComponent],
  templateUrl: './reservas-dia.html',
})
export class ReservasDiaComponent implements OnDestroy {
  private readonly store = inject(DemoStore);
  private readonly toast = inject(ToastService);

  readonly arena = this.store.arenaDoGestor;
  readonly quadras = this.store.quadrasDaArena;
  readonly quadraId = signal('');
  readonly data = signal(hojeIso());
  readonly agora = signal(Date.now());

  readonly quadraAtual = computed(
    () =>
      this.quadras().find((quadra) => quadra.id === this.quadraId()) ?? this.quadras()[0] ?? null,
  );

  readonly linhas = computed<LinhaDia[]>(() => {
    const quadra = this.quadraAtual();
    if (!quadra) {
      return [];
    }
    const data = this.data();
    const reservas = this.store
      .reservasAtivas()
      .filter((reserva) => reserva.quadraId === quadra.id && reserva.data === data);
    const bloqueios = this.store
      .bloqueios()
      .filter((bloqueio) => bloqueio.quadraId === quadra.id && bloqueio.data === data);

    return gerarHorarios(quadra, data).map((horario) => {
      const reserva = reservas.find((item) => item.horaInicio === horario.hora);
      if (reserva) {
        return {
          horario,
          tipo: reserva.status === 'Confirmada' ? 'confirmada' : 'pendente',
          reserva,
        };
      }
      const bloqueio = bloqueios.find((item) => item.hora === horario.hora);
      if (bloqueio) {
        return { horario, tipo: 'bloqueado', bloqueio };
      }
      if (inicioReserva(data, horario.hora).getTime() <= this.agora()) {
        return { horario, tipo: 'encerrado' };
      }
      return { horario, tipo: 'livre' };
    });
  });

  readonly confirmadas = computed(
    () => this.linhas().filter((linha) => linha.tipo === 'confirmada').length,
  );
  readonly livres = computed(() => this.linhas().filter((linha) => linha.tipo === 'livre').length);
  readonly resumo = computed(() => {
    const confirmadas = this.confirmadas();
    const livres = this.livres();
    return `${confirmadas} ${confirmadas === 1 ? 'reserva confirmada' : 'reservas confirmadas'} · ${livres} ${
      livres === 1 ? 'horário livre' : 'horários livres'
    }`;
  });

  private readonly intervalo = setInterval(() => this.agora.set(Date.now()), 60_000);

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  trocarQuadra(id: string): void {
    this.quadraId.set(id);
  }

  marcarComparecimento(reserva: Reserva, evento: Event): void {
    const marcado = (evento.target as HTMLInputElement).checked;
    const resultado = this.store.marcarComparecimento(reserva.id, marcado);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
    }
  }

  bloquear(linha: LinhaDia): void {
    const quadra = this.quadraAtual();
    if (!quadra) {
      return;
    }
    const resultado = this.store.bloquearHorario(
      quadra.id,
      this.data(),
      linha.horario.hora,
      'Indisponível',
    );
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Horário bloqueado');
  }

  liberar(linha: LinhaDia): void {
    const quadra = this.quadraAtual();
    if (!quadra) {
      return;
    }
    const resultado = this.store.liberarHorario(quadra.id, this.data(), linha.horario.hora);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Horário liberado');
  }

  dia(): string {
    return rotuloDia(this.data());
  }
}
