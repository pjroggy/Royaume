# Registre des décisions d'architecture

Chaque décision d'architecture du projet est consignée dans un ADR, à partir du modèle
`template.md`. Un ADR accepté n'est jamais modifié sur le fond : si la décision évolue,
un nouvel ADR est rédigé et l'ancien prend le statut « remplacé ».

| N° | Décision | Statut |
| --- | --- | --- |
| [0001](0001-monolithe-modulaire.md) | Monolithe modulaire plutôt que microservices | Accepté |
| [0002](0002-event-sourcing-village.md) | Event Sourcing pour le Village | Accepté |
| [0003](0003-server-sent-events.md) | Server-Sent Events, alimentés par le journal, pour le temps réel | Accepté |
| [0004](0004-manches-simultanees.md) | Manches simultanées et échéances paresseuses pour le Donjon | Accepté |
| [0005](0005-intelligence-artificielle.md) | Intelligence artificielle déterministe, sans tâche de fond | Accepté |
| [0006](0006-cqrs-projections.md) | CQRS : modèles de lecture tenus par des projections rattrapées à la lecture | Accepté |
| [0007](0007-saga-boite-envoi.md) | Saga orchestrée et boîte d'envoi transactionnelle pour les opérations entre modules | Accepté |
| [0008](0008-donnees-personnelles.md) | Stockage classique pour la Taverne, et réécriture ciblée du journal pour l'effacement | Accepté |
| [0009](0009-extraction-village.md) | Extraction du Village en service autonome, préparée mais non déployée | Accepté |
| [0010](0010-forge-journal-evenements.md) | La Forge stockée dans le journal d'événements, un flux par joueur | Accepté |
| [0011](0011-forge-saga-village.md) | Paiement des fabrications par une saga orchestrée par la Forge, échangée avec le Village par messages | Accepté |
| [0012](0012-chat-du-joueur-composition-interface.md) | Le chat du joueur : données dans la Forge, affichage par composition d'interface | Accepté |
| [0013](0013-icones-game-icons.md) | Icônes Game-icons.net, par react-icons, à la place des émojis | Accepté |
| [0014](0014-forge-delai-paiement.md) | Délai de réponse du Village et remboursement d'un prélèvement tardif, pour la Forge | Accepté |
| [0015](0015-animations-motion.md) | Animations de l'interface par Motion, essayées sur la Forge (pilote) | Accepté |
| [0016](0016-equipement-donjon.md) | L'équipement de la Forge renforce les héros du Donjon, par un port relié à la racine de composition | Accepté |