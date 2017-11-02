import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
import { IntrusionSetEditComponent } from '../intrusion-set-edit/intrusion-set-edit.component';
import { StixService } from '../../../stix.service';
import { ExternalReference } from '../../../../models';
import { IntrusionSet } from '../../../../models';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'intrusion-set-new',
    templateUrl: './intrusion-set-new.component.html',
    styleUrls: ['./intrusion-set-new.component.scss']
})
export class IntrusionSetNewComponent extends IntrusionSetEditComponent implements OnInit {

    public groups: IntrusionSet[];
    public id: string;
    public ids: any;

    constructor(public stixService: StixService, public route: ActivatedRoute,
                public router: Router, public dialog: MatDialog,
                public location: Location, public snackBar: MatSnackBar) {
        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
        this.getTechniques(true);
        this.getSoftware(true);
        this.getId();
        super.getCitations();
    }

    public getIdString(ids: any): string {
      let idStr = '';
      idStr = '' + (parseInt(ids[ids.length - 1].substr(1)) + 1);
      let numZeroes = 4 - idStr.length;
      for (let i = 0; i < numZeroes; i++) {
        idStr = '0' + idStr;
      }
      idStr = 'G' + idStr;
      return idStr;
    }

    public getId(): void {
        let subscription = super.load().subscribe(
            (data) => {
                this.groups = data as IntrusionSet[];
                let ids = [];
                let allIds = [];
                this.groups.forEach((group: IntrusionSet) => {
                    for (let i in group.attributes.external_references) {
                        if (group.attributes.external_references[i].external_id) {
                            ids.push(group.attributes.external_references[i].external_id);
                        }
                    }
                });
                allIds = ids.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                    ).sort().filter(Boolean);
                this.id = this.getIdString(allIds);
                console.log(this.id);
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

    public saveButtonClicked(): Observable<any> {
        let idRef = new ExternalReference();
        idRef.external_id = this.id;
        idRef.source_name = 'mitre-attack';
        this.intrusionSet.attributes.external_references.push(idRef);
        this.addAliasesToIntrusionSet();
        this.removeCitations();
        this.intrusionSet.attributes.external_references.reverse();
        const observable = super.create(this.intrusionSet);
        const sub = observable
            .subscribe(
            (data) => {
                console.log(data);
                this.location.back();
                this.createRelationships(data[0].id);
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
        return observable;
    }
}
