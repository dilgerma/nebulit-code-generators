const {_eventTitle, _aggregateTitle, _readmodelTitle} = require("../../common/util/naming")
const {variableAssignments} = require("../common/domain")

/**
 * export const loadFromStream = async (aggregateId: string): Promise<ReadStreamResult<CartAggregateEvents>> => {
 *     var eventStore = findEventStore();
 *     //@ts-ignore
 *     let data = await eventStore.readStream(`CartAggregate-${aggregateId}`)
 *     var events = data?.events as CartAggregateEvents[]
 *     return events?.reduce((acc, eventData) => evolve(acc, eventData), initialState())
 * }
 * @param readModel
 */
function renderLoadFromStream(readModel) {

    var aggregateDependencies = readModel.aggregateDependencies
    //render all aggregateEvents to Aggregate1Events|Aggregate2Events
    var eventsType = aggregateDependencies.map(aggregate => `${_aggregateTitle(aggregate)}Events`).join("|")

    return `export const loadFromStream = async (streamId: string, initialState:${_readmodelTitle(readModel.title)}): Promise<${_readmodelTitle(readModel.title)}> => {
            
            var eventStore = findEventStore();
            //@ts-ignore
            let data = await eventStore.readStream(streamId)
            var events = data?.events as (${eventsType})[]
            return events?.reduce((acc:${_readmodelTitle(readModel.title)}, eventData:(${eventsType})) => evolve(acc, eventData), initialState)
        }`
}

/*switch (type) {

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

function renderSwitchStatement(element, typeName = "type", stateName = "state", events, renderAssignmentFunction) {
    return `switch(${typeName}) {
        ${events.map(event => {
        return `
\t\tcase '${_eventTitle(event.title)}':
            return {
            \t...${stateName},
            \t${renderAssignmentFunction ? renderAssignmentFunction(element, event) : ""}
            }`
    }).join("\n")}
\t\tdefault: return ${stateName}
    }`
}

module.exports = {renderSwitchStatement, renderLoadFromStream}
