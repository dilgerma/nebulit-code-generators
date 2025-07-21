function analyzeSpecs(spec) {
    if (!spec) return '';

    const comments = spec?.comments?.length > 0
        ? `\nComments:\n${spec.comments.map(comment => `  - ${comment.description}`).join('\n')}`
        : '';

    const given = spec.given?.length > 0
        ? `\n### Given (Events):\n${spec.given.map(event => _elementAnalyze(event)).join('\n')}`
        : '\n### Given (Events): None';

    const when = spec.when?.length > 0
        ? `\n### When (Command):\n${spec.when.map(command => _elementAnalyze(command)).join('\n')}`
        : '\n### When (Command): None';

    const then = spec.error
        ? '\n### Then: Expect error'
        : spec.then?.length > 0
            ? `\n### Then:\n${spec.then.map(event => _elementAnalyze(event)).join('\n')}`
            : '\n### Then: None';

    return `
# Spec Start
Title: ${spec?.title}${comments}${given}${when}${then}
# Spec End`;
}

function _elementAnalyze(element) {
    if (!element) return '';

    const fieldsWithExamples = element?.fields ?? []

    let fieldsSection

    if (element?.examples?.length > 0) {
        //render example entries
        fieldsSection = `
Expected Items in List:
        ${element.examples.map((item, cnt) =>
            ` 
** Item ${cnt + 1}\n${Object.entries(item).map(entry => ` - ${entry[0]}: ${(entry[1] ?? "(not specified)")}`).join('\n')}`).join('\n')}`;
    } else {
        fieldsSection = fieldsWithExamples.length > 0
            ? (element.expectEmptyList ? `\nExpects List to be empty` : (`\nFields:\n${fieldsWithExamples.map(field => ` - ${field.name}: ${field.example}`).join('\n')}`))
            : '';
    }

    return `  * '${element?.title}' (${element?.type})${fieldsSection}`;
}

module.exports = {
    analyzeSpecs
}
