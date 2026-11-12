import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    @if (aberto()) {
      <div
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
        (click)="fechar.emit()"
      >
        <div
          class="w-full max-w-[640px] rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="titulo()"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-start justify-between gap-4">
            <h2 class="text-lg font-semibold text-on-surface">{{ titulo() }}</h2>
            <button
              type="button"
              class="-mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-slate-100"
              aria-label="Fechar"
              (click)="fechar.emit()"
            >
              <span aria-hidden="true" class="material-symbols-outlined">close</span>
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
  host: {
    '(document:keydown.escape)': 'aoPressionarEsc()',
  },
})
export class ModalComponent {
  readonly aberto = input(false);
  readonly titulo = input('');
  readonly fechar = output<void>();

  aoPressionarEsc(): void {
    if (this.aberto()) {
      this.fechar.emit();
    }
  }
}
