import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../../base-stix.component';
import { AttackPattern, CourseOfAction, Relationship } from '../../../../models';
import { StixService } from '../../../stix.service';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers'

@Component({
  selector: 'attack-pattern',
  templateUrl: './attack-pattern.component.html',

})

export class AttackPatternComponent extends BaseStixComponent implements OnInit {

    public attackPattern: AttackPattern = new AttackPattern();
    public mitigation: string = '';
    public courseOfAction: CourseOfAction = new CourseOfAction();
    public coaMitigator: CourseOfAction;
    public relationship: Relationship = new Relationship();
    public coaId: string = '';
    public target: any;

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
        public dialog: MdDialog,
        public location: Location,
        public snackBar: MdSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.ATTACK_PATTERN_URL;
    }

    public ngOnInit() {
       this.loadAttackPattern();
    }

    trackByFunction(index: number, obj: any): any {
      return index;
    }

    public editButtonClicked(): void {
        let link = ['../edit', this.attackPattern.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(): void {
        super.openDialog(this.attackPattern).subscribe(
            () => {
                let goBack = true;
                this.deleteRels(this.attackPattern.id, goBack);
            }
        );
    }

    public loadAttackPattern(): void {
         let subscription =  super.get().subscribe(
            (data) => {
                this.attackPattern = data as AttackPattern;
                this.findCoA();
                console.log(this.attackPattern);
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
      if(this.attackPattern.attributes.x_mitre_permissions_required){
        if(!this.attackPattern.attributes.x_mitre_permissions_required.length){
          found = false
        }
      }
      else{
        found = false;
      }
      return found ? true : false;
    }

    public findCoA(): void{
        let filter = { 'stix.target_ref': this.attackPattern.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.target = data as Relationship;
                this.target.forEach((relationship: Relationship) => {
                    if(relationship.attributes.relationship_type == "mitigates"){
                        this.getMitigation(relationship.attributes.source_ref);
                    }
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

    public getMitigation(coaId: string){
        let uri = Constance.COURSE_OF_ACTION_URL + '/' + coaId;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.coaId = coaId;
                this.coaMitigator = new CourseOfAction();
                this.coaMitigator = data as CourseOfAction;
                this.mitigation = this.coaMitigator.attributes.description;
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

    public saveCourseOfAction(attackPatternId: string): void {
        if(this.coaId != ''){
            if(this.mitigation != this.coaMitigator.attributes.description){
                this.coaMitigator.attributes.description = this.mitigation;
                this.stixService.url = Constance.COURSE_OF_ACTION_URL;
                let subscription = super.save(this.coaMitigator).subscribe(
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
        }
        else{
            if(this.mitigation != ''){
               this.courseOfAction.attributes.description = this.mitigation;
               this.courseOfAction.attributes.name = this.attackPattern.attributes.name + " Mitigation";
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
        this.relationship.attributes.relationship_type = "mitigates";
        console.log(this.relationship);
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

    public cleanWhitespace(inputString): string {
        return FormatHelpers.mitreCitationsToHtml(FormatHelpers.whitespaceToBreak(inputString));
    }

    public cleanWhitespaceMitigation(inputString): string {
        return FormatHelpers.mitreCiteRefToHtml(FormatHelpers.whitespaceToBreak(inputString));
    }
}
