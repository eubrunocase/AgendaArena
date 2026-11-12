import { Component, computed, input } from '@angular/core';
import { StatusReserva } from '../../core/models';

interface EstiloStatus {
  rotulo: string;
  classe: string;
  ponto: string;
}

const ESTILOS: Record<StatusReserva, EstiloStatus> = {
  Pendente: { rotulo: 'Pendente', classe: 'bg-pending-bg text-pending', ponto: 'bg-pending' },
  Confirmada: { rotulo: 'Confirmada', classe: 'bg-success-bg text-success', ponto: 'bg-success' },
  Recusada: { rotulo: 'Recusada', classe: 'bg-error-bg text-error', ponto: 'bg-error' },
  Cancelada: { rotulo: 'Cancelada', classe: 'bg-slate-100 text-slate-500', ponto: 'bg-slate-400' },
};

@Component({
  selector: 'app-chip-status',
  template: `
    <span [class]="'chip ' + estilo().classe">
      <span class="h-1.5 w-1.5 rounded-full" [class]="estilo().ponto"></span>
      {{ estilo().rotulo }}
    </span>
  `,
})
export class ChipStatusComponent {
  readonly status = input.required<StatusReserva>();
  readonly estilo = computed(() => ESTILOS[this.status()]);
}
