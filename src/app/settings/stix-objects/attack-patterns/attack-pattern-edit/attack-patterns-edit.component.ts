import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternComponent } from '../attack-pattern/attack-pattern.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, ExternalReference, KillChainPhase } from '../../../../models';

@Component({
    selector: 'attack-pattern-edit',
    templateUrl: './attack-pattern-edit.component.html'
})

export class AttackPatternEditComponent extends AttackPatternComponent implements OnInit {
    public platforms: any = [];
    public contributors: string[] = [];
    public dataSources: string[] = [];
    public tacticBools: any = {'privEsc': false, 'execution': false, 'defEvas': false, 'exFil': false};
    public supportsRemoteReqNet: any = [
        {'label': 'Yes        ', 'value': true},
        {'label': 'No', 'value': false}
    ];

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
       super.loadAttackPattern();
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
        let allPlatforms = [];
        let uniqPlatforms = [];
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currPlatforms = attackPattern.attributes.x_mitre_platforms;
            for (let i in currPlatforms){
                allPlatforms = allPlatforms.concat(currPlatforms[i]);
            }
            uniqPlatforms = allPlatforms.filter(function(elem, index, self){
                return index == self.indexOf(elem);
            }).sort().filter(Boolean);
        }
        for(let currPlatform of uniqPlatforms){
            if(this.attackPattern.attributes.x_mitre_platforms.includes(currPlatform)){
                this.platforms.push({'name': currPlatform, 'val': true});
            }
            else{
                this.platforms.push({'name': currPlatform, 'val': false});
            }
        }
        console.log(this.platforms);
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

    public tacticChange(tactics){
      this.tacticBools = tactics;
      if(!this.tacticBools['privEsc']){
        this.attackPattern.attributes.x_mitre_effective_permissions = [];
      }
      if(!this.tacticBools['execution']){
        delete this.attackPattern.attributes['x_mitre_supports_remote'];
      }
      if(!this.tacticBools['defEvas']){
        delete this.attackPattern.attributes['x_mitre_defense_bypassed'];
      }
      if(!this.tacticBools['exfil']){
        delete this.attackPattern.attributes['x_mitre_requires_network'];
      }
    }

    public addRemovePlatform(platform: string) {
        if ( this.foundPlatform(platform) ) {
            this.attackPattern.attributes.x_mitre_platforms = this.attackPattern.attributes.x_mitre_platforms.filter((p) => p !== platform);
        } else {
            this.attackPattern.attributes.x_mitre_platforms.push(platform);
        }
    }

    public addRemovePermission(permission: string) {
        if ( this.foundPermission(permission) ) {
            this.attackPattern.attributes.x_mitre_permissions_required = this.attackPattern.attributes.x_mitre_permissions_required.filter((p) => p !== permission);
        } else {
            this.attackPattern.attributes.x_mitre_permissions_required.push(permission);
        }
    }

    public addRemoveEffectivePerm(permission: string) {
        if ( this.foundEffectivePerm(permission) ) {
            this.attackPattern.attributes.x_mitre_effective_permissions = this.attackPattern.attributes.x_mitre_effective_permissions.filter((p) => p !== permission);
        } else {
            this.attackPattern.attributes.x_mitre_effective_permissions.push(permission);
        }
    }

    public addDataSource(): void {
        let dataSource = '';
        this.attackPattern.attributes.x_mitre_data_sources.unshift(dataSource);
    }

    public removeDataSource(dataSource): void {
        this.attackPattern.attributes.x_mitre_data_sources = this.attackPattern.attributes.x_mitre_data_sources.filter((h) => h !== dataSource)
    }

    public addContributor(): void {
        let contributorName = '';
        this.attackPattern.attributes.x_mitre_contributors.unshift(contributorName);
    }

    public removeContributor(contributor): void {
        this.attackPattern.attributes.x_mitre_contributors = this.attackPattern.attributes.x_mitre_contributors.filter((h) => h !== contributor)
    }

    public saveAttackPattern(): void {
         let sub = super.saveButtonClicked().subscribe(
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
