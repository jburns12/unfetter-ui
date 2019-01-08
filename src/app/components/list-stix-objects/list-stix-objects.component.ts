import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import { BaseComponent } from '../base.component';
import { FormatHelpers } from '../../global/static/format-helpers';

@Component({
  selector: 'list-stix-objects',
  templateUrl: './list-stix-objects.component.html',
  styleUrls: ['./list-stix-objects.component.scss']

})
export class ListStixObjectComponent extends BaseComponent implements OnInit {

    @Input() public model: any;
    @Input() public url: string;
    @Input() public showLabels: boolean;
    @Input() public showPattern: boolean;
    @Input() public showKillChainPhases: boolean;
    @Input() public showExternalReferences: boolean;
    @Input() public showSectors: boolean;
    @Output() public deletButtonClicked: EventEmitter<any> = new EventEmitter();
    @Output() public draftToggleClicked: EventEmitter<any> = new EventEmitter();

    public draftsOnly: boolean = false;
    public tempModel: any;

    private isLastRow: boolean;
    private index = 0;
     constructor(
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location) {

        super(route, router, dialog);
    }

    public ngOnInit() {
        this.url = this.url ? this.url.replace('api', '') : '';
    }

    public draftsOnlyToggle() {
        this.draftsOnly = !this.draftsOnly;
        if (this.draftsOnly) {
            this.tempModel = this.model;
            this.model = this.model.filter((h) => h.hasId === false);
        } else {
            this.model = this.tempModel;
        }
        this.draftToggleClicked.emit(this.draftsOnly);
    }

    public editButtonClicked(item: any): void {
        let link = ['edit', item.id];
        super.gotoView(link);
    }

    public showDetails(event: any, item: any): void {
        event.preventDefault();
        let link = ['.', item.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(item: any): void {
        this.deletButtonClicked.emit(item);
    }

    public formatText(inputString): string {
        return FormatHelpers.formatAll(inputString);
    }

    public visitExtRef(url): void {
        window.open(url, '_blank');
    }
    
    private  notLastIndex(): boolean {
        this.isLastRow = this.index < this.model.length ? true : false;
        this.index = this.index + 1;
        return this.isLastRow;
    }


    private getTooltip(el) {
        let tt = [];
        if (el.x_mitre_deprecated) tt.push("deprecated");
        if (el.revoked) tt.push("revoked")
        if (!el.hasId) tt.push("draft")
        return tt.length > 1? tt.join(", ") : tt[0];
    }

    /**
     * Retrieve and return the mitre-attack, mitre-pre-attack or mitre-mobile-attack external reference for the given object
     */
    private get_mitre_external_id(data): string {
        return data.attributes.external_references.filter((x) => x.external_id && ['mitre-attack', 'mitre-pre-attack', 'mitre-mobile-attack'].includes(x.source_name))[0].external_id
    }
}
