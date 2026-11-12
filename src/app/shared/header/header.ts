import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ModalComponent } from '../modal/modal';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ModalComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly usuario = this.auth.usuario;
  readonly menuAberto = signal(false);
  readonly confirmacaoAberta = signal(false);

  readonly perfil = computed(() =>
    this.usuario()?.perfil === 'gestor' ? 'Gestor de arena' : 'Jogador',
  );
  readonly iniciais = computed(() => {
    const nome = this.usuario()?.nome ?? '';
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('');
  });
  readonly rotaLogo = computed(() => this.auth.rotaInicial());

  abrirConfirmacao(): void {
    this.menuAberto.set(false);
    this.confirmacaoAberta.set(true);
  }

  confirmarRestauracao(): void {
    this.auth.restaurarDemo();
    this.confirmacaoAberta.set(false);
    this.toast.mostrar('Dados de demonstração restaurados');
    this.router.navigateByUrl(this.auth.rotaInicial());
  }

  sair(): void {
    this.menuAberto.set(false);
    this.auth.sair();
    this.router.navigate(['/login']);
  }
}
