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
    { url: 'stix/course-of-actions', label: 'Courses of Action' },
    // { url: 'indicators', label: 'Indicators' },
    // { url: 'identities', label: 'Identities' },
    // { url: 'stix/malwares', label: 'Malware' },
    // { url: 'relationships', label: 'Relationships' },
    // { url: 'sightings', label: 'Sightings' },
    // { url: 'stix/tools', label: 'Tools' },
    { url: 'stix/softwares', label: 'Software' },
    // { url: 'threat-actors', label: 'Threat Actors' },
    { url: 'stix/intrusion-sets', label: 'Groups' },
    { url: 'stix/citations', label: 'Citations'}
    // { url: 'reports', label: 'Reports' },
    // { url: 'x-unfetter-sensors', label: 'Sensors'}
];
  constructor(public authService: AuthService) {}
}
