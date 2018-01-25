import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPattern, KillChainPhase, Malware, Tool } from '../../../../models';
import { StixService } from '../../../stix.service';
import { BaseStixComponent } from '../../../base-stix.component';
import { Constance } from '../../../../utils/constance';

@Component({
  selector: 'software-list',
  templateUrl: './software-list.component.html',

})

export class SoftwareListComponent extends BaseStixComponent implements OnInit {
    public malwares: Malware[];
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
        stixService.url = Constance.MALWARE_URL;
        this.url = 'api/softwares';

    }

    public ngOnInit() {
        let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
        let subscription =  super.load(filter).subscribe(
            (data) => {
                this.malwares = data as Malware[];
                this.stixService.url = Constance.TOOL_URL;
                let toolsSub =  super.load(filter).subscribe(
                    (allData) => {
                        let newData = allData;
                        this.malwares = this.malwares.concat(newData);
                        this.malwares = this.malwares.sort((a, b) => a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : 0);
                        this.malwares = this.malwares.filter((citation, index, self) => self.findIndex((t) => t.attributes.name === citation.attributes.name) === index);
                        for (let i in this.malwares) {
                            this.malwares[i]["hasId"] = false;
                            if (this.malwares[i].attributes.external_references !== undefined) {
                                for (let extRef of this.malwares[i].attributes.external_references) {
                                    if (extRef.external_id !== undefined) {
                                        this.malwares[i]["hasId"] = true;
                                    }
                                }
                            }
                        }
                    }, (error) => {
                        // handle errors here
                         console.log('error ' + error);
                    }, () => {
                        // prevent memory links
                        if (toolsSub) {
                            toolsSub.unsubscribe();
                        }
                    }
                );
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

    public deletButtonClicked(software: any): void {
        if (software.type === 'malware') {
            this.stixService.url = Constance.MALWARE_URL;
        } else {
            this.stixService.url = Constance.TOOL_URL;
        }
        super.openDialog(software).subscribe(
            () => {
                 this.filteredItems = this.filteredItems.filter((h) => h.id !== software.id);
                 super.deleteRels(software.id, false);
            }
        );
    }

    public draftToggleClicked(draftsOnly: boolean) {
        this.draftsOnly = draftsOnly;
    }
}
