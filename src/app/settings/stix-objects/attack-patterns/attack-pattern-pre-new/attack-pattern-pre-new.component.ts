import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternEditComponent } from '../attack-pattern-edit/attack-patterns-edit.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, CourseOfAction, ExternalReference, Relationship } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
    selector: 'attack-pattern-pre-new',
    templateUrl: './attack-pattern-pre-new.component.html'
})
export class AttackPatternPreNewComponent extends AttackPatternEditComponent implements OnInit {
    public attackPatterns: any;

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
      let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
      let subscription = super.load(filter).subscribe(
          (data) => {
              this.attackPatterns = data as AttackPattern[];
              this.attackPattern.attributes.x_mitre_difficulty_for_adversary = "Yes";
              this.attackPattern.attributes.x_mitre_detectable_by_common_defenses = "Yes";
              this.getConfigs('prepare');
              this.getContributors();
              this.getId();
              this.getCitations();
          }, (error) => {
              // handle errors here
              console.log('error ' + error);
          }, () => {
              // prevent memory links
              if (subscription) {
                  subscription.unsubscribe();
              }
          }
      );
    }

     public saveAttackPattern(): void {
        this.removeEmpties();
        if (this.addId) {
            this.mitreId = new ExternalReference();
            this.mitreId.external_id = this.id;
            this.mitreId.source_name = 'mitre-attack';
            this.mitreId.url = 'https://attack.mitre.org/wiki/Technique/' + this.id
        } else {
            this.mitreId = new ExternalReference();
            this.mitreId.source_name = 'mitre-attack';
        }
        this.addExtRefs();
        this.attackPattern.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];

        let sub = super.create(this.attackPattern).subscribe(
            (data) => {
                 this.location.back();
                 this.saveCoursesOfAction(data[0].id, this.allCitations);
            }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }
}
