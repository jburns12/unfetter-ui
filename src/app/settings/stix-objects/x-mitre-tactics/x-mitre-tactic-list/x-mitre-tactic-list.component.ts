import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { XMitreTacticComponent } from '../x-mitre-tactic/x-mitre-tactic.component';
import { StixService } from '../../../stix.service';
import { XMitreTactic } from '../../../../models';

@Component({
  selector: 'x-mitre-tactic-list',
  templateUrl: './x-mitre-tactic-list.component.html',
})
export class XMitreTacticListComponent extends XMitreTacticComponent implements OnInit {
    public xMitreTactics: XMitreTactic[] = [];
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
                this.xMitreTactics = data as XMitreTactic[];
                for (let i in this.xMitreTactics) {
                    this.xMitreTactics[i]['hasId'] = false;
                    if (this.xMitreTactics[i].attributes.external_references !== undefined) {
                        for (let extRef of this.xMitreTactics[i].attributes.external_references) {
                            if (extRef.external_id !== undefined) {
                                this.xMitreTactics[i]['hasId'] = true;
                            }
                        }
                    }
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

    public deletButtonClicked(xMitreTactic: XMitreTactic): void {
        super.openDialog(xMitreTactic).subscribe(
            () => {
                 this.filteredItems = this.filteredItems.filter((h) => h.id !== xMitreTactic.id);
                 this.deleteRels(xMitreTactic.id, false);
            }
        );
    }

    public draftToggleClicked(draftsOnly: boolean) {
        this.draftsOnly = draftsOnly;
    }
}
