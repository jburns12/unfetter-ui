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
        x_mitre_contributors: string[];
        x_mitre_data_sources: string[];
        x_mitre_platforms: string[];
        x_mitre_system_requirements: string;
        x_mitre_effective_permissions: string[];
        x_mitre_defense_bypassed: string;
        x_mitre_remote_support: boolean;
        x_mitre_detection: string;
        x_mitre_permissions_required: string[];
        x_mitre_requires_network: boolean;
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
            labels: [],
            external_references: [],
            kill_chain_phases: [],
            x_mitre_platforms: [],
            x_mitre_contributors: [],
            x_mitre_data_sources: [],
            // x_unfetter_sophistication_level: -1
        };
    }
}
