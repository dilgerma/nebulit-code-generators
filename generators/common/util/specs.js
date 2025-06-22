

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

    const fieldsWithExamples = element?.fields?.filter(field => field.example) || [];

    const fieldsSection = fieldsWithExamples.length > 0
        ? `\n  #### Fields:\n${fieldsWithExamples.map(field => ` - ${field.name}: ${field.example}`).join('\n')}`
        : '';

    return `  * ${element?.title}${fieldsSection}`;
}

module.exports = {
    analyzeSpecs
}
