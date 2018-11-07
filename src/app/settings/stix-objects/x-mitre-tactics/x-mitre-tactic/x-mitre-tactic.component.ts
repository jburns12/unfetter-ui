import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BaseStixComponent } from '../../../base-stix.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, XMitreTactic, Relationship, ExternalReference, Malware, Tool } from '../../../../models';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
    selector: 'x-mitre-tactic',
    templateUrl: './x-mitre-tactic.component.html'
})
export class XMitreTacticComponent extends BaseStixComponent implements OnInit {
    public xMitreTactic: XMitreTactic = new XMitreTactic();
    public history: boolean = false;
    public historyArr: any[] = [];
    public relHistoryArr: any = [];
    public historyFound: boolean = false;
    public mitreId: any;
    public id: any;
    public deprecated: boolean = false;
    public revoked: boolean = false;
    public tactics: XMitreTactic[];

     constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.X_MITRE_TACTIC_URL;
    }

    public ngOnInit() {
        this.loadxMitreTactic();
    }

    public trackByFunction(index: number, obj: any): any {
      return index;
    }

    public editButtonClicked(): void {
        const link = ['../edit', this.xMitreTactic.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(): void {
        super.openDialog(this.xMitreTactic).subscribe(
            () => {
                let goBack = true;
                this.deleteRels(this.xMitreTactic.id, goBack);
            }
        );
    }

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               const subscription = super.save(this.xMitreTactic).subscribe(
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

    public historyButtonClicked(): void {
        if (!this.historyFound) {
            let uri = this.stixService.url + '/' + this.xMitreTactic.id + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    let pattern = data as XMitreTactic;
                    let currHistory = [];
                    super.getHistory(pattern, currHistory);
                    this.historyArr = Array.from(new Set(currHistory));
                    this.historyArr = this.historyArr.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : new Date(a.date) > new Date(b.date) ? 1 : 0);
                    for (let i in this.historyArr) {
                        this.historyArr[i].date = new Date(this.historyArr[i].date).toUTCString();
                    }
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

    public getMitreId(): void {
        for (let i in this.xMitreTactic.attributes.external_references) {
            if (this.xMitreTactic.attributes.external_references[i].external_id !== undefined) {
                this.mitreId = Object.assign({}, this.xMitreTactic.attributes.external_references[i]);
            }
        }
    }

    public getIdString(ids: any): string {
        let idStr = '';
        idStr = '' + (parseInt(ids[ids.length - 1].substr(2)) + 1);
        let numZeroes = 4 - idStr.length;
        for (let i = 0; i < numZeroes; i++) {
          idStr = '0' + idStr;
        }
        idStr = 'TA' + idStr;
        return idStr;
    }

    public getId(): void {
        if (this.mitreId !== undefined && this.mitreId !== '') {
            this.id = this.mitreId.external_id;
        } else {
            let subscription = super.load().subscribe(
                (data) => {
                    this.tactics = data as XMitreTactic[];
                    let ids = [];
                    let allIds = [];
                    this.tactics.forEach((group: XMitreTactic) => {
                        for (let i in group.attributes.external_references) {
                            if (group.attributes.external_references[i].external_id) {
                                ids.push(group.attributes.external_references[i].external_id);
                            }
                        }
                    });
                    allIds = ids.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                        ).sort().filter(Boolean);
                    this.id = this.getIdString(allIds);
                    console.log(this.id);
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
    }

    public loadxMitreTactic(): void {
        const subscription =  super.get().subscribe(
            (data) => {
                this.xMitreTactic = new XMitreTactic(data);
                this.getMitreId();
                this.getId();
                this.getDeprecated();
                this.getRevoked();
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

    public getDeprecated(): void {
        if (this.xMitreTactic.attributes.x_mitre_deprecated) {
            this.deprecated = this.xMitreTactic.attributes.x_mitre_deprecated;
        }
    }

    public getRevoked(): void {
        if (this.xMitreTactic.attributes.revoked) {
            this.revoked= this.xMitreTactic.attributes.revoked;
        }
    }

    public formatText(inputString): string {
        return FormatHelpers.formatAll(inputString);
    }
}
