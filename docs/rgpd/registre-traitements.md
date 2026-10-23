# Registre des traitements de données personnelles

Ce registre, prévu par l'article 30 du RGPD, recense les traitements de données personnelles
réalisés par Royaumes. Il est tenu à jour à chaque évolution du jeu qui ajoute, modifie ou
supprime une donnée personnelle, dans le même commit que cette évolution.

- Responsable du traitement : Pierre-Jean Roggy, auteur du projet ; contact par le dépôt GitHub `pjroggy/Royaume`.
- Date de dernière mise à jour : 2026-10-23.

## Sous-traitants

| Sous-traitant | Rôle | Localisation des données | Garanties à vérifier |
| --- | --- | --- | --- |
| Vercel | Hébergement de l'application, journaux techniques | Fonctions exécutées dans la région de Francfort (`fra1`, `vercel.json`) ; société établie aux États-Unis | L'accord de traitement des données (DPA) de Vercel ne s'applique qu'aux offres Pro et Enterprise : l'offre Hobby, réservée à un usage personnel et non commercial, n'en bénéficie pas. Les transferts hors de l'Union européenne reposent, dans ce DPA, sur les clauses contractuelles types de 2021. À régulariser avant toute ouverture à un public réel. |
| Neon | Hébergement de la base de données | Base créée dans la région de Francfort ; société établie aux États-Unis | Neon intègre un accord de traitement des données à ses conditions d'utilisation ; les transferts hors de l'Union européenne reposent sur le Data Privacy Framework. La couverture explicite de l'offre gratuite reste à confirmer dans les conditions de Neon. |

## Traitements

| N° | Traitement | Finalité | Données | Personnes concernées | Base légale | Durée de conservation | Emplacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | Comptes des joueurs | Permettre l'accès au jeu | Nom, adresse électronique, empreinte du mot de passe, date d'inscription | Joueurs | Exécution du contrat (conditions d'utilisation du jeu) | Jusqu'à la suppression du compte | `identity.user`, `identity.account` |
| T2 | Sessions et limitation des tentatives | Maintenir la connexion ; limiter les tentatives de connexion et d'inscription | Adresse IP, navigateur, dates de la session ; adresse IP et nombre de tentatives par route | Joueurs, visiteurs | Exécution du contrat ; intérêt légitime (sécurité) | Sessions : jusqu'à leur expiration, ou la suppression du compte, mais les sessions expirées ne sont pas encore supprimées (DT-012). Compteurs : aucune purge, la ligne d'une adresse étant réutilisée à chaque fenêtre | `identity.session`, `identity.rate_limit` |
| T3 | Activité de jeu | Faire fonctionner le Village, le Donjon, le Marché et le Classement | Identifiant, nom du joueur, nom du village, actions de jeu | Joueurs | Exécution du contrat | Jusqu'à la suppression du compte ; ensuite, identifiant pseudonymisé et noms remplacés (ADR 0008) | `platform.events`, `platform.outbox`, `ranking`, `dungeon`, `market` |
| T4 | Messagerie de la Taverne | Permettre aux joueurs de discuter | Contenu des messages, auteur, date | Joueurs | Exécution du contrat | Trente jours, ou jusqu'à la suppression du compte | `tavern.messages` |
| T5 | Présence dans la Taverne | Indiquer les joueurs présents | Identifiant, nom, date du dernier signal | Joueurs | Exécution du contrat | Deux minutes après le dernier signal | `tavern.presence` |
| T6 | Registre des effacements | Démontrer la réalisation des effacements | Date de l'effacement, nombre d'événements réécrits ; aucune donnée sur le joueur | Aucune personne identifiable | Obligation légale (responsabilité, article 5) | Illimitée | `platform.erasures` |
| T7 | Journaux techniques | Diagnostiquer les erreurs, assurer la sécurité | Adresse IP, adresses des requêtes, messages d'erreur | Joueurs, visiteurs | Intérêt légitime (sécurité, maintenance) | Une heure : durée de conservation des journaux d'exécution sur l'offre Hobby de Vercel | Vercel |

## Droits des personnes

| Droit | Mise en œuvre |
| --- | --- |
| Accès et portabilité (articles 15 et 20) | Page « Mes données » : export JSON de toutes les données du joueur |
| Effacement (article 17) | Page « Mes données » : suppression du compte, effective dans tous les modules |
| Rectification (article 16) | Non mis en œuvre : le nom d'un joueur ne peut pas encore être modifié |