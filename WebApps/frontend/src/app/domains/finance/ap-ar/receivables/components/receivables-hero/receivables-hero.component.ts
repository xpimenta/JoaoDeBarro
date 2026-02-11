import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-receivables-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TranslateModule],
  templateUrl: './receivables-hero.component.html',
  styleUrl: './receivables-hero.component.scss'
})
export class ReceivablesHeroComponent {
  @Input({ required: true }) totalRows = 0;
  @Input({ required: true }) pendingItems = 0;
  @Input() hasAnyFilters = false;
  @Input() visibleRows = 0;
}
