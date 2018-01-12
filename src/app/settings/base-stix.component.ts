import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
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
    public allRels: any;
    private duration = 3000;

    constructor(
        public service: BaseStixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar?: MatSnackBar) {
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

    public delete(item: any, dialog: boolean = true): Observable<any>  {
        const _self  = this;
        return Observable.create((observer) => {
               _self.deleteItem(item, observer, dialog);
        });
    }

    public gotoView(command: any[]): void {
        this.router.navigate(command, { relativeTo: this.route });
    }

    public openDialog(item: any, dialog: boolean = true): Observable<any> {
        const _self  = this;
        item.url = this.service.url;
        return Observable.create((observer) => {
            const dialogRef = _self.dialog.open(ConfirmationDialogComponent, { data: item });
            dialogRef.afterClosed().subscribe(
                (result) => {
                    if (result === 'true' || result === true) {
                        _self.deleteItem(item, observer, dialog);
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

    public deleteItem(item: any, observer: any, dialog: boolean): void {
        this.route.params
            .switchMap((params: Params) => this.service.delete(item))
            .subscribe(
                (stixObject) => {
                    observer.next(stixObject);
                    observer.complete();
                    if ('name' in item.attributes && item.type !== 'course-of-action' && dialog === true) {
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

    public matchCitations(inputStr: string): any {
        let re = /\[\[Citation: ([^\]\]]*)\]\]/g;
        let citationArr = [];
        let foundMatch;

        do {
            foundMatch = re.exec(inputStr);
            if (foundMatch) {
                citationArr.push(foundMatch[1]);
                console.log(foundMatch[1]);
            }
        } while (foundMatch);

        return citationArr;
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
            if (currArr.type === 'add' && currArr.path[0] === attribute) {
                console.log(currArr.vals);
                removedItems = removedItems.concat(currArr.vals);
            }
        }
        return removedItems;
    }

    public getOrigVal(attribute: any, index: any, revDiff: any): any {
        for (let currArr of revDiff) {
            if (currArr.type === 'set' && currArr.path[0] === attribute && currArr.path[1] === index) {
                return currArr.val;
            }
        }
        return null;
    }

    public getHistoryLine(currArr: any, historyArr: any[], modDate: any, revDiff: any, mitreId: string): void {
        if (currArr.path[0] !== 'previous_versions' && currArr.path[0] !== 'modified' && currArr.path[0] !== 'deletedRelationships' && currArr.path[0] !== 'mitreId' && currArr.path[0] !== 'collection') {
            switch (currArr.type) {
                case 'add':
                    for (let val of currArr.vals) {
                        if (mitreId !== undefined) {
                            historyArr.push({'date': modDate, 'path2': '', 'left': '', 'right': JSON.stringify(val), 'type': ' ADDED to ', 'path': currArr.path[0], 'name': ' by ' + mitreId});
                        } else {
                            historyArr.push({'date': modDate, 'path2': '', 'left': '', 'right': JSON.stringify(val), 'type': ' ADDED to ', 'path': currArr.path[0], 'name': ''});
                        }
                    }
                    break;
                case 'rm':
                    let removedItems = this.getRemovedItems(currArr.path[0], revDiff);
                    for (let removedItem of removedItems) {
                        if (mitreId !== undefined) {
                            historyArr.push({'date': modDate, 'path2': '', 'left': JSON.stringify(removedItem), 'right': '', 'type': ' value DELETED', 'path': currArr.path[0], 'name': ' by ' + mitreId});
                        } else {
                            historyArr.push({'date': modDate, 'path2': '', 'left': JSON.stringify(removedItem), 'right': '', 'type': ' value DELETED', 'path': currArr.path[0], 'name': ''});
                        }
                    }
                    break;
                case 'set':
                    let origVal = this.getOrigVal(currArr.path[0], currArr.path[1], revDiff);
                    if (origVal && (currArr.val !== undefined)) {
                        if (currArr.path[2]) {
                            if (mitreId !== undefined) {
                                historyArr.push({'date': modDate, 'path2': currArr.path[2], 'path': ' in ' + currArr.path[0], 'type': ' CHANGED', 'left': JSON.stringify(origVal), 'right': JSON.stringify(currArr.val), 'name': ' by ' + mitreId});
                            } else {
                                historyArr.push({'date': modDate, 'path2': currArr.path[2], 'path': ' in ' + currArr.path[0], 'type': ' CHANGED', 'left': JSON.stringify(origVal), 'right': JSON.stringify(currArr.val), 'name': ''});
                            }
                        } else {
                            if (mitreId !== undefined) {
                                historyArr.push({'date': modDate, 'path2': '', 'path': currArr.path[0], 'type': ' CHANGED', 'left': JSON.stringify(origVal), 'right': JSON.stringify(currArr.val), 'name': ' by ' + mitreId});
                            } else {
                                historyArr.push({'date': modDate, 'path2': '', 'path': currArr.path[0], 'type': ' CHANGED', 'left': JSON.stringify(origVal), 'right': JSON.stringify(currArr.val), 'name': ''});
                            }
                        }
                    } else if (origVal && (currArr.val === undefined)) {
                        if (currArr.path[2] !== undefined) {
                            if (mitreId !== undefined) {
                                historyArr.push({'date': modDate, 'path2': currArr.path[2], 'path': ' in ' + currArr.path[0], 'type': ' DELETED', 'name': ' by ' + mitreId});
                            } else {
                                historyArr.push({'date': modDate, 'path2': currArr.path[2], 'path': ' in ' + currArr.path[0], 'type': ' DELETED', 'name': ''});
                            }
                        } else {
                            if (mitreId !== undefined) {
                                historyArr.push({'date': modDate, 'path2': '', 'path': currArr.path[0], 'type': ' DELETED', 'name': ' by ' + mitreId});
                            } else {
                                historyArr.push({'date': modDate, 'path2': '', 'path': currArr.path[0], 'type': ' DELETED', 'name': ''});
                            }
                        }
                    } else {
                        if (mitreId !== undefined) {
                            historyArr.push({'date': modDate, 'path2': '', 'path': currArr.path[0], 'type': ' CHANGED', 'left': '', 'right': JSON.stringify(currArr.val), 'name': ' by ' + mitreId});
                        } else {
                            historyArr.push({'date': modDate, 'path2': '', 'path': currArr.path[0], 'type': ' CHANGED', 'left': '', 'right': JSON.stringify(currArr.val), 'name': ''});
                        }
                    }
                    break;
            }
        }
    }

    public getHistory(pattern: any, historyArr: any[]): void {
        if (pattern.attributes.previous_versions && (pattern.attributes.previous_versions.length > 0) ) {
            let currDiff = odiff(pattern.attributes.previous_versions[0], pattern.attributes);
            let revDiff = odiff(pattern.attributes, pattern.attributes.previous_versions[0]);
            console.log(currDiff);
            console.log(revDiff);
            for (let currArr of currDiff) {
               this.getHistoryLine(currArr, historyArr, pattern.attributes.modified, revDiff, pattern.attributes.mitreId.name);
            }
            for (let i = 0; ( i + 1 ) < pattern.attributes.previous_versions.length; i++) {
                let currVerDiff = odiff(pattern.attributes.previous_versions[i + 1], pattern.attributes.previous_versions[i]);
                let revVerDiff = odiff(pattern.attributes.previous_versions[i], pattern.attributes.previous_versions[i + 1]);
                for (let currArr of currVerDiff) {
                   this.getHistoryLine(currArr, historyArr, pattern.attributes.previous_versions[i].modified, revVerDiff, pattern.attributes.previous_versions[i].mitreId.name);
                }
            }
            if (pattern.attributes.previous_versions[pattern.attributes.previous_versions.length - 1].mitreId !== undefined) {
                historyArr.push({'date': pattern.attributes.previous_versions[pattern.attributes.previous_versions.length - 1].created, 'path2': '', 'path': pattern.attributes.name, 'type': ' CREATED', 'name': ' by ' + pattern.attributes.previous_versions[pattern.attributes.previous_versions.length - 1].mitreId.name});
            } else {
                historyArr.push({'date': pattern.attributes.previous_versions[pattern.attributes.previous_versions.length - 1].created, 'path2': '',  'path': pattern.attributes.name, 'type': ' CREATED', 'name': ''});
            }
            historyArr.reverse();
            console.log(historyArr);
        } else {
            if (pattern.attributes.mitreId !== undefined) {
                historyArr.push({'date': pattern.attributes.created, 'path2': '', 'path': pattern.attributes.name, 'type': ' CREATED', 'name': ' by ' + pattern.attributes.mitreId.name});
            } else {
                historyArr.push({'date': pattern.attributes.created, 'path2': '', 'path': pattern.attributes.name, 'type': ' CREATED', 'name': ''});
            }
        }
    }

    public getRelHistory(pattern: any, relHistoryArr: any, relationships: any): void {
        let dateArr = [];
        if (pattern.attributes.deletedRelationships !== undefined) {
            for (let currRel of pattern.attributes.deletedRelationships) {
                let createdHash = {};
                createdHash['date'] = currRel.created;
                createdHash['action'] = 'CREATED';
                createdHash['ref'] = currRel.name;
                if (currRel.created_id !== undefined) {
                    createdHash['id'] = currRel.created_id.name;
                }
                dateArr.push(createdHash);

                let deletedHash = {};
                deletedHash['date'] = currRel.deleted;
                deletedHash['action'] = 'DELETED';
                deletedHash['ref'] = currRel.name;
                if (currRel.deleted_id !== undefined) {
                    deletedHash['id'] = currRel.deleted_id.name;
                }
                dateArr.push(deletedHash);
            }
        }

        for (let rel of relationships) {
            let relHash = {};
            relHash['date'] = rel.attributes.created;
            relHash['action'] = 'CREATED';
            if (rel.attributes.mitreId !== undefined) {
                relHash['id'] = rel.attributes.mitreId.name;
            }

            if (rel.attributes.target_ref === pattern.id) {
                relHash['ref'] = rel.attributes.name;
            } else {
                relHash['ref'] = rel.attributes.name;
            }
            dateArr.push(relHash);
        }
        dateArr = dateArr.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : new Date(a.date) > new Date(b.date) ? 1 : 0);
        for (let currArr of dateArr) {
            if (currArr.id !== undefined) {
                relHistoryArr.push(currArr.date + ':  ' + 'Relationship with "' + currArr.ref + '" ' + currArr.action + ' by ' + currArr.id);
            } else {
                relHistoryArr.push(currArr.date + ':  ' + 'Relationship with "' + currArr.ref + '" ' + currArr.action);
            }
        }
    }
}
