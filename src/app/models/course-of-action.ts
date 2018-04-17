import { ExternalReference, KillChainPhase, Label } from '.';
import { Constance } from '../utils/constance';
import * as moment from 'moment';

export class CourseOfAction {
    public url = Constance.COURSE_OF_ACTION_URL;
    public id: string;
    public type: string;

    public attributes: {
        version: string;
        created: string;
        create_by_ref: string;
        modified: string;
        description: string;
        name: string;
        object_marking_refs: string[];
        external_references: ExternalReference[];
        x_mitre_collections: string[];
        x_mitre_deprecated: boolean;
    };
    constructor(data?: CourseOfAction) {
        this.type = Constance.COURSE_OF_ACTION_TYPE;
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
            // created: new Date().toISOString(),
            //  modified: new Date().toISOString(),

            // name: '',
            // description: '',
            created_by_ref: 'identity--c78cb6e5-0c4b-4611-8297-d1b8b55e40b5',
            object_marking_refs: ['marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168'],
            // labels: [],
            external_references: [],
            // kill_chain_phases: []
        };
    }
}
