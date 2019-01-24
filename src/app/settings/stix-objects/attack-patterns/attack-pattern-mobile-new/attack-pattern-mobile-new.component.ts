import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternEditComponent } from '../attack-pattern-edit/attack-patterns-edit.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, CourseOfAction, ExternalReference, Relationship } from '../../../../models';
import { Constance } from '../../../../utils/constance';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'attack-pattern-mobile-new',
    templateUrl: './attack-pattern-mobile-new.component.html'
})
export class AttackPatternMobileNewComponent extends AttackPatternEditComponent implements OnInit {
    public attackPatterns: any;
    public rateControl: any;

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
      this.rateControl = new FormControl('', [Validators.min(0)]);
      let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
      let subscription = super.load(filter).subscribe(
          (data) => {
              this.attackPatterns = data as AttackPattern[];
              this.getConfigs('mobile-attack');
              this.getContributors();
              this.getId();
              this.getMitId();
              this.assignCoaCitations();
              this.getCitations();
              this.getAllCoAs();
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

    public assignCoaCitations(): void {
        for (let i in this.courseOfAction.attributes.external_references) {
            this.courseOfAction.attributes.external_references[i].citeButton = 'Generate Citation Text';
            this.courseOfAction.attributes.external_references[i].citation = '(Citation: ' + this.courseOfAction.attributes.external_references[i].source_name + ')';
            this.courseOfAction.attributes.external_references[i].citeref = '[[CiteRef::' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
        }
    }

    public addMtcId(): void {
        let id = {'category': {'category': '', 'val': ''}};
        this.mtc_ids.unshift(id);
    }

    public removeMtcId(id): void {
        console.log(this.mtc_ids);
        this.mtc_ids = this.mtc_ids.filter((h) => (JSON.stringify(h) !== JSON.stringify(id)));
    }

     public saveAttackPattern(): void {
        this.removeEmpties();
        if (this.addId) {
            this.mitreId = new ExternalReference();
            this.mitreId.external_id = this.id;
            this.mitreId.source_name = 'mitre-mobile-attack';
            this.mitreId.url = 'https://attack.mitre.org/techniques/' + this.id
        } else {
            this.mitreId = new ExternalReference();
            this.mitreId.source_name = 'mitre-mobile-attack';
        }
        this.addExtRefs();
        this.attackPattern.attributes.x_mitre_collections = ['2f669986-b40b-4423-b720-4396ca6a462b'];
        for (let i in this.attackPattern.attributes.kill_chain_phases) {
            this.attackPattern.attributes.kill_chain_phases[i].kill_chain_name = 'mitre-mobile-attack';
        }
        this.attackPattern.attributes.x_mitre_version = "1.0";
        let sub = super.create(this.attackPattern).subscribe(
            (data) => {
                 this.location.back();
                 this.saveCoursesOfActionMobile(data[0].id, this.allCitations);
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
