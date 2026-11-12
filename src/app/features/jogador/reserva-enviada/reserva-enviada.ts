import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DemoStore } from '../../../core/demo-store.service';
import { formatarMoeda, rotuloDia } from '../../../core/datas.util';
import { ChipStatusComponent } from '../../../shared/chip-status/chip-status';
import { EstadoVazioComponent } from '../../../shared/estado-vazio/estado-vazio';

@Component({
  selector: 'app-reserva-enviada',
  imports: [RouterLink, ChipStatusComponent, EstadoVazioComponent],
  templateUrl: './reserva-enviada.html',
})
export class ReservaEnviadaComponent {
  private readonly store = inject(DemoStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly reservaId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  readonly reserva = computed(() => {
    const jogador = this.auth.usuario();
    return (
      this.store
        .reservas()
        .find((reserva) => reserva.id === this.reservaId && reserva.jogadorId === jogador?.id) ??
      null
    );
  });
  readonly protocolo = computed(() => this.reserva()?.id.slice(0, 8).toUpperCase() ?? '');

  valor(): string {
    return formatarMoeda(this.reserva()?.valor ?? 0);
  }

  dia(): string {
    return this.reserva() ? rotuloDia(this.reserva()!.data) : '';
  }

  voltarInicio(): void {
    this.router.navigateByUrl('/agenda');
  }
}
