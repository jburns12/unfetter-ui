import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../../base-stix.component';
import { AttackPattern, CourseOfAction, Relationship } from '../../../../models';
import { StixService } from '../../../stix.service';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
  selector: 'attack-pattern',
  templateUrl: './attack-pattern.component.html',

})

export class AttackPatternComponent extends BaseStixComponent implements OnInit {

    public attackPattern: AttackPattern = new AttackPattern();
    public mitigation: string = '';
    public courseOfAction: CourseOfAction = new CourseOfAction();
    public relationship: Relationship = new Relationship();
    public coaId: string = '';
    public target: any;
    public history: boolean = false;
    public historyArr: any[];
    public relHistoryArr: any = [];
    public historyFound: boolean = false;
    public diff: any;
    public allRels: any = [];
    public deleteMitigation: boolean = false;
    public attackId: string;

    public x_unfetter_sophistication_levels = [
          { id : 1, value: '1 - Novice' },
          { id : 2, value: '2 - Practicioner' },
          { id : 3, value: '3 - Expert' },
          { id : 4, value: '4 - Innovator' }
    ];

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.ATTACK_PATTERN_URL;
    }

    public ngOnInit() {
       this.loadAttackPattern();
    }

    public trackByFunction(index: number, obj: any): any {
      return index;
    }

    public editButtonClicked(): void {
        let link = ['../edit', this.attackPattern.id];
        super.gotoView(link);
    }

    public historyButtonClicked(): void {
        if (!this.historyFound) {
            let uri = this.stixService.url + '/' + this.attackPattern.id + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    let pattern = data as AttackPattern;
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

    public deleteButtonClicked(): void {
        super.openDialog(this.attackPattern).subscribe(
            () => {
                this.deleteMitigation = true;
                this.deleteCoAandRels();
            }
        );
    }

    public deleteCoAandRels(): void {
        let goBack = true;
        this.deleteRels(this.attackPattern.id, goBack);
        if (this.coaId !== '') {
            this.courseOfAction.url = Constance.COURSE_OF_ACTION_URL;
            this.delete(this.courseOfAction, false).subscribe(
                () => {

                }
            );
        }
    }

    public loadAttackPattern(): void {
         let subscription =  super.get().subscribe(
            (data) => {
                this.attackPattern = data as AttackPattern;
                console.log(this.attackPattern);
                if (this.attackPattern.attributes.external_references !== undefined) {
                    for (let ref of this.attackPattern.attributes.external_references) {
                        if (ref.external_id !== undefined) {
                            this.attackId = ref.external_id;
                        }
                    }
                }
                this.attackPattern.attributes.external_references.reverse();
                this.findCoA();
                this.findSourceRels();
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

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               let subscription = super.save(this.attackPattern).subscribe(
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

    public getSophisticationLevel(id: number): string {
        let sophisticationLevel = this.x_unfetter_sophistication_levels.find(
            (sophistication) => {
                return sophistication.id === id;
            }
        );
        return sophisticationLevel ? sophisticationLevel.value : '';
    }

    public foundPlatform(platform: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_platforms.find((p) => {
            return p === platform;
        });
        return found ? true : false;
    }

    public foundPermission(permission: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_permissions_required.find((p) => {
            return p === permission;
        });
        return found ? true : false;
    }

    public foundEffectivePerm(permission: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_effective_permissions.find((p) => {
            return p === permission;
        });
        return found ? true : false;
    }

    public permsReqExist(): boolean {
      let found = true;
      if (this.attackPattern.attributes.x_mitre_permissions_required) {
        if (!this.attackPattern.attributes.x_mitre_permissions_required.length) {
          found = false
        }
      } else {
        found = false;
      }
      return found ? true : false;
    }

    public findCoA(): void {
        let filter = { 'stix.target_ref': this.attackPattern.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter) + '&previousversions=true&metaproperties=true';
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.stixService.url = Constance.ATTACK_PATTERN_URL;
                this.target = data as Relationship[];
                this.target.forEach((relationship: Relationship) => {
                    if (relationship.attributes.relationship_type === 'mitigates') {
                        this.getMitigation(relationship.attributes.source_ref);
                    }

                    let relFilter = { 'stix.id': relationship.attributes.source_ref };
                    let multiplesUri = Constance.MULTIPLES_URL + '?filter=' + JSON.stringify(relFilter);
                    let subscript =  this.getByUrl(multiplesUri).subscribe(
                        (multiplesData) => {
                              console.log(multiplesData);
                              relationship.attributes.name = multiplesData[0].attributes.name;
                              this.allRels.push(relationship);
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
                });
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

    public findSourceRels(): void {
        let filter = { 'stix.source_ref': this.attackPattern.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter) + '&previousversions=true&metaproperties=true';
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.target = data as Relationship;
                this.target.forEach((relationship: Relationship) => {
                  let relFilter = { 'stix.id': relationship.attributes.target_ref };
                  let multiplesUri = Constance.MULTIPLES_URL + '?filter=' + JSON.stringify(relFilter);
                  let subscript =  this.getByUrl(multiplesUri).subscribe(
                      (multiplesData) => {
                            relationship.attributes.name = multiplesData[0].attributes.name;
                            this.allRels.push(relationship);
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
                });
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

    public getMitigation(coaId: string) {
        let uri = Constance.COURSE_OF_ACTION_URL + '/' + coaId;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.coaId = coaId;
                this.courseOfAction = data as CourseOfAction;
                for (let i in this.courseOfAction.attributes.external_references) {
                    this.courseOfAction.attributes.external_references[i].citeButton = 'Generate Citation Text';
                    this.courseOfAction.attributes.external_references[i].citation = '[[Citation: ' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
                    this.courseOfAction.attributes.external_references[i].citeref = '[[CiteRef::' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
                }
                this.mitigation = this.courseOfAction.attributes.description;
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

    public saveCourseOfAction(attackPatternId: string, citations: any): void {
        if (this.coaId !== '') {
            console.log(this.courseOfAction.attributes.external_references);
            if (this.mitigation !== this.courseOfAction.attributes.description) {
                this.courseOfAction.attributes.description = this.mitigation;
                this.courseOfAction.attributes.external_references = [];
                let citationArr = super.matchCitations(this.mitigation);
                for (let name of citationArr) {
                    let citation = citations.find((p) => p.source_name === name);
                    console.log(citation);
                    if (citation !== undefined) {
                        this.courseOfAction.attributes.external_references.push(citation);
                    }
                }
                this.stixService.url = Constance.COURSE_OF_ACTION_URL;
                let subscription = super.save(this.courseOfAction).subscribe(
                    (data) => {

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
        } else {
            if (this.mitigation !== '') {
               this.courseOfAction.attributes.description = this.mitigation;
               this.courseOfAction.attributes.name = this.attackPattern.attributes.name + ' Mitigation';
               this.courseOfAction.attributes.external_references = [];
               let citationArr = super.matchCitations(this.mitigation);
               for (let name of citationArr) {
                   let citation = citations.find((p) => p.source_name === name);
                   console.log(citation);
                   if (citation !== undefined) {
                       this.courseOfAction.attributes.external_references.push(citation);
                   }
               }
               console.log(this.courseOfAction);
               let subscription = super.create(this.courseOfAction).subscribe(
                    (stixObject) => {
                        this.saveRelationship(attackPatternId, stixObject[0].id);
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
    }

    public saveRelationship(attackPatternId: string, coaId: string): void {
        this.relationship.attributes.source_ref = coaId;
        this.relationship.attributes.target_ref = attackPatternId;
        this.relationship.attributes.relationship_type = 'mitigates';
        let subscription = super.create(this.relationship).subscribe(
            (data) => {
                console.log(data);
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

    public visitExtRef(url): void {
        window.open(url, '_blank');
    }
}
