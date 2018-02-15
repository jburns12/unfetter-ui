import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Constance } from '../../../utils/constance';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../base-stix.component';
import { StixService } from '../../stix.service';

@Component({
  selector: 'history',
  templateUrl: './history-home.component.html',
  providers: [ StixService ]
})

export class HistoryHomeComponent extends BaseStixComponent implements OnInit {

    public getHistoryFromTo: boolean = false;
    public showAllHistory: boolean = false;
    public historyFound: boolean = false;
    public errMsg: string = '';
    public historyArr: any[] = [];
    public relHistoryArr: any = [];
    public filterHistoryArr: any[] = [];
    public filterRelHistoryArr: any = [];
    public displayArr: any = [];
    public startDate: any;
    public endDate: any;
    public allObjects: any = [];
    public allRels: any = [];
    public relationships: any = [];
    public urls: any = [Constance.ATTACK_PATTERN_URL, Constance.COURSE_OF_ACTION_URL, Constance.INTRUSION_SET_URL, Constance.MALWARE_URL, Constance.TOOL_URL];
    public settings = { timePicker: true, format: 'MM-dd-yyyy hh:mm a' };

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        this.stixService.url = Constance.MULTIPLES_URL;
    }

    public ngOnInit() {
        this.getAllObjects();
        this.startDate = new Date("05/31/2017");
        this.endDate = new Date(Date.now()+(new Date().getTimezoneOffset()*60000));
        this.endDate.setSeconds(0, 0);
    }

    public getAllObjects(): void {
        for (let currUrl of this.urls) {
            let uri = currUrl + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    this.allObjects = this.allObjects.concat(data);
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
        let uri = Constance.RELATIONSHIPS_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.relationships = this.relationships.concat(data);
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

    public searchHistory(): void {
        let currDate = this.allObjects[0].attributes.modified;
        currDate = new Date(currDate);

        this.startDate = new Date(this.startDate);
        this.endDate = new Date(this.endDate);
        if (this.startDate.getTime() > this.endDate.getTime()) {
            this.errMsg = 'Please choose an end date later than the start date.';
        }
        else {
            this.errMsg = '';
            this.showAll(this.startDate, this.endDate);
        }
    }

    public cancelButtonClicked(): void {
        this.getHistoryFromTo = false;
        this.endDate = new Date().setSeconds(0, 0);
        this.startDate = new Date("05/31/2017");
    }
    public getFromTo(): void {
        this.getHistoryFromTo = true;
    }

    public hideShowAllButtonClicked(): void {
        this.showAllHistory = false;
    }

    public showAll(start: Date, end: Date): void {
        if(!this.historyFound) {
            let allRelHistory = [];
            for (let pattern of this.allObjects) {
                let currHistory = [];
                let relHistory = [];
                super.getHistory(pattern, currHistory);
                super.getRelHistory(pattern, this.relHistoryArr, this.allRels);
                this.historyArr = this.historyArr.concat(Array.from(new Set(currHistory)));
            }
            super.getAllHistory(this.relationships, this.allObjects, allRelHistory);
            this.relHistoryArr = this.relHistoryArr.concat(Array.from(new Set(allRelHistory)));
            this.historyFound = true;
        }
        if (start !== undefined && end !== undefined) {
            this.filterHistoryArr = this.historyArr.filter((h) => new Date(h.date).getTime() >= start.getTime() - (start.getTimezoneOffset() * 60000) && new Date(h.date).getTime() <= end.getTime() - (end.getTimezoneOffset() * 60000));
            this.filterRelHistoryArr = this.relHistoryArr.filter((h) => new Date(h.date).getTime() >= start.getTime() - (start.getTimezoneOffset() * 60000) && new Date(h.date).getTime() <= end.getTime() - (end.getTimezoneOffset() * 60000));
        }
        else {
            this.filterHistoryArr = this.historyArr;
            this.filterRelHistoryArr = this.relHistoryArr;
        }
        this.displayArr = this.filterHistoryArr.concat(this.filterRelHistoryArr);
        this.displayArr = this.displayArr.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : new Date(a.date) > new Date(b.date) ? 1 : 0);
        for (let i in this.displayArr) {
            this.displayArr[i].date = new Date(this.displayArr[i].date).toUTCString();
        }

        this.showAllHistory = true;
    }
} 