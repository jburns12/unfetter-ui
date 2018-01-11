
import { Component, OnInit } from '@angular/core';
import { Constance } from '../../../utils/constance';

@Component({
  selector: 'software-home',
  template: `<page-header [pageTitle]='pageTitle'  [pageIcon]='pageIcon' [secondaryIcon]='secondaryIcon' [description]="description"></page-header>`,
})
export class SoftwareHomeComponent {

    public pageTitle = 'Software';
    public pageIcon = Constance.MALWARE_ICON;
    public secondaryIcon = Constance.TOOL_ICON;
    public description = 'These are the relationships explicitly defined between the Malware object ' +
    'and other objects. The first section lists the embedded relationships by property name along with their ' +
    'corresponding target. The rest of the table identifies the relationships that can be made from the Malware ' +
    'object by way of the Relationship object. The reverse relationships (relationships to the Malware object) are included as a convenience.';
}
