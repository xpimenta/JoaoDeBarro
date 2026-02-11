import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/app-shell/app-shell.component')
        .then(m => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./domains/finance/dashboard/pages/dashboard.page')
            .then(m => m.DashboardPage)
      },
      {
        path: 'finance/ap-ar/receivables',
        loadComponent: () =>
          import('./domains/finance/ap-ar/receivables/pages/receivables-list/receivables-list.page')
            .then(m => m.ReceivablesPage)
      },
      {
        path: 'finance/ap-ar/receivables/new',
        loadComponent: () =>
          import('./domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page')
            .then(m => m.ReceivableFormPage)
      },
      {
        path: 'finance/ap-ar/receivables/:id/edit',
        loadComponent: () =>
          import('./domains/finance/ap-ar/receivables/pages/receivable-form/receivable-form.page')
            .then(m => m.ReceivableFormPage)
      },
      {
        path: 'finance/ap-ar/payables',
        loadComponent: () =>
          import('./domains/finance/ap-ar/payables/pages/payables.page')
            .then(m => m.PayablesPage)
      }
    ]
  }
];
