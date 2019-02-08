import { Component, ViewEncapsulation, OnInit, EventEmitter, Output } from '@angular/core';
import { BaseComponentService } from '../base-service.component';
import { Router } from '@angular/router';
import { Navigation } from '../../models/navigation';
import { AuthService } from '../../global/services/auth.service';
import { Constance } from '../../utils/constance';

@Component({
  selector: 'header-navigation',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./header-navigation.component.scss'],
  templateUrl: './header-navigation.component.html'
})
export class HeaderNavigationComponent implements OnInit {
  @Output() openHelp = new EventEmitter<boolean>();

  public navigations: Navigation[] = [
    { url: 'stix/attack-patterns', label: 'Techniques' },
    // { url: 'stix/campaigns', label: 'Campaigns' },
    { url: 'stix/course-of-actions', label: 'Mitigations' },
    // { url: 'stix/indicators', label: 'Indicators' },
    // { url: 'stix/identities', label: 'Identities' },
    // { url: 'stix/malwares', label: 'Malware' },
    // {url: 'stix/relationships', label: 'Relationships'},
    // { url: 'stix/sightings', label: 'Sightings' },
    // { url: 'stix/tools', label: 'Tools' },
    // { url: 'stix/threat-actors', label: 'Threat Actors' },
    { url: 'stix/softwares', label: 'Software' },
    { url: 'stix/intrusion-sets', label: 'Groups' },
    { url: 'stix/x-mitre-tactics', label: 'Tactics' },
    { url: 'stix/x-mitre-matrices', label: 'Matrices' },
    { url: 'stix/citations', label: 'References'},
    { url: 'stix/history', label: 'History'}
    // { url: 'stix/reports', label: 'Reports' },
    // { url: 'stix/x-unfetter-sensors', label: 'Sensors' }
  ];

  public enterpriseTacticNavigations: Navigation[] = [{url: 'stix/tactics/enterprise', label: 'All Techniques'}];
  public preTacticNavigations: Navigation[] = [{url: 'stix/tactics/pre', label: 'All Techniques'}];
  public mobileTacticNavigations: Navigation[] = [{url: 'stix/tactics/mobile', label: 'All Techniques'}];

  public collapsed: boolean = true;
  public demoMode: boolean = false;

  constructor(public authService: AuthService, public baseComponentService: BaseComponentService, public router: Router) {
    const runMode = RUN_MODE;
    if (runMode === 'DEMO') {
      this.demoMode = true;
    }
  }

  public ngOnInit() {
    let tactics_uri = Constance. X_MITRE_TACTIC_URL;
    let matrices_uri = Constance. X_MITRE_MATRIX_URL;
    let sub =  this.baseComponentService.get(tactics_uri).subscribe(
        (data) => {
          let subscription =  this.baseComponentService.get(matrices_uri).subscribe(
            (matrices_data) => {
                for (let matrix of matrices_data) {
                    if (matrix.attributes.external_references[0].external_id == 'enterprise-attack') {
                        for (let ref of matrix.attributes.tactic_refs) {
                            let tactic = data.find((p) => (p.id === ref));
                            this.enterpriseTacticNavigations.push({ url: 'stix/tactics/enterprise/' + tactic.attributes.x_mitre_shortname, label: tactic.attributes.name});
                        }
                    }
                    else if (matrix.attributes.external_references[0].external_id == 'mobile-attack') {
                        for (let ref of matrix.attributes.tactic_refs) {
                            let tactic = data.find((p) => (p.id === ref));
                            this.mobileTacticNavigations.push({ url: 'stix/tactics/mobile/' + tactic.attributes.x_mitre_shortname, label: tactic.attributes.name});
                        }   
                    }
                    else {
                        for (let ref of matrix.attributes.tactic_refs) {
                            let tactic = data.find((p) => (p.id === ref));
                            this.preTacticNavigations.push({ url: 'stix/tactics/pre/' + tactic.attributes.x_mitre_shortname, label: tactic.attributes.name});
                        }                                               
                    }
                }
            }, (error) => {
                console.log(error);
            }, () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
        }, (error) => {
            console.log(error);
        }, () => {
            if (sub) {
                sub.unsubscribe();
            }
        }
    );
  }
}
