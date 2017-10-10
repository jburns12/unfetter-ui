import { ExternalReference, KillChainPhase } from '.';
import { Constance } from '../utils/constance';

export class AttackPattern {
    public url = Constance.ATTACK_PATTERN_URL;
    public id: string;
    public type: string;
    public links: {self: string};
    public x_unfetter_sophistication_level: number;
    public description: string;

    public attributes: {
        created_by_ref: string;
        created: Date;
        modified: Date;
        description: string;
        name: string;
        labels: string[];
        external_references: ExternalReference[];
        kill_chain_phases: KillChainPhase[];
        object_marking_refs: string[];
        x_mitre_contributors: string[];
        x_mitre_data_sources: string[];
        x_mitre_platforms: string[];
        x_mitre_system_requirements: string;
        x_mitre_effective_permissions: string[];
        x_mitre_defense_bypassed: string;
        x_mitre_remote_support: boolean;
        x_mitre_detection: string;
        x_mitre_permissions_required: string[];
        x_mitre_network_requirements: boolean;
    };

    constructor(data?: AttackPattern) {
        this.type = Constance.ATTACK_PATTERN_TYPE;
        if (data) {
            this.attributes = data.attributes;
            this.id = data.id;
        } else {
            this.attributes = this.createAttributes();
        }
    }

    private createAttributes(): any {
        return {
            // version: '',
            // created: new Date(),
            // modified: new Date(),
            // description: '',
            // name: '',
            // labels: [],
            external_references: [],
            kill_chain_phases: [],
            object_marking_refs: ["marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168"],
            x_mitre_platforms: [],
            x_mitre_contributors: [],
            x_mitre_data_sources: [],
            // x_mitre_permissions_required: [],
            // x_mitre_effective_permissions: [],
            x_mitre_detection: '',
            created_by_ref: "identity--c78cb6e5-0c4b-4611-8297-d1b8b55e40b5"
            // x_unfetter_sophistication_level: -1
        };
    }
}
