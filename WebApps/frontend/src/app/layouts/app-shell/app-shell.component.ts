import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TranslateModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  private translate = inject(TranslateService);

  constructor() {
    this.translate.setDefaultLang('pt-BR');
    this.translate.use('pt-BR');
  }
}
