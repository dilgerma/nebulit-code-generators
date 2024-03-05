## Nebulit GmbH - Eventmodeling, CRQS & Eventsourcing Workshop

Diese Applikation ist ein Beispiel für die Umsetzung mit CQRS und Eventsourcing.
Die Applikation verwendet Live-Models (In Memory Projections) und eine Postgres Datenbank zur persistierung der Events.

[Eventmodeling / Eventsourcing / CQRS Training](https://nebulit.de/schulungen)

Die Anwendung basiert Spring Boot und verwendet keinerlei _Eventsourcing-Frameworks_

Das Eventmodel definiert 13 Slices

![Slices](/assets/eventmodel.png)

Alles was für die Umsetzung notwendig ist ist ein Miro Board und eine einfache Relationale Datenbank.

Slices aus dem Eventmodel sind unter "src/kotlin/de/nebulit/eventsourcing/challenge/slices"

![Slices](/assets/slices.png)

Wenn dir die Applikation gefällt, folge mir auf [LinkedIn](https://www.linkedin.com/in/martindilger/)

[Website](https://www.nebulit.de)
