import { ExternalReference } from '.';
import { Constance } from '../utils/constance';
import * as moment from 'moment';

export class XMitreTactic {
    public url = Constance.X_MITRE_TACTIC_URL;
    public id: string;
    public type: string;
    public attributes: {
        version: string;
        created: string;
        created_by_ref: string;
        modified: string;
        description: string;
        name: string;
        labels: string[];
        aliases: string[];
        first_seen: any;
        last_seen: any;
        goals: string;
        resource_level: string;
        primary_motivation: string;
        secondary_motivation: string[ ],
        object_marking_refs: string[];
        objective: string;
        timestamp_precision: string;
        revoked: boolean;
        external_references: ExternalReference[];
        x_mitre_collections: string[];
        x_mitre_deprecated: boolean;
        x_mitre_shortname: string;
    };

    constructor(data?: XMitreTactic) {
        this.type = Constance.X_MITRE_TACTIC_TYPE;
        if (data) {
            this.attributes = data.attributes;
            this.id = data.id;
            // this.formatDate();
        } else {
            this.attributes = this.createAttributes();
        }
    }

    public formatDate(): void {
       this.attributes.first_seen =  this.attributes.first_seen ?
           new Date(this.attributes.first_seen) : new Date();
       this.attributes.last_seen =  this.attributes.last_seen ?
           new Date(this.attributes.last_seen) : new Date();
    }

    private createAttributes(): any {
        return {
            // version: '',
            // created: moment().format(Constance.DATE_FORMATE),
            // modified: moment().format(Constance.DATE_FORMATE),
            // name: '',
            // description: '',
            // first_seen: new Date(),
            // last_seen: new Date(),
            // goals: '',
            // resource_level: '',
            // primary_motivation: '',
            // secondary_motivation: [ ],
            // objective: '',
            // timestamp_precision: '',
            // labels: [],
            created_by_ref: 'identity--c78cb6e5-0c4b-4611-8297-d1b8b55e40b5',
            object_marking_refs: ['marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168'],
            external_references: [],
            // kill_chain_phases: []
        };
    }
}
