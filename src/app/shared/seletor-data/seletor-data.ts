import { Component, computed, input, output } from '@angular/core';
import { adicionarDiasIso, hojeIso, rotuloDataNumerica, rotuloDia } from '../../core/datas.util';

@Component({
  selector: 'app-seletor-data',
  template: `
    <div
      class="flex items-center justify-between gap-2 rounded-xl border border-outline bg-white p-1.5"
    >
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5"
        aria-label="Dia anterior"
        (click)="mover(-1)"
      >
        <span aria-hidden="true" class="material-symbols-outlined">chevron_left</span>
      </button>
      <span class="text-sm font-semibold text-on-surface">{{ rotulo() }}</span>
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5"
        aria-label="Próximo dia"
        (click)="mover(1)"
      >
        <span aria-hidden="true" class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  `,
})
export class SeletorDataComponent {
  readonly data = input.required<string>();
  readonly dataChange = output<string>();
  readonly rotulo = computed(() =>
    this.data() === hojeIso() ? `Hoje, ${rotuloDataNumerica(this.data())}` : rotuloDia(this.data()),
  );

  mover(deslocamento: number): void {
    this.dataChange.emit(adicionarDiasIso(this.data(), deslocamento));
  }
}
