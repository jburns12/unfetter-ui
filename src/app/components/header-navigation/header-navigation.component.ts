import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { BaseComponentService } from '../base-service.component';
import { Router } from '@angular/router';
import { Navigation } from '../../models/navigation';
import { AuthService } from '../../global/services/auth.service';

@Component({
  selector: 'header-navigation',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./header-navigation.component.scss'],
  templateUrl: './header-navigation.component.html'
})
export class HeaderNavigationComponent implements OnInit {

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
    { url: 'x-mitre-tactics', label: 'Tactics' },
    { url: 'x-mitre-matrices', label: 'Matrices' },
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
    const uri = 'api/config?filter= {"configKey": "tactics"}';
    let sub = this.baseComponentService.get(uri).subscribe(
        (data) => {
            for (let tactic of data[0].attributes.configValue.enterprise_tactics.tactics) {
                this.enterpriseTacticNavigations.push({ url: 'stix/tactics/enterprise/' + tactic.tactic, label: tactic.tactic});
            }
            for (let tactic of data[0].attributes.configValue.pre_attack_tactics.tactics) {
              this.preTacticNavigations.push({ url: 'stix/tactics/pre/' + tactic.tactic, label: tactic.tactic});
            }
            for (let tactic of data[0].attributes.configValue.mobile_tactics.tactics) {
              this.mobileTacticNavigations.push({ url: 'stix/tactics/mobile/' + tactic.tactic, label: tactic.tactic});
            }
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
