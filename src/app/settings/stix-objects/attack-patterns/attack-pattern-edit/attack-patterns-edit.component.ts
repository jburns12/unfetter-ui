import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternComponent } from '../attack-pattern/attack-pattern.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, ExternalReference, KillChainPhase } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
    selector: 'attack-pattern-edit',
    templateUrl: './attack-pattern-edit.component.html'
})

export class AttackPatternEditComponent extends AttackPatternComponent implements OnInit {
    public platforms: any = [];
    public contributors: string[] = [];
    public dataSources: string[] = [];
    public id: string;
    public attackPatterns: AttackPattern[];
    public tacticBools: any = {'privEsc': false, 'execution': false, 'defEvas': false, 'exFil': false};
    public supportsRemoteReqNet: any = [
        {'label': 'Yes        ', 'value': true},
        {'label': 'No', 'value': false}
    ];
    public permissions_req = [
      {'name': 'Administrator', 'val': false},
      {'name': 'root', 'val': false},
      {'name': 'SYSTEM', 'val': false},
      {'name': 'User', 'val': false},
      {'name': 'Remote Desktop Users', 'val': false}
    ];

    public effective_perms = [
      {'name': 'Administrator', 'val': false},
      {'name': 'root', 'val': false},
      {'name': 'SYSTEM', 'val': false},
      {'name': 'User', 'val': false}
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
               this.assignPerms();
               this.findCoA();
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
        });

        for(let currPlatform of uniqPlatforms){
            if(this.attackPattern.attributes.x_mitre_platforms.includes(currPlatform)){
                this.platforms.push({'name': currPlatform, 'val': true});
            }
            else{
                this.platforms.push({'name': currPlatform, 'val': false});
            }
        }
    }

    public assignPerms(): void {
      for (let i in this.permissions_req){
          if(this.foundPermission(this.permissions_req[i]['name'])){
              this.permissions_req[i]['val'] = true;
          }
      }
      for (let i in this.effective_perms){
          if(this.foundEffectivePerm(this.effective_perms[i]['name'])){
              this.effective_perms[i]['val'] = true;
          }
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
        });
    }

    public getContributors(): void {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currContributors = attackPattern.attributes.x_mitre_contributors;
            for (let i in currContributors){
                this.contributors = this.contributors.concat(currContributors[i]);
            }
            this.contributors = this.contributors.filter(function(elem, index, self){
                return index == self.indexOf(elem);
            }).sort().filter(Boolean);
        });
    }

    public getId(): void{
        let ids = [];
        let allIds = [];
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            for (let i in attackPattern.attributes.external_references){
                if(attackPattern.attributes.external_references[i].external_id){
                    ids.push(attackPattern.attributes.external_references[i].external_id);
                }
            }
        });
        allIds = ids.filter(function(elem, index, self){
            return index == self.indexOf(elem);
        }).sort().filter(Boolean);
        this.id = 'T' + (parseInt(allIds[allIds.length - 1].substr(1)) + 1);
        console.log(this.id);
    }

    public tacticChange(tactics){
      this.tacticBools = tactics;
      if(!this.tacticBools['privEsc']){
        this.attackPattern.attributes.x_mitre_effective_permissions = [];
        for(let i in this.effective_perms){
            this.effective_perms[i]['val'] = false;
        }
      }
      if(!this.tacticBools['execution']){
        delete this.attackPattern.attributes['x_mitre_remote_support'];
      }
      if(!this.tacticBools['defEvas']){
        delete this.attackPattern.attributes['x_mitre_defense_bypassed'];
      }
      if(!this.tacticBools['exfil']){
        delete this.attackPattern.attributes['x_mitre_network_requirements'];
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
                this.saveCourseOfAction(data.id);
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
