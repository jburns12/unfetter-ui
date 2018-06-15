import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternEditComponent } from '../attack-pattern-edit/attack-patterns-edit.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, CourseOfAction, ExternalReference, Relationship } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
    selector: 'attack-pattern-pre-edit',
    templateUrl: './attack-pattern-pre-edit.component.html'
})
export class AttackPatternPreEditComponent extends AttackPatternEditComponent implements OnInit {
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
      super.loadAttackPattern();
      let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
      let subscription = super.load(filter).subscribe(
          (data) => {
              console.log(this.attackPattern);
              this.attackPatterns = data as AttackPattern[];
              this.getConfigs('pre_attack_tactics');
              this.getContributors();
              this.findCoA();
              this.findRevokedBy();
              this.getCitations();
              this.assignCitations();
              this.getMitreId();
              this.getId();
              this.getDeprecated();
              this.getRevoked();
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
            this.courseOfAction.attributes.external_references[i].citation = '[[Citation: ' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
            this.courseOfAction.attributes.external_references[i].citeref = '[[CiteRef::' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
        }
    }
    
    public saveAttackPattern(): void {
        this.removeEmpties();
        if (this.mitreId === '' || this.mitreId === undefined ) {
            if (this.addId) {
                this.mitreId = new ExternalReference();
                this.mitreId.external_id = this.id;
                this.mitreId.source_name = 'mitre-pre-attack';
                this.mitreId.url = 'https://attack.mitre.org/wiki/Technique/' + this.id
            } else {
                this.mitreId = new ExternalReference();
                this.mitreId.source_name = 'mitre-pre-attack';
            }
        } else {
            this.mitreId.external_id = this.id;
            this.mitreId.url = 'https://attack.mitre.org/wiki/Technique/' + this.id
        }
        this.addExtRefs();
        if (this.deprecated === true) {
            this.attackPattern.attributes.x_mitre_deprecated = true;
        }
        else {
            if (this.attackPattern.attributes.x_mitre_deprecated !== undefined) {
                delete this.attackPattern.attributes['x_mitre_deprecated'];
            }
        }
        if (this.revoked === true) {
            this.attackPattern.attributes.revoked = true;
        }
        else {
            if (this.attackPattern.attributes.revoked !== undefined) {
                this.attackPattern.attributes.revoked = false;
            }
        }
        for (let i in this.attackPattern.attributes.kill_chain_phases) {
            this.attackPattern.attributes.kill_chain_phases[i].kill_chain_name = 'mitre-pre-attack';
        }
        let sub = super.saveButtonClicked().subscribe(
            (data) => {
                console.log(data);
                this.saveCoursesOfAction(data.id, this.allCitations);
                if (this.revoked) {
                    if (this.origTarget === '' || this.origTarget === this.revokedBy.id) {
                        this.saveRevoked(data.id, this.revokedBy.id);
                    }
                    else {
                        this.saveRevokedDeleteOld(data.id, this.revokedBy.id);
                    }
                }
                else {
                    if (this.foundRevoked !== '') {
                        let relationship = new Relationship();
                        relationship.id = this.foundRevoked;
                        relationship.url = Constance.RELATIONSHIPS_URL;
                        this.delete(relationship, false).subscribe(
                            () => {
                
                            }
                        );
                    }
                }
                this.location.back();
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
