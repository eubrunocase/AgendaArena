import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav';
import { HeaderComponent } from './shared/header/header';
import { ToastComponent } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, BottomNavComponent, ToastComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly auth = inject(AuthService);
  readonly autenticado = this.auth.estaAutenticado;
}
