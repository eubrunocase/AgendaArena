import { Component, inject } from '@angular/core';
import { ToastService, TipoToast } from './toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4"
      aria-live="polite"
    >
      @if (toast(); as atual) {
        <div
          class="pointer-events-auto flex w-full max-w-[640px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          [class]="classe(atual.tipo)"
          role="status"
        >
          <span aria-hidden="true" class="material-symbols-outlined shrink-0 text-xl">{{
            icone(atual.tipo)
          }}</span>
          <span class="flex-1">{{ atual.mensagem }}</span>
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
            aria-label="Fechar aviso"
            (click)="fechar()"
          >
            <span aria-hidden="true" class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  private readonly service = inject(ToastService);
  readonly toast = this.service.toast;

  classe(tipo: TipoToast): string {
    const classes: Record<TipoToast, string> = {
      sucesso: 'bg-primary text-white',
      erro: 'bg-error text-white',
      info: 'bg-on-surface text-white',
    };
    return classes[tipo];
  }

  icone(tipo: TipoToast): string {
    const icones: Record<TipoToast, string> = {
      sucesso: 'check_circle',
      erro: 'error',
      info: 'info',
    };
    return icones[tipo];
  }

  fechar(): void {
    this.service.fechar();
  }
}
