import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { XMitreMatrixComponent } from '../x-mitre-matrix/x-mitre-matrix.component';
import { StixService } from '../../../stix.service';
import { XMitreMatrix } from '../../../../models';

@Component({
  selector: 'x-mitre-matrix-list',
  templateUrl: './x-mitre-matrix-list.component.html',
})
export class XMitreMatrixListComponent extends XMitreMatrixComponent implements OnInit {
    public xMitreMatrices: XMitreMatrix[] = [];
    public showLabels = false;
    public showExternalReferences = false;
    public url: string;
    public draftsOnly: boolean = false;
    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        this.url = stixService.url;

    }

    public ngOnInit() {
        let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
        let subscription =  super.load(filter).subscribe(
            (data) => {
                this.xMitreMatrices = data as XMitreMatrix[];
                for (let i in this.xMitreMatrices) {
                    this.xMitreMatrices[i]['hasId'] = false;
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

    public deletButtonClicked(xMitreMatrix: XMitreMatrix): void {
        super.openDialog(xMitreMatrix).subscribe(
            () => {
                 this.filteredItems = this.filteredItems.filter((h) => h.id !== xMitreMatrix.id);
                 this.deleteRels(xMitreMatrix.id, false);
            }
        );
    }

    public draftToggleClicked(draftsOnly: boolean) {
        this.draftsOnly = draftsOnly;
    }
}
