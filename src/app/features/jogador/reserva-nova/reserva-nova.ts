import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DemoStore } from '../../../core/demo-store.service';
import { gerarHorarios } from '../../../core/agenda.util';
import { formatarMoeda, rotuloDia } from '../../../core/datas.util';
import { EstadoVazioComponent } from '../../../shared/estado-vazio/estado-vazio';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-reserva-nova',
  imports: [FormsModule, EstadoVazioComponent],
  templateUrl: './reserva-nova.html',
})
export class ReservaNovaComponent {
  private readonly store = inject(DemoStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  readonly arenaId = this.params.get('arena') ?? '';
  readonly quadraId = this.params.get('quadra') ?? '';
  readonly data = this.params.get('data') ?? '';
  readonly hora = this.params.get('hora') ?? '';
  readonly observacao = signal('');

  readonly arena = computed(() => this.store.arenaPorId(this.arenaId) ?? null);
  readonly quadra = computed(() => this.store.quadraPorId(this.quadraId) ?? null);
  readonly horario = computed(() => {
    const quadra = this.quadra();
    return quadra
      ? (gerarHorarios(quadra, this.data).find((item) => item.hora === this.hora) ?? null)
      : null;
  });
  readonly valido = computed(
    () => this.arena() !== null && this.quadra() !== null && this.horario() !== null,
  );

  enviar(): void {
    const resultado = this.store.criarReserva({
      arenaId: this.arenaId,
      quadraId: this.quadraId,
      data: this.data,
      hora: this.hora,
      observacao: this.observacao(),
    });

    if (!resultado.ok) {
      this.toast.mostrar(resultado.erro, 'erro');
      this.router.navigate(['/agenda']);
      return;
    }

    this.router.navigate(['/reserva/enviada', resultado.valor]);
  }

  voltar(): void {
    this.router.navigate(['/agenda']);
  }

  valor(): string {
    return formatarMoeda(this.quadra()?.valor ?? 0);
  }

  diaPorExtenso(): string {
    return this.data ? rotuloDia(this.data) : '';
  }
}
