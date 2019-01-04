import {
  NgModule
} from '@angular/core';
import {
  RouterModule,
  Routes
} from '@angular/router';

import {
  AttackPatternListComponent,
  AttackPatternsHomeComponent,
  AttackPatternComponent,
  AttackPatternNewComponent,
  AttackPatternPreNewComponent,
  AttackPatternMobileNewComponent,
  AttackPatternEditComponent,
  AttackPatternPreEditComponent,
  AttackPatternMobileEditComponent
} from './stix-objects/attack-patterns';

import {
  CampaignsHomeComponent,
  CampaignsListComponent,
  CampaignsNewComponent,
  CampaignsEditComponent,
  CampaignComponent
} from './stix-objects/campaigns';

import {
  CourseOfActionHomeComponent,
  CourseOfActionListComponent,
  CourseOfActionEditComponent,
  CourseOfActionComponent,
  CourseOfActionNewComponent
} from './stix-objects/course-of-actions';

import {
  SightingHomeComponent,
  SightingListComponent,
  SightingNewComponent,
  SightingEditComponent,
  SightingComponent
} from './stix-objects/sightings';

import {
  ThreatActorHomeComponent,
  ThreatActorListComponent,
  ThreatActorsComponent,
  ThreatActorNewComponent,
  ThreatActorEditComponent
} from './stix-objects/threat-actors';
import {
  IntrusionSetHomeComponent,
  IntrusionSetListComponent,
  IntrusionSetComponent,
  IntrusionSetEditComponent,
  IntrusionSetNewComponent
} from './stix-objects/intrusion-sets';
import {
  IndicatorHomeComponent,
  IndicatorListComponent,
  IndicatorEditComponent,
  IndicatorNewComponent,
  IndicatorComponent
} from './stix-objects/indicators';
import {
  IdentityHomeComponent,
  IdentityListComponent,
  IdentityEditComponent,
  IdentityNewComponent,
  IdentityComponent
} from './stix-objects/identities';

import {
  MitigateListComponent,
  MitigateComponent,
  IntrusionUsesAttackComponent
} from './stix-objects/relationships';
import {
  ReportsComponent,
  ReportsListComponent,
  ReportNewComponent,
} from './stix-objects/reports';
import {
  SoftwareHomeComponent,
  SoftwareListComponent,
  SoftwareComponent,
  SoftwareEditComponent,
  SoftwareNewComponent
} from './stix-objects/software';
import {
  LinkExplorerComponent
} from './link-explorer';

import {
  StixHomeComponent
} from './stix-home.component';

import {
  SensorHomeComponent,
  SensorListComponent,
  SensorComponent,
  SensorEditComponent,
  SensorNewComponent
} from './stix-objects/sensors';

import {
  XMitreTacticHomeComponent,
  XMitreTacticListComponent,
  XMitreTacticComponent,
  XMitreTacticNewComponent,
  XMitreTacticEditComponent
} from './stix-objects/x-mitre-tactics';

import {
  XMitreMatrixHomeComponent,
  XMitreMatrixListComponent,
  XMitreMatrixComponent,
  XMitreMatrixNewComponent,
  XMitreMatrixEditComponent
} from './stix-objects/x-mitre-matrices';

import {
  CitationsHomeComponent
} from './stix-objects/citations';

import {
  HistoryHomeComponent
} from './stix-objects/history';

import {
  TacticsHomeComponent
} from './stix-objects/tactics';

import { AuthGuard } from '../global/services/auth.guard';

