import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
import { XMitreMatrixEditComponent } from '../x-mitre-matrix-edit/x-mitre-matrix-edit.component';
import { StixService } from '../../../stix.service';
import { ExternalReference } from '../../../../models';
import { IntrusionSet } from '../../../../models';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'x-mitre-matrix-new',
    templateUrl: './x-mitre-matrix-new.component.html'
})
export class XMitreMatrixNewComponent extends XMitreMatrixEditComponent implements OnInit {

    public ids: any;
    public domain = [
        {'name': 'Enterprise', 'val': true},
        {'name': 'PRE-ATT&CK', 'val': false},
        {'name': 'Mobile', 'val': false}
    ]
    public chosenDomain: string = 'Enterprise';

    constructor(public stixService: StixService, public route: ActivatedRoute,
                public router: Router, public dialog: MatDialog,
                public location: Location, public snackBar: MatSnackBar) {
        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
        this.getAllTactics();
    }

    public addRemoveDomain(answer: string) {
        for (let i in this.domain) {
            if (this.domain[i].name === answer) {
                this.domain[i].val = !this.domain[i].val;
                if (this.domain[i].val === true) {
                    this.chosenDomain = answer;
                }
                else {
                    this.chosenDomain = '';
                }
            }
            else {
                this.domain[i].val = false;
            }
        }
    }

    public createExtRef(): void {
        let extRef = new ExternalReference();
        extRef.source_name = 'mitre-attack';
        if (this.chosenDomain === 'Enterprise') {
            extRef.url = 'https://attack.mitre.org/matrices/enterprise';
            extRef.external_id = 'enterprise-attack';
        }
        else if (this.chosenDomain === 'PRE-ATT&CK') {
            extRef.url = 'https://attack.mitre.org/matrices/pre';
            extRef.external_id = 'pre-attack';
        }
        else {
            extRef.url = 'https://attack.mitre.org/matrices/mobile';
            extRef.external_id = 'mobile-attack';
        }
        this.xMitreMatrix.attributes.external_references = [extRef];
    }

    public saveButtonClicked(): Observable<any> {
        this.createExtRef();
        this.addTacticsToMatrix();
        const observable = super.create(this.xMitreMatrix);
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

