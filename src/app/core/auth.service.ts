import { computed, inject, Injectable } from '@angular/core';
import { DemoStore, DadosCadastro } from './demo-store.service';
import { Resultado, Usuario } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(DemoStore);

  readonly usuario = this.store.sessaoUsuario;
  readonly estaAutenticado = computed(() => this.usuario() !== null);
  readonly ehJogador = computed(() => this.usuario()?.perfil === 'jogador');
  readonly ehGestor = computed(() => this.usuario()?.perfil === 'gestor');

  entrar(email: string, senha: string): Resultado<Usuario> {
    return this.store.entrar(email, senha);
  }

  cadastrar(dados: DadosCadastro): Resultado<Usuario> {
    const resultado = this.store.cadastrarUsuario(dados);
    if (resultado.ok) {
      this.store.entrar(dados.email, dados.senha);
    }
    return resultado;
  }

  sair(): void {
    this.store.sair();
  }

  restaurarDemo(): void {
    this.store.restaurarDemo();
  }

  rotaInicial(): string {
    const usuario = this.usuario();
    if (!usuario) {
      return '/login';
    }
    if (usuario.perfil === 'jogador') {
      return '/agenda';
    }
    return this.store.arenaDoGestor() ? '/gestor/solicitacoes' : '/gestor/arena';
  }
}
