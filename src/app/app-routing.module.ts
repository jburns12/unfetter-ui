import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home';
import { IntrusionSetDashboardComponent } from './intrusion-set-dashboard/intrusion-set-dashboard.component';
import { PartnersComponent } from './partners/partners.component';
import { NoContentComponent } from './no-content';
import { AttackPatternComponent } from './settings/stix-objects/attack-patterns/attack-pattern/attack-pattern.component';

// import { CanDeactivateGuard }       from './can-deactivate-guard.service';
// import { AuthGuard }                from './auth-guard.service';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';

const appRoutes: Routes = [
  { path: '', redirectTo: 'stix/attack-patterns', pathMatch: 'full' },
  { path: 'home', redirectTo: 'stix/attack-patterns', pathMatch: 'full' },
  { path: 'partners', component: PartnersComponent },
  { path: 'intrusion-set-dashboard', component: IntrusionSetDashboardComponent },
  { path: 'assessments', loadChildren: './assessments#AssessmentsModule' },
  { path: 'tro', loadChildren: 'app/threat-report-overview/threat-report-overview.module#ThreatReportOverviewModule' },
  { path: '**', component: NoContentComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { useHash: true, preloadingStrategy: SelectivePreloadingStrategy }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SelectivePreloadingStrategy
  ]
})
export class AppRoutingModule { }
