import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../../../core/demo-store.service';
import { formatarMoeda, rotuloDia, tempoRelativo } from '../../../core/datas.util';
import { Reserva } from '../../../core/models';
import { EstadoVazioComponent } from '../../../shared/estado-vazio/estado-vazio';
import { ChipStatusComponent } from '../../../shared/chip-status/chip-status';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-solicitacoes',
  imports: [RouterLink, EstadoVazioComponent, ChipStatusComponent],
  templateUrl: './solicitacoes.html',
})
export class SolicitacoesComponent implements OnDestroy {
  private readonly store = inject(DemoStore);
  private readonly toast = inject(ToastService);

  readonly arena = this.store.arenaDoGestor;
  readonly pendentes = this.store.solicitacoesPendentes;
  readonly agora = signal(Date.now());

  readonly contador = computed(() => this.pendentes().length);

  private readonly intervalo = setInterval(() => this.agora.set(Date.now()), 60_000);

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  aprovar(reserva: Reserva): void {
    const resultado = this.store.aprovarReserva(reserva.id);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Reserva confirmada');
  }

  recusar(reserva: Reserva): void {
    const resultado = this.store.recusarReserva(reserva.id);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Solicitação recusada');
  }

  quando(reserva: Reserva): string {
    return tempoRelativo(reserva.criadaEm, this.agora());
  }

  dia(reserva: Reserva): string {
    return rotuloDia(reserva.data);
  }

  valor(reserva: Reserva): string {
    return formatarMoeda(reserva.valor);
  }
}
