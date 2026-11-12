import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DemoStore } from '../../../core/demo-store.service';
import { Quadra, TipoQuadra } from '../../../core/models';
import { ModalComponent } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-arena',
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './arena.html',
})
export class ArenaComponent {
  private readonly store = inject(DemoStore);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly arena = this.store.arenaDoGestor;
  readonly quadras = this.store.quadrasDaArena;
  readonly mostrarFormularioQuadra = signal(false);
  readonly quadraEditando = signal<Quadra | null>(null);
  readonly quadraExcluindo = signal<Quadra | null>(null);

  readonly formArena = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    bairro: ['', [Validators.required]],
    telefone: ['', [Validators.required]],
    prazoCancelamentoHoras: [24, [Validators.required, Validators.min(0)]],
  });

  readonly formQuadra = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    tipo: ['Society' as TipoQuadra, [Validators.required]],
  });

  constructor() {
    const arena = this.arena();
    if (arena) {
      this.formArena.patchValue({
        nome: arena.nome,
        bairro: arena.bairro,
        telefone: arena.telefone,
        prazoCancelamentoHoras: arena.prazoCancelamentoHoras,
      });
    }
  }

  salvarArena(): void {
    this.formArena.markAllAsTouched();
    if (this.formArena.invalid) {
      return;
    }
    const resultado = this.store.salvarArena(this.formArena.getRawValue());
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Arena salva');
  }

  abrirNovaQuadra(): void {
    this.quadraEditando.set(null);
    this.formQuadra.reset({ nome: '', tipo: 'Society' });
    this.mostrarFormularioQuadra.set(true);
  }

  editarQuadra(quadra: Quadra): void {
    this.quadraEditando.set(quadra);
    this.formQuadra.patchValue({ nome: quadra.nome, tipo: quadra.tipo });
    this.mostrarFormularioQuadra.set(true);
  }

  cancelarQuadra(): void {
    this.mostrarFormularioQuadra.set(false);
    this.quadraEditando.set(null);
    this.formQuadra.reset({ nome: '', tipo: 'Society' });
  }

  salvarQuadra(): void {
    this.formQuadra.markAllAsTouched();
    const arena = this.arena();
    if (this.formQuadra.invalid || !arena) {
      return;
    }
    const editando = this.quadraEditando();
    const { nome, tipo } = this.formQuadra.getRawValue();
    const resultado = this.store.salvarQuadra(arena.id, { nome, tipo }, editando?.id);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar(editando ? 'Quadra atualizada' : 'Quadra adicionada');
    this.cancelarQuadra();
  }

  pedirExclusao(quadra: Quadra): void {
    this.quadraExcluindo.set(quadra);
  }

  confirmarExclusao(): void {
    const quadra = this.quadraExcluindo();
    if (!quadra) {
      return;
    }
    const resultado = this.store.excluirQuadra(quadra.id);
    this.quadraExcluindo.set(null);
    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      return;
    }
    this.toast.mostrar('Quadra excluída');
    if (this.quadraEditando()?.id === quadra.id) {
      this.cancelarQuadra();
    }
  }
}
