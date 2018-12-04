import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CalendarModule, AccordionModule, DataListModule } from 'primeng/primeng';
import {
  MatButtonModule, MatListModule, MatCardModule, MatSnackBarModule, MatNativeDateModule,
  MatDialogModule, MatChipsModule, MatInputModule, MatSelectModule, MatAutocompleteModule ,
   MatCheckboxModule, MatRadioModule, MatSlideToggleModule, MatExpansionModule, MatDatepickerModule } from '@angular/material';

import { ComponentModule } from '../components/component.module';
import { StixService } from './stix.service';
import { StixRoutingModule } from './stix-routing.module';
import { IdentifierTypePipe, IdentifierSummarizedPipe } from '../pipes';
import { DiffMatchPatchModule } from 'ng-diff-match-patch';
import { PopoverModule } from 'ngx-popover';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

import {
  AttackPatternListComponent, AttackPatternsHomeComponent,
  AttackPatternComponent, AttackPatternNewComponent,
  AttackPatternPreNewComponent, AttackPatternMobileNewComponent,
  AttackPatternEditComponent, AttackPatternPreEditComponent, AttackPatternMobileEditComponent } from './stix-objects/attack-patterns';
import {
  CampaignsHomeComponent,
  CampaignsListComponent,
  CampaignsNewComponent,
  CampaignsEditComponent, CampaignComponent } from './stix-objects/campaigns';
import {
    CourseOfActionHomeComponent,
    CourseOfActionListComponent,
    CourseOfActionEditComponent,
    CourseOfActionNewComponent,
    CourseOfActionComponent } from './stix-objects/course-of-actions';

import {
    XMitreTacticHomeComponent,
    XMitreTacticListComponent,
    XMitreTacticComponent,
    XMitreTacticNewComponent,
    XMitreTacticEditComponent } from './stix-objects/x-mitre-tactics';

import {
    XMitreMatrixHomeComponent,
    XMitreMatrixListComponent,
    XMitreMatrixComponent,
    XMitreMatrixNewComponent,
    XMitreMatrixEditComponent 
}from './stix-objects/x-mitre-matrices';

import {
    SightingHomeComponent,
    SightingListComponent,
    SightingNewComponent,
    SightingEditComponent,
    SightingComponent } from './stix-objects/sightings';

