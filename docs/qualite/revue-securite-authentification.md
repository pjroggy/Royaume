# Revue de sécurité du parcours d'authentification

- Date : 2026-10-23
- Périmètre : inscription, connexion, déconnexion, sessions, accès à l'API et aux pages du jeu.
- Références : OWASP Top 10, OWASP ASVS.

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| S1 | Les mots de passe ne sont conservés que sous forme d'empreinte, par une fonction dédiée | Test « ne conserve qu'une empreinte du mot de passe » ; documentation de Better Auth | Le test réussit : la colonne `identity.account.password` est renseignée et ne contient pas le mot de passe. Le hachage est délégué à Better Auth, qui utilise une fonction de dérivation de clé lente (scrypt) ; le projet ne manipule jamais le mot de passe en clair. | Conforme |
| S2 | Les mots de passe comportent au moins 8 caractères | Test « refuse un mot de passe trop court » | `minPasswordLength: 8` dans `better-auth.ts` ; le test reçoit une erreur 400 pour un mot de passe de 5 caractères. | Conforme |
| S3 | Les tentatives répétées d'inscription et de connexion sont limitées | Sous-partie 2.3 ; configuration de `better-auth.ts` | Limites par adresse IP : 40 inscriptions et 60 connexions par minute. Depuis le TD11, les compteurs sont conservés dans `identity.rate_limit` et partagés entre instances (DT-004 remboursée) ; le test « conserve les compteurs dans la base… » constate le code 429 à la 61e tentative. La limitation ne peut être désactivée qu'en local (`AUTH_RATE_LIMIT=off`), jamais sur Vercel. Les seuils sont volontairement élevés, car tous les postes d'une salle partagent la même adresse IP : ils ralentissent une attaque automatisée sans l'empêcher. | Conforme |
| S4 | Le cookie de session est inaccessible au JavaScript de la page | Test sur l'attribut `HttpOnly` | Le test « pose un cookie de session inaccessible au JavaScript de la page » constate l'attribut `HttpOnly` dans l'en-tête `set-cookie`. | Conforme |
| S5 | Le cookie de session n'est pas envoyé par les requêtes émises depuis un autre site | Test sur l'attribut `SameSite` | Le même test constate `SameSite=Lax` : le cookie n'accompagne ni les requêtes `POST` ni les requêtes de script émises depuis un autre site. Il accompagne encore une navigation de premier niveau (lien suivi) ; aucune route `GET` ne modifie de données, ce qui rend cette exception sans effet. | Conforme |
| S6 | Le cookie de session ne circule que sur des connexions chiffrées | Inspection du cookie dans le navigateur ; comportement en local et en production | En production, le cookie se nomme `__Secure-better-auth.session_token` et porte l'attribut `Secure` : le navigateur ne le transmet que sur HTTPS. En local, sur `http://localhost`, l'attribut est absent, ce qui est sans conséquence puisque la connexion ne quitte pas le poste. | Conforme |
| S7 | Le secret de signature n'est pas versionné, et son absence en production empêche le démarrage | `git grep BETTER_AUTH_SECRET` ; fonction `resolveSecret` | `git grep` ne trouve que le nom de la variable, sans valeur, dans `.env.example`, `better-auth.ts` et la documentation. `resolveSecret` lève une erreur lorsque la variable manque sur Vercel en production. La valeur de développement est fixe et nommée `dev-only-secret-not-for-production-use…`, sans usage possible en production. | Conforme |
| S8 | La connexion ne révèle pas si une adresse est inscrite | Test « répond de la même manière que l'adresse existe ou non » | Le test réussit : même code et même corps de réponse pour une adresse inscrite avec un mauvais mot de passe et pour une adresse inconnue. | Conforme |
| S9 | L'inscription ne révèle pas si une adresse est inscrite | Création d'un compte avec une adresse déjà utilisée | Vérifié par l'auteur le 2026-10-23 : la page affiche « Cette adresse est déjà utilisée. » ; l'inscription révèle donc l'existence d'un compte. Ce risque est accepté, car le jeu ne conserve aucune donnée sensible, n'envoie aucun courrier, et l'utilisateur doit savoir pourquoi l'inscription échoue ; la limitation des inscriptions (S3) freine une énumération massive. | Risque accepté |
| S10 | Toute route de l'API réservée aux joueurs refuse une requête anonyme | Tests « Contrôle d'accès à l'API du Village » ; racine de composition | `requireUser` est appliqué dans `create-api.ts` à `/realm`, `/dungeon`, `/ranking`, `/market`, `/tavern`, `/account` et `/stream`. Chaque module a un test de refus anonyme (401) : Village, Donjon, Classement, Marché, Taverne (messages et présence), droits des joueurs et temps réel. Restent publiques par choix : `/system/health`, `/auth/*`, `/cron` et `/internal` (ces deux dernières protégées par un secret). Le risque d'oubli lors de l'ajout d'un module demeure, puisque la protection est déclarée module par module ; il est maîtrisé par la convention d'un test de refus anonyme par module. | Conforme |
| S11 | Un joueur ne peut accéder qu'à ses propres données | Test « isole les villages des joueurs » ; origine de `userId` dans les routes | Le test réussit. Dans les `api.ts` de tous les modules, l'identifiant du joueur provient exclusivement de `c.var.userId`, placé par `requireUser` ; aucune route n'accepte d'identifiant de joueur dans le corps ou l'adresse de la requête. | Conforme |
| S12 | Les pages du jeu sont protégées sur le serveur, avant tout rendu | Mise en page `app/(jeu)/layout.tsx` ; accès à `/village` sans session | La mise en page est un composant serveur, rendu à chaque requête (`dynamic = 'force-dynamic'`), qui appelle `currentUser` et redirige vers `/login` avant tout rendu. Vérifié par l'auteur le 2026-10-23 : `/village`, ouverte dans une fenêtre de navigation privée, redirige vers `/login`. | Conforme |
| S13 | Les erreurs imprévues ne révèlent aucun détail technique au client | Gestionnaire `onError` de la racine de composition | `app.onError` renvoie toujours `{ error: { code: 'INTERNAL', message: 'Erreur interne' } }` avec le code 500, et une route inconnue une erreur 404 au même format (test « renvoie une erreur JSON uniforme… »). Le détail de l'erreur n'est écrit que dans les journaux du serveur (voir l'exigence R9 de la revue RGPD). | Conforme |
| S14 | La déconnexion invalide la session sur le serveur | Réutilisation d'un cookie après déconnexion | Vérifié par l'auteur le 2026-10-23 avec curl : après la déconnexion, la réutilisation du cookie conservé reçoit une erreur 401 ; le cookie ne correspond plus à aucune session sur le serveur. | Conforme |
| S15 | Une requête d'authentification accompagnée d'un cookie et émise depuis une autre origine est refusée | Appel de la déconnexion avec un en-tête `origin` étranger | `trustedOrigins` ne contient que l'adresse de l'application et les domaines Vercel du projet. Vérifié par l'auteur le 2026-10-23 avec curl : une déconnexion émise avec une origine étrangère reçoit l'erreur `INVALID_ORIGIN`, et sans en-tête `origin` l'erreur `MISSING_OR_NULL_ORIGIN`. C'est la protection contre la falsification de requête, qui complète l'attribut `SameSite`. | Conforme |
| S16 | Un flux temps réel n'est accessible qu'aux joueurs connectés, et seulement pour les canaux auxquels ils ont droit | Tests « réserve le temps réel aux joueurs connectés (401) », « refuse l'écoute du village d'un autre joueur (403) » et « refuse un canal qu'aucune règle ne couvre (403) » ; principe de l'accès fermé par défaut dans `channel-policy.ts` | Un visiteur anonyme reçoit une erreur 401, un joueur qui tente d'écouter le village d'un autre joueur une erreur 403. Un canal sans règle est refusé : l'oubli d'une règle par un module futur rend ses canaux inaccessibles, et non publics. | Conforme |

## Synthèse

Sur 16 exigences : 15 conformes, 1 en risque accepté (S9), aucune non conforme.

Actions décidées :

- S9 : le risque est accepté sans action ; il serait réexaminé si le jeu envoyait des courriers électroniques ou conservait des données sensibles.
- S10 : le risque d'oubli de la protection d'un futur module reste maîtrisé par convention. Un test qui parcourt toutes les routes de l'application, sauf une liste explicite de routes publiques, le supprimerait (piste « Pour approfondir » du TD4, utile pour le module de l'évaluation).

