-- Create <%=tableName%> table
CREATE TABLE IF NOT EXISTS "public"."<%=tableName%>"
(
<% fields.forEach(function(field, index) { %>    <%=field.name%> <%=sqlTypeMapping(field.type, field.cardinality)%><% if (field.idAttribute) { %> PRIMARY KEY<% } %><% if (index < fields.length - 1) { %>,<% } %>
<% }); %>);
