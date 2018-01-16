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
        super.getCitationsAndContributors();
    }

    public saveButtonClicked(): Observable<any> {
        if (this.addId) {
            this.mitreId = new ExternalReference();
            this.mitreId.external_id = this.id;
            this.mitreId.source_name = 'mitre-attack';
            this.mitreId.url = 'https://attack.mitre.org/wiki/Group/' + this.id
        } else {
            this.mitreId = new ExternalReference();
            this.mitreId.source_name = 'mitre-attack';
        }

        this.intrusionSet.attributes.external_references = [];
        this.addExtRefs();
        this.addAliasesToIntrusionSet();
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
