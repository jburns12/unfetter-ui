import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternEditComponent } from '../attack-pattern-edit/attack-patterns-edit.component';
import { StixService } from '../../../stix.service';
import { AttackPattern } from '../../../../models';

@Component({
    selector: 'attack-pattern-new',
    templateUrl: './attack-pattern-new.component.html'
})
export class AttackPatternNewComponent extends AttackPatternEditComponent implements OnInit {

    public platforms: string[] = [];
    public contributors: string[] = [];
    public dataSources: string[] = [];
    public attackPatterns: any;

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location,
        public snackBar: MdSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
      let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
      let subscription = super.load(filter).subscribe(
          (data) => {
              this.attackPatterns = data as AttackPattern[];
              this.getPlatforms();
              this.getContributors();
              this.getDataSources();
              console.log(this.dataSources);
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

    public getPlatforms(): void {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currPlatforms = attackPattern.attributes.x_mitre_platforms;
            for (let i in currPlatforms){
                this.platforms = this.platforms.concat(currPlatforms[i]);
            }
            this.platforms = this.platforms.filter(function(elem, index, self){
                return index == self.indexOf(elem);
            }).sort().filter(Boolean);
        }
    }

    public getDataSources(): void {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currDataSources = attackPattern.attributes.x_mitre_data_sources;
            for (let i in currDataSources){
                this.dataSources = this.dataSources.concat(currDataSources[i]);
            }
            this.dataSources = this.dataSources.filter(function(elem, index, self){
                return index == self.indexOf(elem);
            }).sort().filter(Boolean);
        }
    }

    public getContributors(): void {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currContributors= attackPattern.attributes.x_mitre_contributors;
            for (let i in currContributors){
                this.contributors = this.contributors.concat(currContributors[i]);
            }
            this.contributors = this.contributors.filter(function(elem, index, self){
                return index == self.indexOf(elem);
            }).sort().filter(Boolean);
        }
    }

     public saveAttackPattern(): void {
         let sub = super.create(this.attackPattern).subscribe(
            (data) => {
                 this.location.back();
            }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }
}
