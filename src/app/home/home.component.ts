import { Component } from '@angular/core';

import { AuthService } from '../global/services/auth.service';

@Component({
  selector: 'home',
  styleUrls: [ './home.component.scss' ],
  templateUrl: './home.component.html'
})

export class HomeComponent {
  public navigations: any[] = [
    { url: 'stix/attack-patterns', label: 'Techniques' },
    // { url: 'campaigns', label: 'Campaigns' },
    { url: 'stix/course-of-actions', label: 'Mitigations' },
    // { url: 'indicators', label: 'Indicators' },
    // { url: 'identities', label: 'Identities' },
    // { url: 'stix/malwares', label: 'Malware' },
    // { url: 'relationships', label: 'Relationships' },
    // { url: 'sightings', label: 'Sightings' },
    // { url: 'stix/tools', label: 'Tools' },
    { url: 'stix/softwares', label: 'Software' },
    // { url: 'threat-actors', label: 'Threat Actors' },
    { url: 'stix/intrusion-sets', label: 'Groups' },
    { url: 'stix/x-mitre-tactics', label: 'Tactics' },
    { url: 'stix/x-mitre-matrices', label: 'Matrices' },
    { url: 'stix/citations', label: 'References'},
    { url: 'stix/history', label: 'History'}
    // { url: 'reports', label: 'Reports' },
    // { url: 'x-unfetter-sensors', label: 'Sensors'}
];
  constructor(public authService: AuthService) {}
}
