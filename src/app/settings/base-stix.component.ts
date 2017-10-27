import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Relationship } from '../models';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation/confirmation-dialog.component';
import { BaseStixService } from './base-stix.service';
import { Constance } from '../utils/constance';
import { AttackPattern } from '../models/attack-pattern';
import { default as DD } from 'deep-diff';
import odiff from 'odiff';

export class BaseStixComponent {
    public filteredItems: any[];
    public allCitations: any = [];
    public allRels: any;
    private duration = 3000;

    constructor(
        public service: BaseStixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location,
        public snackBar?: MdSnackBar) {
    }

     public load(filter?: any): Observable<any[]> {
         const _self  = this;
         return Observable.create((observer) => {
               _self.loadItems(observer, filter);
         });
    }

    public get(): Observable<any> {
        const _self  = this;
        return Observable.create((observer) => {
               _self.getItem(observer);
        });
    }

    public getByUrl(url: string): Observable<any> {
        const _self  = this;
        return Observable.create((observer) => {
              const subscription =  _self.service.getByUrl(url).subscribe(
                   (data) => {
                        observer.next(data);
                        observer.complete();
                   }, (error: string) => {
                        // handle errors here
                        this.snackBar.open('Error ' + error , '', {
                            duration: this.duration,
                            extraClasses: ['snack-bar-background-error']
                        });
                    }, () => {
                        // prevent memory links
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
               );
        });
    }
    public create(item: any): Observable<any>  {
        const _self  = this;
        return Observable.create((observer) => {
               _self.createItem(item, observer);
        });
    }

    public save(item: any): Observable<any>  {
        const _self  = this;
        item.url = this.service.url;
        return Observable.create((observer) => {
               _self.saveItem(item, observer);
        });
    }

    public delete(item: any): Observable<any>  {
        const _self  = this;
        return Observable.create((observer) => {
               _self.deleteItem(item, observer);
        });
    }

    public gotoView(command: any[]): void {
        this.router.navigate(command, { relativeTo: this.route });
    }

    public openDialog(item: any): Observable<any> {
        const _self  = this;
        item.url = this.service.url;
        return Observable.create((observer) => {
            const dialogRef = _self.dialog.open(ConfirmationDialogComponent, { data: item });
            dialogRef.afterClosed().subscribe(
                (result) => {
                    if (result === 'true') {
                        _self.deleteItem(item, observer);
                    }
            });
        });
    }

    public download(): void {
        console.log('download');
    }

    public cancelButtonClicked(): void {
        this.location.back();
    }

    public onFilterItemsChange(filterItems: any[]): void {
        this.filteredItems = filterItems;
    }

    public loadItems(observer: any, filter?: any): void {
         const subscription = this.service.load(filter).subscribe(
            (stixObjects) => {
                observer.next(stixObjects);
                observer.complete();
            }, (error) => {
                // handle errors here
                this.snackBar.open('Error ' + error , '', {
                     duration: this.duration,
                     extraClasses: ['snack-bar-background-error']
                });
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }

    public getItem(observer: any): void {
       this.route.params
                .switchMap((params: Params) => this.service.get(params['id']))
                .subscribe(
                    (stixObject) => {
                        observer.next(stixObject);
                        observer.complete();
                    }, (error) => {
                        // handle errors here
                        this.snackBar.open('Error ' + error , '', {
                            duration: this.duration,
                            extraClasses: ['snack-bar-background-error']
                        });
                    }, () => {
                    // handle errors here
                    }
                );
    }

    public deleteItem(item: any, observer: any): void {
        this.route.params
            .switchMap((params: Params) => this.service.delete(item))
            .subscribe(
                (stixObject) => {
                    observer.next(stixObject);
                    observer.complete();
                    if ('name' in item.attributes && item.type !== 'course-of-action') {
                        this.snackBar.open(item.attributes.name + ' has been successfully deleted', '', {
                            duration: this.duration,
                            extraClasses: ['snack-bar-background-success']
                        });
                    }
                }, (error) => {
                    // handle errors here
                    this.snackBar.open('Error ' + error , '', {
                        duration: this.duration,
                        extraClasses: ['snack-bar-background-error']
                    });
                    observer.throw = '';
                }, () => {
                   // handle errors here
                }
            );
    }

    public createItem(item: any, observer: any): void {
        const subscription = this.service.create(item).subscribe(
            (data) => {
                observer.next(data);
                observer.complete();
                if ('name' in item.attributes && item.type !== 'course-of-action') {
                    this.snackBar.open(item.attributes.name + ' has been successfully saved', '', {
                        duration: this.duration,
                        extraClasses: ['snack-bar-background-success']
                    });
                }
            }, (error) => {
                // handle errors here
                this.snackBar.open('Error ' + error , '', {
                    duration: this.duration,
                    extraClasses: ['snack-bar-background-error']
                });
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }

    public saveItem(item: any, observer: any): void {
        const subscription = this.service.update(item).subscribe(
            (data) => {
                observer.next(data);
                observer.complete();
                if ('name' in item.attributes && item.type !== 'course-of-action') {
                    this.snackBar.open(item.attributes.name + ' has been successfully saved', '', {
                        duration: this.duration,
                        extraClasses: ['snack-bar-background-success']
                    });
                }
            }, (error) => {
                // handle errors here
                this.snackBar.open('Error ' + error , '', {
                    duration: this.duration,
                    extraClasses: ['snack-bar-background-error']
                });
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }

    public getCitations(): void {
        let uri = Constance.ATTACK_PATTERN_URL;
        let subscription =  this.getByUrl(uri).subscribe(
            (data) => {
                let techniques = data as AttackPattern[];
                console.log(techniques);
                techniques.forEach((attackPattern: AttackPattern) => {
                    for (let i in attackPattern.attributes.external_references) {
                        if (!(attackPattern.attributes.external_references[i].external_id)) {
                            this.allCitations.push(attackPattern.attributes.external_references[i]);
                        }
                    }
                });
                this.allCitations = this.allCitations.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                this.allCitations = this.allCitations.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
                console.log(this.allCitations);
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
    public deleteRels(id: string, goBack: boolean): void {
        let uri = Constance.RELATIONSHIPS_URL
        let subscription =  this.getByUrl(uri).subscribe(
            (data) => {
                this.allRels = data as Relationship[];
                console.log(id);
                console.log(this.allRels);
                if (this.allRels.length > 0) {
                    let allRelationships = this.allRels.filter((r) => {
                        return r.attributes.source_ref === id || r.attributes.target_ref === id ;
                    });
                    for (let relationship of allRelationships) {
                        console.log(relationship);
                        relationship.url = Constance.RELATIONSHIPS_URL;
                        relationship.id = relationship.attributes.id;
                        this.delete(relationship).subscribe(
                            () => {
                            }
                        );
                    }
                    if (goBack) {
                        this.location.back();
                    }
                }
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

    public getRemovedItems(attribute: any, revDiff: any): any {
        let removedItems = [];
        for (let currArr of revDiff) {
            if(currArr.type === "add" && currArr.path[0] === attribute) {
                console.log(currArr.vals);
                removedItems = removedItems.concat(currArr.vals);
            }
        }
        return removedItems;
    }

    public getOrigVal(attribute: any, index: any, revDiff: any): any {
        for (let currArr of revDiff) {
            if(currArr.type === "set" && currArr.path[0] === attribute && currArr.path[1] === index) {
                return currArr.val;
            }
        }
        return null;
    }

    public getHistoryLine(currArr: any, historyArr: string[], modDate: any, revDiff: any): void {
        if(currArr.path[0] !== "previous_versions" && currArr.path[0] !== "modified" && currArr.path[0] !== "deletedRelationships") {
            switch(currArr.type) {
                case "add":
                    for (let val of currArr.vals) {
                        historyArr.push(modDate + ":  Added '" + currArr.path[0] + "' " + JSON.stringify(val));
                    }
                    break;
                case "rm":
                    let removedItems = this.getRemovedItems(currArr.path[0], revDiff);
                    for (let removedItem of removedItems) {
                        historyArr.push(modDate + ":  Deleted '" + currArr.path[0] + "' value " + JSON.stringify(removedItem));
                    }
                    break;
                case "set":
                    let origVal = this.getOrigVal(currArr.path[0], currArr.path[1], revDiff);
                    if(origVal) {
                        if(currArr.path[2]){
                            historyArr.push(modDate + ":  Changed '" + currArr.path[2] + "' in '"+ currArr.path[0] + "' from " + JSON.stringify(origVal) + " to " + JSON.stringify(currArr.val));
                        }
                        else{
                            historyArr.push(modDate + ":  Changed '" + currArr.path[0] + "' from " + JSON.stringify(origVal) + " to " + JSON.stringify(currArr.val));
                        }
                    }
                    else {
                        historyArr.push(modDate + ":  Changed '" + currArr.path[0] + " to " + JSON.stringify(currArr.val));
                    }
                    break;
            }
        }
    }

    public getHistory(pattern: any, historyArr: string[]): void {
        if (pattern.attributes.previous_versions && (pattern.attributes.previous_versions.length > 0) ) {
            let currDiff = odiff(pattern.attributes.previous_versions[0], pattern.attributes);
            let revDiff = odiff(pattern.attributes, pattern.attributes.previous_versions[0]);
            for (let currArr of currDiff) {
               this.getHistoryLine(currArr, historyArr, pattern.attributes.modified, revDiff);
            }
            for (let i = 0; (i+1) < pattern.attributes.previous_versions.length; i++) {
                let currDiff = odiff(pattern.attributes.previous_versions[i+1], pattern.attributes.previous_versions[i]);
                let revDiff = odiff(pattern.attributes.previous_versions[i], pattern.attributes.previous_versions[i+1]);
                for (let currArr of currDiff) {
                   this.getHistoryLine(currArr, historyArr, pattern.attributes.previous_versions[i].modified, revDiff);
                }
            }
            historyArr.push(pattern.attributes.previous_versions[pattern.attributes.previous_versions.length - 1].created + ":  " + pattern.id + " created");
            historyArr.reverse();
        } else {
            historyArr.push(pattern.attributes.created + ":  " + pattern.id + " created");
        }
    }

    public getRelHistory(pattern: any, relHistoryArr: any, relationships: any): void {
        let dateArr = [];
        console.log(pattern);
        if(pattern.attributes.deletedRelationships !== undefined) {
            for (let currRel of pattern.attributes.deletedRelationships) {
                let createdHash = {};
                createdHash['date'] = currRel.created;
                createdHash['action'] = "created";
                createdHash['ref'] = currRel.ref;
                dateArr.push(createdHash);

                let deletedHash = {};
                deletedHash['date'] = currRel.deleted;
                deletedHash['action'] = "deleted";
                deletedHash['ref'] = currRel.ref;
                dateArr.push(deletedHash);
            }
        }

        for (let rel of relationships) {
            let relHash = {};
            relHash['date'] = rel.attributes.created;
            relHash['action'] = "created";

            if(rel.attributes.target_ref === pattern.id) {
                relHash['ref'] = rel.attributes.source_ref;
            } else {
                relHash['ref'] = rel.attributes.target_ref;
            }
            dateArr.push(relHash);
        }
        dateArr = dateArr.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : new Date(a.date) > new Date(b.date) ? 1 : 0);
        for (let currArr of dateArr) {
            relHistoryArr.push(currArr.date + ":  " + "Relationship with " + currArr.ref + " " + currArr.action);
        }
    }
}
