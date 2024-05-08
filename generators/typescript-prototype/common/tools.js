const {_eventTitle} = require("../../common/util/naming")
const {variableAssignments} = require("../common/domain")
/*
*
* switch (type) {

        case '<%=_eventName%>':
        //case 'CartItemAddedEvent':
            return {
                //aggregateId: state.aggregateId,
                //cartItemIds: [...state.cartItemIds, data.cartItemId]
                <!%=_eventAssignments%>
            };
        default:
            return state;
    }
* */
function renderSwitchStatement(element, typeName="type", stateName="state", events, renderAssignmentFunction){
    return `switch(${typeName}) {
        ${events.map(event=> {
            return `
\t\tcase '${_eventTitle(event.title)}':
            return {
            \t...${stateName},
            \t${renderAssignmentFunction?renderAssignmentFunction(element, event):""}
            }`
    }).join("\n")}
\t\tdefault: return ${stateName}
    }`
}

module.exports = renderSwitchStatement
