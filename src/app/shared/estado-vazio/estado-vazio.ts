import { Component, input } from '@angular/core';

@Component({
  selector: 'app-estado-vazio',
  template: `
    <div class="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span aria-hidden="true" class="material-symbols-outlined text-4xl text-slate-400">{{
        icone()
      }}</span>
      <p class="text-base font-semibold text-on-surface">{{ titulo() }}</p>
      @if (descricao()) {
        <p class="max-w-sm text-sm leading-relaxed text-on-surface-variant">{{ descricao() }}</p>
      }
      <div class="mt-1 flex w-full max-w-xs flex-col items-stretch">
        <ng-content />
      </div>
    </div>
  `,
})
export class EstadoVazioComponent {
  readonly icone = input('event_busy');
  readonly titulo = input.required<string>();
  readonly descricao = input('');
}
