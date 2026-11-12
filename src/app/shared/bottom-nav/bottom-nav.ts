import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DemoStore } from '../../core/demo-store.service';

interface ItemNavegacao {
  rota: string;
  rotulo: string;
  icone: string;
  contador?: 'pendentes';
}

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-outline/70 bg-white pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <div class="mx-auto flex max-w-[640px] items-stretch justify-around px-1">
        @for (item of itens(); track item.rota) {
          <a
            [routerLink]="item.rota"
            routerLinkActive="text-primary"
            [routerLinkActiveOptions]="{ exact: true }"
            #rla="routerLinkActive"
            class="flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-semibold text-on-surface-variant transition hover:text-primary"
            [attr.aria-current]="rla.isActive ? 'page' : null"
          >
            <span class="relative">
              <span
                aria-hidden="true"
                class="material-symbols-outlined"
                [class.icone-preenchido]="rla.isActive"
                >{{ item.icone }}</span
              >
              @if (item.contador === 'pendentes' && pendentes() > 0) {
                <span
                  class="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white"
                >
                  {{ pendentes() }}
                </span>
              }
            </span>
            <span class="leading-tight">{{ item.rotulo }}</span>
          </a>
        }
      </div>
    </nav>
  `,
})
export class BottomNavComponent {
  private readonly auth = inject(AuthService);
  private readonly store = inject(DemoStore);

  readonly pendentes = computed(() => this.store.solicitacoesPendentes().length);
  readonly itens = computed<ItemNavegacao[]>(() => {
    if (this.auth.ehGestor()) {
      return [
        {
          rota: '/gestor/solicitacoes',
          rotulo: 'Solicitações',
          icone: 'inbox',
          contador: 'pendentes',
        },
        { rota: '/gestor/reservas-do-dia', rotulo: 'Reservas do dia', icone: 'calendar_today' },
        { rota: '/gestor/arena', rotulo: 'Quadras', icone: 'stadium' },
        { rota: '/gestor/horarios', rotulo: 'Horários', icone: 'schedule' },
      ];
    }
    return [
      { rota: '/agenda', rotulo: 'Agenda', icone: 'calendar_month' },
      { rota: '/minhas-reservas', rotulo: 'Minhas reservas', icone: 'confirmation_number' },
    ];
  });
}
