import { ExternalReference, KillChainPhase } from '.';
import { Constance } from '../utils/constance';
import * as moment from 'moment';

export class Tool {
    public url = Constance.TOOL_URL;
    public id: string;
    public type: string;
    public links: {self: string};

    public attributes: {
        version: string;
        created: Date;
        created_by_ref: string;
        modified: Date;
        description: string;
        name: string;
        labels: string[];
        object_marking_refs: string[];
        external_references: ExternalReference[];
        kill_chain_phases: KillChainPhase[];
        x_mitre_aliases: string[];
        x_mitre_id: string;
    };

    constructor(data?: Tool) {
        this.type = Constance.TOOL_TYPE;
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
            // description: '',
            // name: '',
            labels: [],
            external_references: [],
            object_marking_refs: ['marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168'],
            // x_mitre_aliases: [],
            created_by_ref: 'identity--c78cb6e5-0c4b-4611-8297-d1b8b55e40b5'
            // kill_chain_phases: []
        };
    }
}
