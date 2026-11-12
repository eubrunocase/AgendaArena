import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DemoStore } from '../../../core/demo-store.service';
import { podeCancelar } from '../../../core/agenda.util';
import { formatarMoeda, inicioReserva, rotuloDia } from '../../../core/datas.util';
import { Reserva } from '../../../core/models';
import { ChipStatusComponent } from '../../../shared/chip-status/chip-status';
import { EstadoVazioComponent } from '../../../shared/estado-vazio/estado-vazio';
import { ModalComponent } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';

type Aba = 'proximas' | 'historico';

@Component({
  selector: 'app-minhas-reservas',
  imports: [RouterLink, ChipStatusComponent, EstadoVazioComponent, ModalComponent],
  templateUrl: './minhas-reservas.html',
})
export class MinhasReservasComponent implements OnDestroy {
  private readonly store = inject(DemoStore);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly aba = signal<Aba>('proximas');
  readonly agora = signal(Date.now());
  readonly reservaSelecionadaId = signal<string | null>(null);

  readonly todas = computed(() => {
    const jogador = this.auth.usuario();
    return jogador
      ? this.store.reservas().filter((reserva) => reserva.jogadorId === jogador.id)
      : [];
  });

  readonly proximas = computed(() =>
    this.todas()
      .filter(
        (reserva) =>
          (reserva.status === 'Pendente' || reserva.status === 'Confirmada') &&
          inicioReserva(reserva.data, reserva.horaInicio).getTime() > this.agora(),
      )
      .sort(
        (a, b) =>
          inicioReserva(a.data, a.horaInicio).getTime() -
          inicioReserva(b.data, b.horaInicio).getTime(),
      ),
  );

  readonly historico = computed(() =>
    this.todas()
      .filter(
        (reserva) =>
          (reserva.status !== 'Pendente' && reserva.status !== 'Confirmada') ||
          inicioReserva(reserva.data, reserva.horaInicio).getTime() <= this.agora(),
      )
      .sort(
        (a, b) =>
          inicioReserva(b.data, b.horaInicio).getTime() -
          inicioReserva(a.data, a.horaInicio).getTime(),
      ),
  );

  readonly lista = computed(() => (this.aba() === 'proximas' ? this.proximas() : this.historico()));

  readonly avisos = computed(() =>
    this.todas().filter(
      (reserva) =>
        !reserva.avisoVisto && (reserva.status === 'Confirmada' || reserva.status === 'Recusada'),
    ),
  );

  readonly reservaSelecionada = computed(
    () => this.todas().find((reserva) => reserva.id === this.reservaSelecionadaId()) ?? null,
  );

  readonly prazoHoras = computed(() => {
    const reserva = this.reservaSelecionada();
    return reserva ? (this.store.arenaPorId(reserva.arenaId)?.prazoCancelamentoHoras ?? 24) : 24;
  });

  readonly podeCancelarAgora = computed(() => {
    const reserva = this.reservaSelecionada();
    if (!reserva) {
      return false;
    }
    return podeCancelar(
      inicioReserva(reserva.data, reserva.horaInicio),
      this.agora(),
      this.prazoHoras(),
    );
  });

  private readonly intervalo = setInterval(() => this.agora.set(Date.now()), 30_000);

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  podeCancelarReserva(reserva: Reserva): boolean {
    return (
      (reserva.status === 'Pendente' || reserva.status === 'Confirmada') &&
      inicioReserva(reserva.data, reserva.horaInicio).getTime() > this.agora()
    );
  }

  abrirCancelamento(reserva: Reserva): void {
    this.reservaSelecionadaId.set(reserva.id);
  }

  fecharCancelamento(): void {
    this.reservaSelecionadaId.set(null);
  }

  confirmarCancelamento(): void {
    const reserva = this.reservaSelecionada();
    if (!reserva) {
      return;
    }
    const resultado = this.store.cancelarReserva(reserva.id);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
    } else {
      this.toast.mostrar('Reserva cancelada');
    }
    this.fecharCancelamento();
  }

  dispensarAviso(reserva: Reserva): void {
    this.store.marcarAvisoVisto(reserva.id);
  }

  textoAviso(reserva: Reserva): string {
    const dia = rotuloDia(reserva.data).toLocaleLowerCase('pt-BR');
    return reserva.status === 'Confirmada'
      ? `Sua reserva de ${dia} foi confirmada!`
      : `Sua solicitação de ${dia} foi recusada`;
  }

  valor(reserva: Reserva): string {
    return formatarMoeda(reserva.valor);
  }

  dia(reserva: Reserva): string {
    return rotuloDia(reserva.data);
  }
}
