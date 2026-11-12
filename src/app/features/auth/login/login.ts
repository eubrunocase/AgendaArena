import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { Perfil } from '../../../core/models';

type Aba = 'entrar' | 'criar';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly aba = signal<Aba>('entrar');
  readonly mostrarSenhaEntrar = signal(false);
  readonly mostrarSenhaCadastro = signal(false);
  readonly perfil = signal<Perfil>('jogador');
  readonly erroCredenciais = signal('');
  readonly erroEmailCadastro = signal('');
  readonly erroGeralCadastro = signal('');

  readonly formEntrar = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  readonly formCadastro = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    if (this.auth.estaAutenticado()) {
      this.router.navigateByUrl(this.auth.rotaInicial());
    }
  }

  trocarAba(aba: Aba): void {
    this.aba.set(aba);
    this.erroCredenciais.set('');
    this.erroEmailCadastro.set('');
    this.erroGeralCadastro.set('');
  }

  entrar(): void {
    this.formEntrar.markAllAsTouched();
    this.erroCredenciais.set('');
    if (this.formEntrar.invalid) {
      return;
    }
    const { email, senha } = this.formEntrar.getRawValue();
    const resultado = this.auth.entrar(email, senha);
    if (!resultado.ok) {
      this.erroCredenciais.set('E-mail ou senha incorretos');
      return;
    }
    this.router.navigateByUrl(this.auth.rotaInicial());
  }

  criarConta(): void {
    this.formCadastro.markAllAsTouched();
    this.erroEmailCadastro.set('');
    this.erroGeralCadastro.set('');
    if (this.formCadastro.invalid) {
      return;
    }
    const { nome, email, senha } = this.formCadastro.getRawValue();
    const resultado = this.auth.cadastrar({ nome, email, senha, perfil: this.perfil() });
    if (!resultado.ok) {
      if (resultado.erro === 'Este e-mail já está cadastrado') {
        this.erroEmailCadastro.set(resultado.erro);
      } else {
        this.erroGeralCadastro.set(resultado.erro);
      }
      return;
    }
    this.router.navigateByUrl(this.auth.rotaInicial());
  }
}
