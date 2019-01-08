import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
import { CourseOfActionComponent } from '../course-of-action/course-of-action.component';
import { StixService } from '../../../stix.service';
import { CourseOfAction, ExternalReference, Label } from '../../../../models';

@Component({
  selector: 'course-of-action-edit',
  templateUrl: './course-of-action-edit.component.html'
})
export class CourseOfActionEditComponent extends CourseOfActionComponent implements OnInit {
    public createNewOnly: boolean = true;

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
        super.loadCourseOfAction();
    }

    public saveCourseOfAction(): void {
       this.addExtRefs();
       let subscription = super.saveButtonClicked().subscribe(
            (stixObject) => {
                this.location.back();
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

    public getNewCitation(refToAdd) {
        this.allCitations.push(refToAdd);
        this.allCitations = this.allCitations.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
        this.allCitations = this.allCitations.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
    }

    public addExtRefs(): void {
        this.courseOfAction.attributes.external_references = this.courseOfAction.attributes.external_references.filter((h) => (h.source_name === "mitre-attack" || h.source_name === "mitre-mobile-attack"));
        let citationArr = super.matchCitations(this.courseOfAction.attributes.description);
        for (let name of citationArr) {
            let citation = this.allCitations.find((p) => p.source_name === name);
            if (citation !== undefined) {
                if (this.courseOfAction.attributes.external_references.find((p) => p.source_name === name) === undefined) {
                    this.courseOfAction.attributes.external_references.push(citation);
                }
            }
        }
    }

    public isEnterprise(): boolean {
        return super.isEnterprise();
    }
}
