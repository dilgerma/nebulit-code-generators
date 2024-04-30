const {_eventTitle} = require("../../common/util/naming")

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
function renderSwitchStatement(typeName="type", stateName="state", events){
    return `switch(${typeName}) {
        ${events.map(event=> {
            return `
\t\tcase '${_eventTitle(event.title)}':
            return {
            \t...${stateName}
            }`
    }).join("\n")}
\t\tdefault: return ${stateName}
    }`
}

module.exports = renderSwitchStatement
