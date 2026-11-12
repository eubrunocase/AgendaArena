import { Routes } from '@angular/router';
import { autenticadoGuard, gestorGuard, jogadorGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'agenda',
    canActivate: [autenticadoGuard, jogadorGuard],
    loadComponent: () => import('./features/jogador/agenda/agenda').then((m) => m.AgendaComponent),
  },
  {
    path: 'reserva/nova',
    canActivate: [autenticadoGuard, jogadorGuard],
    loadComponent: () =>
      import('./features/jogador/reserva-nova/reserva-nova').then((m) => m.ReservaNovaComponent),
  },
  {
    path: 'reserva/enviada/:id',
    canActivate: [autenticadoGuard, jogadorGuard],
    loadComponent: () =>
      import('./features/jogador/reserva-enviada/reserva-enviada').then(
        (m) => m.ReservaEnviadaComponent,
      ),
  },
  {
    path: 'minhas-reservas',
    canActivate: [autenticadoGuard, jogadorGuard],
    loadComponent: () =>
      import('./features/jogador/minhas-reservas/minhas-reservas').then(
        (m) => m.MinhasReservasComponent,
      ),
  },
  {
    path: 'gestor/solicitacoes',
    canActivate: [autenticadoGuard, gestorGuard],
    loadComponent: () =>
      import('./features/gestor/solicitacoes/solicitacoes').then((m) => m.SolicitacoesComponent),
  },
  {
    path: 'gestor/reservas-do-dia',
    canActivate: [autenticadoGuard, gestorGuard],
    loadComponent: () =>
      import('./features/gestor/reservas-dia/reservas-dia').then((m) => m.ReservasDiaComponent),
  },
  {
    path: 'gestor/arena',
    canActivate: [autenticadoGuard, gestorGuard],
    loadComponent: () => import('./features/gestor/arena/arena').then((m) => m.ArenaComponent),
  },
  {
    path: 'gestor/horarios',
    canActivate: [autenticadoGuard, gestorGuard],
    loadComponent: () =>
      import('./features/gestor/horarios/horarios').then((m) => m.HorariosComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