import { CitationsHomeComponent } from './stix-objects/citations';
import { HistoryHomeComponent } from './stix-objects/history';
import { TacticsHomeComponent } from './stix-objects/tactics';
import { SensorHomeComponent, SensorListComponent, SensorNewComponent, SensorEditComponent, SensorComponent } from './stix-objects/sensors';
import { ReportsComponent, ReportsListComponent, ReportNewComponent } from './stix-objects/reports';
import { ThreatActorHomeComponent, ThreatActorListComponent, ThreatActorsComponent, ThreatActorNewComponent, ThreatActorEditComponent } from './stix-objects/threat-actors';
import { IntrusionSetHomeComponent, IntrusionSetListComponent, IntrusionSetComponent, IntrusionSetEditComponent, IntrusionSetNewComponent } from './stix-objects/intrusion-sets';
import { MitigateListComponent, MitigateComponent, IntrusionUsesAttackComponent, RelationshipsComponent, RelationshipNewComponent } from './stix-objects/relationships';
import { IndicatorHomeComponent , IndicatorListComponent, IndicatorEditComponent, IndicatorNewComponent, IndicatorComponent } from './stix-objects/indicators';
import { IdentityHomeComponent , IdentityListComponent, IdentityEditComponent, IdentityNewComponent, IdentityComponent } from './stix-objects/identities';
import { SoftwareHomeComponent, SoftwareListComponent, SoftwareComponent, SoftwareEditComponent, SoftwareNewComponent } from './stix-objects/software';
import { MalwareHomeComponent, MalwareListComponent, MalwareComponent, MalwareEditComponent, MalwareNewComponent } from './stix-objects/malwares';
import { ToolHomeComponent, ToolListComponent, ToolComponent, ToolEditComponent, ToolNewComponent } from './stix-objects/tools';
import { LinkExplorerComponent } from './link-explorer';
import { StixHomeComponent } from './stix-home.component';
import { GlobalModule } from '../global/global.module';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatSnackBarModule,
      MatButtonModule,
      MatListModule,
      MatCardModule,
      MatChipsModule,
      MatInputModule,
      MatSelectModule,
      MatAutocompleteModule,
      MatNativeDateModule,
      MatCheckboxModule,
      MatExpansionModule,
      MatRadioModule,
      MatSlideToggleModule,
      MatDatepickerModule,
      ComponentModule,
      CalendarModule,
      AccordionModule,
      DataListModule,
      StixRoutingModule,
      GlobalModule,
      DiffMatchPatchModule,
      PopoverModule,
      AngularDateTimePickerModule,
      ClipboardModule
  ],
  declarations: [
    // Components / Directives/ Pipes
    AttackPatternsHomeComponent,
    AttackPatternListComponent,
    AttackPatternComponent,
    AttackPatternNewComponent,
    AttackPatternPreNewComponent,
    AttackPatternMobileNewComponent,
    AttackPatternEditComponent,
    AttackPatternPreEditComponent,
    AttackPatternMobileEditComponent,

    CampaignsHomeComponent,
    CampaignsListComponent,
    CampaignsNewComponent,
    CampaignsEditComponent,
    CampaignComponent,

    CourseOfActionHomeComponent,
    CourseOfActionListComponent,
    CourseOfActionEditComponent,
    CourseOfActionNewComponent,
    CourseOfActionComponent,

    XMitreTacticHomeComponent,
    XMitreTacticListComponent,
    XMitreTacticComponent,
    XMitreTacticNewComponent,
    XMitreTacticEditComponent,

    XMitreMatrixHomeComponent,
    XMitreMatrixListComponent,
    XMitreMatrixComponent,
    XMitreMatrixNewComponent,
    XMitreMatrixEditComponent,

    CitationsHomeComponent,

    HistoryHomeComponent,

    TacticsHomeComponent,
    
    SightingHomeComponent,
    SightingListComponent,
    SightingNewComponent,
    SightingEditComponent,
    SightingComponent,

    SensorHomeComponent,
    SensorListComponent,
    SensorNewComponent,
    SensorEditComponent,
    SensorComponent,

    ReportsComponent,
    ReportsListComponent,
    ReportNewComponent,

    ThreatActorHomeComponent,
    ThreatActorListComponent,
    ThreatActorsComponent,
    ThreatActorNewComponent,
    ThreatActorEditComponent,

    IntrusionSetHomeComponent,
    IntrusionSetListComponent,
    IntrusionSetComponent,
    IntrusionSetEditComponent,
    IntrusionSetNewComponent,

    MitigateListComponent,
    MitigateComponent,
    IntrusionUsesAttackComponent,
    IndicatorHomeComponent,
    IndicatorListComponent,
    IndicatorEditComponent,
    IndicatorNewComponent,
    IndicatorComponent,

    IdentityHomeComponent,
    IdentityListComponent,
    IdentityEditComponent,
    IdentityNewComponent,
    IdentityComponent,

    IdentifierTypePipe,
    IdentifierSummarizedPipe,

    MalwareHomeComponent,
    MalwareListComponent,
    MalwareEditComponent,
    MalwareComponent,
    MalwareNewComponent,
    RelationshipsComponent,
    RelationshipNewComponent,
    ToolHomeComponent,
    ToolListComponent,
    ToolComponent,
    ToolEditComponent,
    ToolNewComponent,
    SoftwareHomeComponent,
    SoftwareListComponent,
    SoftwareComponent,
    SoftwareEditComponent,
    SoftwareNewComponent,
    LinkExplorerComponent,
    StixHomeComponent
  ],

  providers: [ StixService ],
})
export class StixModule {}
