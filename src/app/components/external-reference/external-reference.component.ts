import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import { ExternalReference } from '../../models';

@Component({
  selector: 'external-reference',
  templateUrl: './external-reference.component.html',
  styleUrls: ['./external-reference.component.scss']
})
export class ExternalReferenceComponent {

    @Input() public model: any;
    @Input() public citations: any;
    public extToFind: any;

    public addExternalReferenceButtonClicked(): void {
        let externalReference = new ExternalReference();
        externalReference.citeButton = 'Generate Citation Text';
        this.extToFind = externalReference;
    }

    public removeExternalReferenceButtonClicked(externalReference: ExternalReference): void {
        this.model.attributes.external_references = this.model.attributes.external_references.filter((h) => h !== externalReference);
    }

    public generateCitation(extRef: ExternalReference): void {
        if (extRef.citeButton === 'Generate Citation Text') {
            extRef.citeButton = 'Hide Citation Text';
        } else {
            extRef.citeButton = 'Generate Citation Text';
        }
    }

    public closeFinderButtonClicked(): void {
        this.extToFind = undefined;
    }

    public populateCitation(citationStr: string): any {
        let match = this.model.attributes.external_references.find((h) => h.source_name === citationStr);
        let index = this.model.attributes.external_references.indexOf(match);
        let citation = this.citations.find((h) => h.source_name === citationStr);
        if (citation) {
            this.model.attributes.external_references[index].external_id = citation.external_id;
            this.model.attributes.external_references[index].description = citation.description;
            this.model.attributes.external_references[index].url = citation.url;
        } else {
            this.model.attributes.external_references[index].external_id = '';
            this.model.attributes.external_references[index].description = '';
            this.model.attributes.external_references[index].url = '';
        }
        this.model.attributes.external_references[index].citation = '[[Citation: ' + citationStr + ']]';
        this.model.attributes.external_references[index].citeref = '[[CiteRef::' + citationStr + ']]';
        if (citationStr) {
            let filterVal = citationStr.toLowerCase();
            return this.citations.filter((h) => h.source_name.toLowerCase().startsWith(filterVal));
        }
        return [];
    }

    public populateFinderCitation(citationStr: string): any {
        let citation = this.citations.find((h) => h.source_name === citationStr);
        if (citation) {
            this.extToFind.external_id = citation.external_id;
            this.extToFind.description = citation.description;
            this.extToFind.url = citation.url;
        } else {
            this.extToFind.external_id = '';
            this.extToFind.description = '';
            this.extToFind.url = '';
        }
        this.extToFind.citation = '[[Citation: ' + citationStr + ']]';
        this.extToFind.citeref = '[[CiteRef::' + citationStr + ']]';
        if (citationStr) {
            let filterVal = citationStr.toLowerCase();
            return this.citations.filter((h) => h.source_name.toLowerCase().startsWith(filterVal));
        }
        return [];
    }
}
