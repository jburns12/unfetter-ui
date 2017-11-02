import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternEditComponent } from '../attack-pattern-edit/attack-patterns-edit.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, CourseOfAction, ExternalReference, Relationship } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
    selector: 'attack-pattern-new',
    templateUrl: './attack-pattern-new.component.html'
})
export class AttackPatternNewComponent extends AttackPatternEditComponent implements OnInit {
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
              this.getPlatforms();
              this.getContributors();
              this.getDataSources();
              this.getId();
              super.getCitations();
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
         let idRef = new ExternalReference();
         idRef.external_id = this.id;
         idRef.source_name = 'mitre-attack';
         this.attackPattern.attributes.external_references.push(idRef);
         this.attackPattern.attributes.external_references.reverse();
         this.removeEmpties();
         let sub = super.create(this.attackPattern).subscribe(
            (data) => {
                 this.location.back();
                 this.saveCourseOfAction(data[0].id);
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
