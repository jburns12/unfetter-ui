import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BaseStixComponent } from '../../../base-stix.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, XMitreMatrix, XMitreTactic, Relationship, ExternalReference, Malware, Tool } from '../../../../models';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
    selector: 'x-mitre-matrix',
    templateUrl: './x-mitre-matrix.component.html'
})
export class XMitreMatrixComponent extends BaseStixComponent implements OnInit {
    public xMitreMatrix: XMitreMatrix = new XMitreMatrix();
    public history: boolean = false;
    public historyArr: any[] = [];
    public relHistoryArr: any = [];
    public historyFound: boolean = false;
    public mitreId: any;
    public id: any;
    public deprecated: boolean = false;
    public revoked: boolean = false;
    public matrices: XMitreMatrix[];
    public tactics: XMitreTactic[] = [];
    public tactic_refs: XMitreTactic[] = [];

     constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.X_MITRE_MATRIX_URL;
    }

    public ngOnInit() {
        this.loadxMitreMatrix();
    }

    public trackByFunction(index: number, obj: any): any {
      return index;
    }

    public editButtonClicked(): void {
        const link = ['../edit', this.xMitreMatrix.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(): void {
        super.openDialog(this.xMitreMatrix).subscribe(
            () => {
                let goBack = true;
                this.deleteRels(this.xMitreMatrix.id, goBack);
            }
        );
    }

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               const subscription = super.save(this.xMitreMatrix).subscribe(
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
            let uri = this.stixService.url + '/' + this.xMitreMatrix.id + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    let pattern = data as XMitreMatrix;
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

    public getAllTactics(): void {
        let uri = Constance.X_MITRE_TACTIC_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.tactics = data as XMitreTactic[];
                this.xMitreMatrix.attributes.tactic_refs.forEach((id: string) => {
                    let tactic = this.tactics.find((p) => (p.id === id));
                    this.tactic_refs.push(tactic);
                });
                console.log(this.tactics);
                console.log(this.tactic_refs);
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

    public addTactic(): void {
        let tactic = new XMitreTactic();
        this.tactic_refs.unshift(tactic);
    }

    public removeTactic(tactic_id): void {
        this.tactic_refs = this.tactic_refs.filter((h) => h.id !== tactic_id)
    }

    public loadxMitreMatrix(): void {
        const subscription =  super.get().subscribe(
            (data) => {
                this.xMitreMatrix = new XMitreMatrix(data);
                this.getAllTactics();
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
        if (this.xMitreMatrix.attributes.x_mitre_deprecated) {
            this.deprecated = this.xMitreMatrix.attributes.x_mitre_deprecated;
        }
    }

    public getRevoked(): void {
        if (this.xMitreMatrix.attributes.revoked) {
            this.revoked= this.xMitreMatrix.attributes.revoked;
        }
    }

    public formatText(inputString): string {
        return FormatHelpers.formatAll(inputString);
    }
}
