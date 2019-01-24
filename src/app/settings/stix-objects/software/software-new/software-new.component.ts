import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
import { SoftwareEditComponent } from '../software-edit/software-edit.component';
import { StixService } from '../../../stix.service';
import { Malware, AttackPattern, Indicator, IntrusionSet, CourseOfAction, Filter, ExternalReference, Relationship, Tool } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
  selector: 'software-new',
  templateUrl: './software-new.component.html',
  styleUrls: ['../software-edit/software-edit.component.scss']
})
export class SoftwareNewComponent extends SoftwareEditComponent implements OnInit {

    public ids: any;

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
        this.getTechniques(true);
        this.getId();
        super.getCitationsAndContributors();
    }

    public saveMalware(): void {
        if (this.addId) {
            this.mitreId = new ExternalReference();
            this.mitreId.external_id = this.id;
            this.mitreId.source_name = 'mitre-attack';
            this.mitreId.url = 'https://attack.mitre.org/software/' + this.id
        } else {
            this.mitreId = new ExternalReference();
            this.mitreId.source_name = 'mitre-attack';
        }
        this.addExtRefs();
        this.removeContributors();
        this.malware.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
        if (this.softwareType === 'Malware') {
            this.malware.type = 'malware';
            this.malware.attributes.labels = ['malware'];
            this.malware.url = Constance.MALWARE_URL;
            this.stixService.url = Constance.MALWARE_URL;
        } else {
            this.malware.type = 'tool';
            this.malware.attributes.labels = ['tool'];
            this.malware.url = Constance.TOOL_URL;
            this.stixService.url = Constance.TOOL_URL;
        }
        this.malware.attributes.x_mitre_version = "1.0";
        let sub = super.create(this.malware).subscribe(
            (stixObject) => {
                this.location.back();
                this.createRelationships(stixObject[0].id);
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
