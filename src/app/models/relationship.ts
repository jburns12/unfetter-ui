import { ExternalReference, KillChainPhase } from '.';
import { Constance } from '../utils/constance';
import * as moment from 'moment';

export class Relationship {
    public url = Constance.RELATIONSHIPS_URL;
    public id: string;
    public type: string;

    public attributes: {
        created: Date;
        modified: Date;
        created_by_ref: string;
        version: string;
        labels: string[];
        external_references: ExternalReference[];
        kill_chain_phases: KillChainPhase[];
        object_marking_refs: string[];
        name: string;
        description: string;
        relationship_type: string;
        source_ref: string;
        target_ref: string;
        x_mitre_collections: string[];
    };

    constructor(data?: any) {
        this.type = Constance.RELATIONSHIPS_TYPE;
        if (data) {
            this.attributes = data.attributes;
            this.id = data.id;
        } else {
            this.attributes = this.createAttributes();
        }
    }

    private createAttributes(): any {
        return {
            // version: '1',
            // created: moment().format(Constance.DATE_FORMATE),
            // modified: moment().format(Constance.DATE_FORMATE),
            // labels: [],
            // external_references: [],
            // kill_chain_phases: [],
            // name: '',
            // description: '',
            // relationship_type: '',
            // source_ref: '',
            // target_ref: ''
            created_by_ref: 'identity--c78cb6e5-0c4b-4611-8297-d1b8b55e40b5',
            object_marking_refs: ['marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168']
        };
    }
}