## Vérifications manuelles

Menées le 2026-10-23, avec le serveur de développement démarré (`pnpm dev`) :

- **S9** : sur `/login`, créez un compte avec une adresse déjà inscrite, et relevez le message affiché.
- **S12** : ouvrez `http://localhost:3000/village` dans une fenêtre de navigation privée ; vous devez être redirigé vers `/login`.
- **S14 et S15** : connectez-vous avec curl en conservant le cookie, puis :

```bash
curl -c cookies.txt -X POST -H "content-type: application/json" -H "origin: http://localhost:3000" \
  -d '{"email":"<adresse>","password":"<mot de passe>"}' http://localhost:3000/api/auth/sign-in/email
# S15 : origine étrangère, puis aucune origine
curl -b cookies.txt -X POST -H "content-type: application/json" \
  -H "origin: http://site-malveillant.example" -d '{}' http://localhost:3000/api/auth/sign-out
curl -b cookies.txt -X POST -H "content-type: application/json" -d '{}' http://localhost:3000/api/auth/sign-out
# S14 : déconnexion légitime, puis réutilisation du cookie
curl -b cookies.txt -X POST -H "content-type: application/json" \
  -H "origin: http://localhost:3000" -d '{}' http://localhost:3000/api/auth/sign-out
curl -b cookies.txt http://localhost:3000/api/realm/village
rm cookies.txt
```