const stixRoutes: Routes = [{
    path: 'stix',
    canActivate: [AuthGuard],
    component: StixHomeComponent,
    children: [
      {
        path: '',
        redirectTo: '/stix/attack-patterns',
        pathMatch: 'full',
      },
      {
        path: 'attack-patterns',
        component: AttackPatternsHomeComponent,
        children: [{
            path: '',
            component: AttackPatternListComponent
          },
          {
            path: 'new-enterprise',
            component: AttackPatternNewComponent
          },
          {
            path: 'new-pre',
            component: AttackPatternPreNewComponent
          },
          {
            path: 'new-mobile',
            component: AttackPatternMobileNewComponent
          },
          {
            path: ':id',
            component: AttackPatternComponent
          },
          {
            path: 'edit/:id',
            component: AttackPatternEditComponent
          },
          {
            path: 'edit-pre/:id',
            component: AttackPatternPreEditComponent
          },
          {
            path: 'edit-mobile/:id',
            component: AttackPatternMobileEditComponent
          }
        ],
      },
      {
        path: 'campaigns',
        component: CampaignsHomeComponent,
        children: [{
            path: '',
            component: CampaignsListComponent
          },
          {
            path: 'new',
            component: CampaignsNewComponent
          },
          {
            path: ':id',
            component: CampaignComponent
          },
          {
            path: 'edit/:id',
            component: CampaignsEditComponent
          }
        ]
      },
      {
        path: 'citations',
        component: CitationsHomeComponent
      },
      {
        path: 'tactics/:domain',
        component: TacticsHomeComponent,

      },
      {
        path: 'tactics/:domain/:tactic',
        component: TacticsHomeComponent,
      },
      {
        path: 'history',
        component: HistoryHomeComponent,
      },
      {
        path: 'course-of-actions',
        component: CourseOfActionHomeComponent,
        children: [{
            path: '',
            component: CourseOfActionListComponent
          },
          {
            path: 'new',
            component: CourseOfActionNewComponent
          },
          {
            path: ':id',
            component: CourseOfActionComponent
          },
          {
            path: 'edit/:id',
            component: CourseOfActionEditComponent
          }
        ]
      },
      {
        path: 'sightings',
        component: SightingHomeComponent,
        children: [{
            path: '',
            component: SightingListComponent
          },
          {
            path: 'new',
            component: SightingNewComponent
          },
          {
            path: ':id',
            component: SightingComponent
          },
          {
            path: 'edit/:id',
            component: SightingEditComponent
          }
        ]
      },
      {
        path: 'reports',
        component: ReportsComponent,
        children: [{
            path: '',
            component: ReportsListComponent
          },
          {
            path: 'new',
            component: ReportNewComponent
          },

        ]
      },
      {
        path: 'threat-actors',
        component: ThreatActorHomeComponent,
        children: [{
            path: '',
            component: ThreatActorListComponent
          },
          {
            path: 'new',
            component: ThreatActorNewComponent
          },
          {
            path: ':id',
            component: ThreatActorsComponent
          },
          {
            path: 'edit/:id',
            component: ThreatActorEditComponent
          }
        ]
      },
      {
        path: 'intrusion-sets',
        component: IntrusionSetHomeComponent,
        children: [{
            path: '',
            component: IntrusionSetListComponent
          },
          {
            path: 'new',
            component: IntrusionSetNewComponent
          },
          {
            path: ':id',
            component: IntrusionSetComponent
          },
          {
            path: 'edit/:id',
            component: IntrusionSetEditComponent
          }
        ]
      },
      {
        path: 'relationships',
        children: [{
            path: 'mitigates/:type/:action',
            component: MitigateListComponent
          },
          {
            path: 'mitigates/:id',
            component: MitigateComponent
          },
          {
            path: 'intrusion-uses-attack/:id',
            component: IntrusionUsesAttackComponent
          },
        ]
      },
      {
        path: 'indicators',
        component: IndicatorHomeComponent,
        children: [{
            path: '',
            component: IndicatorListComponent
          },
          {
            path: 'new',
            component: IndicatorNewComponent
          },
          {
            path: ':id',
            component: IndicatorComponent
          },
          {
            path: 'edit/:id',
            component: IndicatorEditComponent
          }
        ]
      },
      {
        path: 'identities',
        component: IdentityHomeComponent,
        children: [{
            path: '',
            component: IdentityListComponent
          },
          {
            path: 'new',
            component: IdentityNewComponent
          },
          {
            path: ':id',
            component: IdentityComponent
          },
          {
            path: 'edit/:id',
            component: IdentityEditComponent
          }
        ]
      },
      {
        path: 'softwares',
        component: SoftwareHomeComponent,
        children: [{
            path: '',
            component: SoftwareListComponent
          },
          {
            path: 'new',
            component: SoftwareNewComponent
          },
          {
            path: ':id',
            component: SoftwareComponent
          },
          {
            path: 'edit/:id',
            component: SoftwareEditComponent
          }
        ]
      },
      {
        path: 'x-mitre-tactics',
        component: XMitreTacticHomeComponent,
        children: [{
            path: '',
            component: XMitreTacticListComponent
          },
          {
            path: 'new',
            component: XMitreTacticNewComponent
          },
          {
            path: ':id',
            component: XMitreTacticComponent
          },
          {
            path: 'edit/:id',
            component: XMitreTacticEditComponent
          }
        ]
      },
      {
        path: 'x-mitre-matrices',
        component: XMitreMatrixHomeComponent,
        children: [{
            path: '',
            component: XMitreMatrixListComponent
          },
          {
            path: 'new',
            component: XMitreMatrixNewComponent
          },
          {
            path: ':id',
            component: XMitreMatrixComponent
          },
          {
            path: 'edit/:id',
            component: XMitreMatrixEditComponent
          }
        ]
      },
      // { path: 'tool', component: ToolHomeComponent,
      //   children: [
      //       { path: 'new', component: ToolNewComponent },
      //       { path: ':id', component: ToolComponent },
      //       { path: 'edit/:id', component: ToolEditComponent }
      //   ]
      // },
      {
        path: 'link-explorer',
        component: LinkExplorerComponent
      },
      {
        path: 'x-unfetter-sensors',
        component: SensorHomeComponent,
        children: [{
            path: '',
            component: SensorListComponent
          },
          {
            path: 'new',
            component: SensorNewComponent
          },
          {
            path: ':id',
            component: SensorComponent
          },
          {
            path: 'edit/:id',
            component: SensorEditComponent
          }
        ]
      },
    ]
  }

];

@NgModule({
  imports: [
    RouterModule.forChild(stixRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [],
})
export class StixRoutingModule {}
