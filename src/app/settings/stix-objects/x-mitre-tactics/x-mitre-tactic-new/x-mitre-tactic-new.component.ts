import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
import { XMitreTacticEditComponent } from '../x-mitre-tactic-edit/x-mitre-tactic-edit.component';
import { StixService } from '../../../stix.service';
import { ExternalReference } from '../../../../models';
import { IntrusionSet } from '../../../../models';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'x-mitre-tactic-new',
    templateUrl: './x-mitre-tactic-new.component.html'
})
export class XMitreTacticNewComponent extends XMitreTacticEditComponent implements OnInit {

    public ids: any;

    constructor(public stixService: StixService, public route: ActivatedRoute,
                public router: Router, public dialog: MatDialog,
                public location: Location, public snackBar: MatSnackBar) {
        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
        this.getId();
    }

    public saveButtonClicked(): Observable<any> {
        if (this.addId) {
            this.mitreId = new ExternalReference();
            this.mitreId.external_id = this.id;
            this.mitreId.source_name = 'mitre-attack';
            this.mitreId.url = 'https://attack.mitre.org/tactics/' + this.id
        } else {
            this.mitreId = new ExternalReference();
            this.mitreId.source_name = 'mitre-attack';
        }
        this.xMitreTactic.attributes.x_mitre_shortname = this.xMitreTactic.attributes.name.toLowerCase().split(' ').join('-');
        this.xMitreTactic.attributes.external_references = [];
        this.addExtRefs();
        this.xMitreTactic.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
        const observable = super.create(this.xMitreTactic);
        const sub = observable
            .subscribe(
            (data) => {
                console.log(data);
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
        return observable;
    }
}

