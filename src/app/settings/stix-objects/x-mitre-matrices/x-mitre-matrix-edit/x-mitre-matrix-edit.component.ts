import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
import { XMitreMatrixComponent } from '../x-mitre-matrix/x-mitre-matrix.component';
import { StixService } from '../../../stix.service';
import { ExternalReference } from '../../../../models';
import { Motivation } from '../../../../models/motivation.enum';
import { ResourceLevel } from '../../../../models/resource-level.enum';
import { SortHelper } from '../../../../assessments/assessments-summary/sort-helper';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import {
  XMitreMatrix,
  XMitreTactic,
  AttackPattern,
  Identity,
  ThreatActor,
  Relationship
} from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
  selector: 'x-mitre-matrix-edit',
  templateUrl: './x-mitre-matrix-edit.component.html',
})
export class XMitreMatrixEditComponent extends XMitreMatrixComponent implements OnInit {
    public motivations = new Set(Motivation.values().map((el) => el.toString()).sort(SortHelper.sortDesc()));
    public resourceLevels = new Set(ResourceLevel.values().map((el) => el.toString()).sort(SortHelper.sortDesc()));
    public motivationCtrl: FormControl;
    public resourceLevelCtrl: FormControl;
    public editComponent: boolean = true;
    public target: any;
    public relationship: Relationship = new Relationship();

    public attackPatterns: AttackPattern[] = [];
    public identities: Identity[] = [];
    public threatActors: ThreatActor[] = [];
    public contributors: string[] = [];
    public allCitations: any = [];
    public createNewOnly: boolean = true;
    public addId: boolean = false;
    public xMitreMatrices: XMitreMatrix[];
    public revokedBy: any = '';
    public foundRevoked: string = '';
    public origTarget: string = '';
    public idLink: string = "{{LinkById|";

   constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        this.motivationCtrl = new FormControl();
        this.resourceLevelCtrl = new FormControl();
    }

    public ngOnInit() {
       super.loadxMitreMatrix();
       let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
       let subscription = super.load(filter).subscribe(
           (data) => {
               this.xMitreMatrices = data as XMitreMatrix[];
               this.findRevokedBy();
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



    public findRevokedBy(): void  {
        let filter = { 'stix.source_ref': this.xMitreMatrix.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.target = data as Relationship[];
                this.target.forEach((relationship: Relationship) => {
                    if (relationship.attributes.relationship_type === 'revoked-by') {
                        this.foundRevoked = relationship.id;
                        this.origTarget = relationship.attributes.target_ref;
                    }
                });
                if (this.foundRevoked !== '') {
                    this.revokedBy = this.xMitreMatrices.find((p) => (p.id === this.origTarget));
                }
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

    public saveRevokedDeleteOld(source_ref, target_ref): void {
        this.relationship.attributes.source_ref = source_ref;
        this.relationship.attributes.target_ref = target_ref;
        this.relationship.attributes.relationship_type = 'revoked-by';
        this.relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
        this.stixService.url = Constance.RELATIONSHIPS_URL;
        let subscription = super.create(this.relationship).subscribe(
            (data) => {
                console.log(data);
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
        let relationship = new Relationship();
        relationship.id = this.foundRevoked;
        relationship.url = Constance.RELATIONSHIPS_URL;
        this.delete(relationship, false).subscribe(
            () => {

            }
        );
    }

    public saveRevoked(source_ref, target_ref): void {
        if (this.revokedBy !== '') {
            this.relationship.attributes.source_ref = source_ref;
            this.relationship.attributes.target_ref = target_ref;
            this.relationship.attributes.relationship_type = 'revoked-by';
            this.relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
            if (this.foundRevoked === '') {
                this.stixService.url = Constance.RELATIONSHIPS_URL;
                let subscription = super.create(this.relationship).subscribe(
                    (data) => {
                        console.log(data);
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
            else {
                this.relationship.id = this.foundRevoked;
                this.stixService.url = Constance.RELATIONSHIPS_URL;
                let subscription = super.save(this.relationship).subscribe(
                    (data) => {
                        console.log(data);
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
        }
    }

    public addTacticsToMatrix(): void {
        this.xMitreMatrix.attributes.tactic_refs = [];
        this.tactic_refs.forEach((tactic: XMitreTactic) => {
            this.xMitreMatrix.attributes.tactic_refs.push(tactic.id);
        });
    }

    public addRemoveId() {
        this.addId = !this.addId;
    }

    public saveIdentity(): void {
        console.log(this.deprecated);
        if (this.deprecated === true) {
            this.xMitreMatrix.attributes.x_mitre_deprecated = true;
        }
        else {
            if (this.xMitreMatrix.attributes.x_mitre_deprecated !== undefined) {
                this.xMitreMatrix.attributes.x_mitre_deprecated = false;
            }
        }
        if (this.revoked === true) {
            this.xMitreMatrix.attributes.revoked = true;
        }
        else {
            if (this.xMitreMatrix.attributes.revoked !== undefined) {
                this.xMitreMatrix.attributes.revoked = false;
            }
        }
        this.addTacticsToMatrix();
        const sub = super.saveButtonClicked().subscribe(
            (data) => {
                this.location.back();
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

    public saveRelationship(source_ref: string, target_ref: string, description: string, id: string): void {
        let relationship = new Relationship();
        relationship.attributes.source_ref = source_ref;
        relationship.attributes.target_ref = target_ref;
        relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
        if (description !== '') {
            relationship.attributes.external_references = [];
            relationship.attributes.description = description;
            let citationArr = super.matchCitations(relationship.attributes.description);
            for (let name of citationArr) {
                let citation = this.allCitations.find((p) => p.source_name === name);
                if (citation !== undefined) {
                    relationship.attributes.external_references.push(citation);
                }
            }
        }
        relationship.attributes.relationship_type = 'uses';
        if (id !== '') {
            relationship.id = id;
            console.log(relationship);
            if (description == '') {
                relationship.attributes.external_references = [];
                relationship.attributes.description = description;
            }
            this.stixService.url = Constance.RELATIONSHIPS_URL;
            let subscription = super.save(relationship).subscribe(
                (data) => {
                    console.log(data);
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
        } else {
            let subscription = super.create(relationship).subscribe(
                (data) => {
                    console.log(data);
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
    }

    public filterOptions(stringToMatch: string, listToParse: any): void {
        if (stringToMatch) {
            let filterVal = stringToMatch.toLowerCase();
            return listToParse.filter((h) => h.toLowerCase().startsWith(filterVal));
        }
        return listToParse;
    }

    private found(list: any[], object: any): any {
        return list.find( (entry) => entry.id === object.id );
    }
}
