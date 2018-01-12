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

    public malwares: Malware[];
    public tools: Tool[];
    public id: string;
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

    public getIdString(ids: any): string {
      let idStr = '';
      idStr = '' + (parseInt(ids[ids.length - 1].substr(1)) + 1);
      let numZeroes = 4 - idStr.length;
      for (let i = 0; i < numZeroes; i++) {
        idStr = '0' + idStr;
      }
      idStr = 'S' + idStr;
      return idStr;
    }

    public getToolIds(ids: any) {
        this.stixService.url = Constance.TOOL_URL;
        let subscription = super.load().subscribe(
            (data) => {
                this.tools = data as Tool[];
                let allIds = [];
                this.tools.forEach((tool: Tool) => {
                    for (let i in tool.attributes.external_references) {
                        if (tool.attributes.external_references[i].external_id) {
                            ids.push(tool.attributes.external_references[i].external_id);
                        }
                    }
                });
                allIds = ids.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                    ).sort().filter(Boolean);
                this.id = this.getIdString(allIds);
                this.stixService.url = Constance.MALWARE_URL;
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

    public getId(): void {
        let subscription = super.load().subscribe(
            (data) => {
                this.malwares = data as Malware[];
                let ids = [];
                let allIds = [];
                this.malwares.forEach((malware: Malware) => {
                    for (let i in malware.attributes.external_references) {
                        if (malware.attributes.external_references[i].external_id) {
                            ids.push(malware.attributes.external_references[i].external_id);
                        }
                    }
                });
                this.getToolIds(ids);
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

    public saveMalware(): void {
        this.mitreId = new ExternalReference();
        this.mitreId.external_id = this.id;
        this.mitreId.source_name = 'mitre-attack';
        this.addExtRefs();
        this.addAliasesToMalware();
        this.removeContributors();
        if (this.softwareType === 'Malware') {
            this.malware.type = 'malware';
            this.malware.attributes.labels = ['malware'];
            this.malware.url = Constance.MALWARE_URL;
            this.stixService.url = Constance.MALWARE_URL;
        }
        else {
            this.malware.type = 'tool';
            this.malware.attributes.labels = ['tool'];
            this.malware.url = Constance.TOOL_URL;
            this.stixService.url = Constance.TOOL_URL;
        }
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
