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

    public saveCourceOfAction(): void {
       this.removeCitationsExtRefs();
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

    public removeCitationsExtRefs(): void {
        for (let i in this.courseOfAction.attributes.external_references) {
            if ('citeButton' in this.courseOfAction.attributes.external_references[i]) {
                delete this.courseOfAction.attributes.external_references[i].citeButton;
            }
            if ('citation' in this.courseOfAction.attributes.external_references[i]) {
                delete this.courseOfAction.attributes.external_references[i].citation;
            }
            if ('citeref' in this.courseOfAction.attributes.external_references[i]) {
                delete this.courseOfAction.attributes.external_references[i].citeref;
            }
        }
        for (let i = 0; i < this.courseOfAction.attributes.external_references.length; i++) {
            if (Object.keys(this.courseOfAction.attributes.external_references[i]).length === 0) {
                this.courseOfAction.attributes.external_references.splice(i, 1);
            }
        }
    }
}
