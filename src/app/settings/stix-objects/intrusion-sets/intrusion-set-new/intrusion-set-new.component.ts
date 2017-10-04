import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MdDialog, MdDialogRef, MdDialogConfig, MdSnackBar } from '@angular/material';
import { IntrusionSetEditComponent } from '../intrusion-set-edit/intrusion-set-edit.component';
import { StixService } from '../../../stix.service';
import { IntrusionSet } from '../../../../models';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'intrusion-set-new',
    templateUrl: './intrusion-set-new.component.html',
    styleUrls: ['./intrusion-set-new.component.scss']
})
export class IntrusionSetNewComponent extends IntrusionSetEditComponent implements OnInit {

    constructor(public stixService: StixService, public route: ActivatedRoute,
                public router: Router, public dialog: MdDialog,
                public location: Location, public snackBar: MdSnackBar) {
        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
        this.getTechniques();
        this.getSoftware();
    }

    public saveButtonClicked(): Observable<any> {
        this.addAliasesToIntrusionSet();
        const observable = super.create(this.intrusionSet);
        const sub = observable
            .subscribe(
            (data) => {
                console.log(data);
                this.createRelationships(data[0].id);
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
