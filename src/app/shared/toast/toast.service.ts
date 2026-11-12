import { Injectable, signal } from '@angular/core';

export type TipoToast = 'sucesso' | 'erro' | 'info';

export interface Toast {
  mensagem: string;
  tipo: TipoToast;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toast = signal<Toast | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  mostrar(mensagem: string, tipo: TipoToast = 'sucesso'): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.toast.set({ mensagem, tipo });
    this.timer = setTimeout(() => this.toast.set(null), 3600);
  }

  fechar(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.toast.set(null);
  }
}
