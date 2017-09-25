import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../../base-stix.component';
import { AttackPattern } from '../../../../models';
import { StixService } from '../../../stix.service';
import { Constance } from '../../../../utils/constance';

@Component({
  selector: 'attack-pattern',
  templateUrl: './attack-pattern.component.html',

})

export class AttackPatternComponent extends BaseStixComponent implements OnInit {

    public attackPattern: AttackPattern = new AttackPattern();
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
                this.location.back();
            }
        );
    }

    public addRemovePlatform(platform: string) {
        if ( this.foundPlatform(platform) ) {
            this.attackPattern.attributes.x_mitre_platforms = this.attackPattern.attributes.x_mitre_platforms.filter((p) => p !== platform);
        } else {
            this.attackPattern.attributes.x_mitre_platforms.push(platform);
        }
    }

    public addRemoveDataSource(dataSource: string) {
        if ( this.foundDataSource(dataSource) ) {
            this.attackPattern.attributes.x_mitre_data_sources = this.attackPattern.attributes.x_mitre_data_sources.filter((p) => p !== dataSource;
        } else {
            this.attackPattern.attributes.x_mitre_data_sources.push(dataSource);
        }
    }

    public addRemoveContributor(contributor: string) {
        if ( this.foundContributor(contributor) ) {
            this.attackPattern.attributes.x_mitre_contributors = this.attackPattern.attributes.x_mitre_contributors.filter((p) => p !== contributor);
        } else {
            this.attackPattern.attributes.x_mitre_contributors.push(contributor);
        }
    }

    public addContributor(): void {
      let contributorName = '';
      this.attackPattern.attributes.x_mitre_contributors.unshift(contributorName);
    }

    public removeContributor(contributor): void {
      this.attackPattern.attributes.x_mitre_contributors = this.attackPattern.attributes.x_mitre_contributors.filter((h) => h !== contributor)
    }

    public loadAttackPattern(): void {
         let subscription =  super.get().subscribe(
            (data) => {
                this.attackPattern = data as AttackPattern;
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

    public foundDataSource(dataSource: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_data_sources.find((c) => {
            return c === dataSource;
        });
        return found ? true : false;
    }

    public foundContributor(contributor: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_contributors.find((c) => {
            return c === contributor;
        });
        return found ? true : false;
    }
}
