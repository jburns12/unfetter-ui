import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseStixComponent } from '../../../base-stix.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, CourseOfAction } from '../../../../models';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
    selector: 'course-of-action',
    templateUrl: './course-of-action.component.html'
})
export class CourseOfActionComponent extends BaseStixComponent implements OnInit {
    public courseOfAction = new CourseOfAction();
    public showLabels = true;
    public showExternalReferences = true;
    public history: boolean = false;
    public historyArr: any[] = [];
    public relHistoryArr: any = [];
    public historyFound: boolean = false;
    public diff: any;
    public allRels: any = [];
    public allCitations: any = [];
    public hasId: boolean = false;

     constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.COURSE_OF_ACTION_URL;
    }

    public ngOnInit() {

        this.loadCourseOfAction();
    }

    public editButtonClicked(): void {
        let link = ['../edit', this.courseOfAction.id];
        super.gotoView(link);
    }

    public mitigateButtonClicked(): void {
        let link = ['../../mitigates', this.courseOfAction.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(): void {
        super.openDialog(this.courseOfAction).subscribe(
            () => {
                this.location.back();
            }
        );
    }

    public historyButtonClicked(): void {
        if (!this.historyFound) {
            let uri = this.stixService.url + '/' + this.courseOfAction.id + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    let pattern = data as CourseOfAction;
                    let currHistory = [];
                    super.getHistory(pattern, currHistory);
                    super.getRelHistory(pattern, this.relHistoryArr, this.allRels);
                    this.historyArr = Array.from(new Set(currHistory));
                    this.history = !this.history;
                    this.historyFound = true;
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
        } else {
            this.history = !this.history;
        }
    }

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               let subscription = super.save(this.courseOfAction).subscribe(
                    (data) => {
                        observer.next(data);
                        observer.complete();
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
        });
    }

    public assignCitations(): void {
        for (let i in this.courseOfAction.attributes.external_references) {
            this.courseOfAction.attributes.external_references[i].citeButton = 'Generate Citation Text';
            this.courseOfAction.attributes.external_references[i].citation = '[[Citation: ' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
            this.courseOfAction.attributes.external_references[i].citeref = '[[CiteRef::' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
        }
    }

    public getCitations(): void {
        let uri = Constance.MULTIPLES_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let extRefs = [];
                for (let currObj of data) {
                    if (currObj.attributes.external_references && currObj.attributes.external_references.source_name !== 'mitre-attack') {
                        extRefs = extRefs.concat(currObj.attributes.external_references);
                    }
                }
                let configUri = Constance.CONFIG_URL;
                let subscript =  super.getByUrl(configUri).subscribe(
                    (res) => {
                        if (res && res.length) {
                            for (let currRes of res) {
                                if (currRes.attributes.configKey === 'references') {
                                  extRefs = extRefs.concat(currRes.attributes.configValue);
                                }
                            }
                        }
                        extRefs = extRefs.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                        this.allCitations = extRefs.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
                    }, (error) => {
                        // handle errors here
                         console.log('error ' + error);
                    }, () => {
                        // prevent memory links
                        if (subscript) {
                            subscript.unsubscribe();
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

    public searchForId(): void {
        if (this.courseOfAction.attributes.external_references !== undefined) {
            for (let extRef of this.courseOfAction.attributes.external_references) {
                if (extRef.external_id !== undefined) {
                    this.hasId = true;
                }
            }
        }
    }

    public loadCourseOfAction(): void {
        let subscription =  super.get().subscribe(
            (data) => {
                this.courseOfAction = data as CourseOfAction;
                this.getCitations();
                this.assignCitations();
                this.searchForId();
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

    public formatText(inputString): string {
        return FormatHelpers.formatAll(inputString);
    }
}
