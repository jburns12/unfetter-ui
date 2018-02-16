export class FormatHelpers {
    public static whitespaceToBreak(inputString: string): string {
        return inputString ? inputString.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
    }

    public static mitreCitationsToHtml(inputString: string): string {
        return inputString ? inputString.replace(/\[\[Citation: ([^\]\]]*)\]\]/g, `&nbsp;<small><cite class="text-muted">($1)</cite></small>`) : '';
    }

    public static mitreCiteRefToHtml(inputString: string): string {
        return inputString ? inputString.replace(/\[\[CiteRef::([^\]\]]*)\]\]/g, `&nbsp;<small><cite class="text-muted">($1)</cite></small>`) : '';
    }

    public static mitreLinkToHtml(inputString: string): string {
        return inputString ? inputString.replace(/{{LinkById\|(.*?)}}/g, `<b>$1</b>`) : '';
    }

    public static tacticsToHtml(inputString: string): string {
        return inputString ? inputString.replace(/\[\[(.*?)\]\]/g, `<b>$1</b>`) : '';
    }

    public static formatAll(inputString) {
        return FormatHelpers.tacticsToHtml(FormatHelpers.whitespaceToBreak(FormatHelpers.mitreCitationsToHtml(FormatHelpers.mitreCiteRefToHtml(FormatHelpers.mitreLinkToHtml(inputString)))));
    }
}
