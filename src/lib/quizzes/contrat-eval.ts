import { EXAM_QUESTION_MS } from "../exam-timing"
import type { Question } from "../types"

// J1 : cours 1 « Deux équipes, un contrat » · J2 : cours 2 « Le contrat d’abord ».
export const CONTRAT_EVAL_QUESTIONS: Question[] = [
  {
    id: "eval-contrat-verifiable",
    day: "J1",
    context:
      "Le cours définit un contrat d’API comme « une promesse vérifiable ».",
    prompt: "Qu’est-ce qui distingue un contrat d’une simple documentation ?",
    choices: [
      "Il est rédigé par l’équipe back, qui connaît le code",
      "Une machine peut dire, sans vous, si la promesse est tenue",
      "Il est publié sur un wiki accessible aux deux équipes",
      "Il décrit aussi le schéma de la base de données",
    ],
    correctIndex: 1,
    explanation:
      "Promesse : ce que chaque côté peut attendre de l’autre. Vérifiable : un outil peut le contrôler. Si aucune machine ne peut le vérifier, c’est de la documentation.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-validation-sides",
    day: "J1",
    context:
      "Le formulaire du front vérifie déjà que le score est un entier positif avant l’envoi.",
    prompt: "Le back doit-il encore valider le score ?",
    choices: [
      "Non : valider deux fois la même règle est du code dupliqué",
      "Non : le contrat suffit à garantir la forme des requêtes",
      "Seulement en développement, pour déboguer le front",
      "Oui : le front aide à bien saisir, mais il se contourne ; c’est le back qui protège",
    ],
    correctIndex: 3,
    explanation:
      "La validation existe des deux côtés pour deux raisons différentes : ergonomie côté front, protection côté back. N’importe qui peut appeler l’API sans passer par le formulaire.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-conway",
    day: "J1",
    context:
      "Deux équipes front et back se parlent peu. Leur API finit par renvoyer « tout, au cas où », avec beaucoup de champs inutiles.",
    prompt: "Quelle idée du cours explique ce phénomène ?",
    choices: [
      "La loi de Conway : un système reproduit la structure de communication de l’organisation",
      "Le principe de robustesse : sois tolérant dans ce que tu acceptes",
      "Le niveau 3 de Richardson : l’hypermédia",
      "Le pattern BFF : un back par front",
    ],
    correctIndex: 0,
    explanation:
      "Selon Conway (1968), deux équipes qui communiquent mal produisent une API bavarde et défensive. L’API devient leur canal de communication officiel.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-ghost-field",
    day: "J1",
    context:
      "Le front affiche l’avatar à partir du champ `avatarUrl`. Le back ne l’envoie jamais, et personne ne s’en aperçoit avant l’intégration.",
    prompt: "Qu’est-ce qui aurait évité ce « champ fantôme » ?",
    choices: [
      "Un format d’erreur unique",
      "Une pagination décrite dans le contrat",
      "Un champ déclaré dans `required` dans le schéma de la réponse",
      "Un WebSocket à la place de REST",
    ],
    correctIndex: 2,
    explanation:
      "Déclarer explicitement ce qui est requis transforme une supposition du front en promesse vérifiable du back.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-extra-field",
    day: "J1",
    context:
      "Le schéma `Player` est `type: object`, `required: [playerId, pseudo, level]`, sans `additionalProperties: false`. Le back renvoie :\n`{ \"playerId\": \"p_42\", \"pseudo\": \"Neo\", \"level\": 7, \"avatar\": null }`",
    prompt: "Cette réponse respecte-t-elle le schéma ?",
    choices: [
      "Non : `avatar` n’est pas déclaré dans le schéma",
      "Oui : les champs requis sont présents et bien typés, un champ en plus est autorisé",
      "Non : un champ à `null` est toujours interdit",
      "Oui, mais seulement si `avatar` est ajouté à `required`",
    ],
    correctIndex: 1,
    explanation:
      "Sans `additionalProperties: false`, un champ supplémentaire est conforme. C’est le contrat qui tranche, pas l’intuition.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-not-fixed",
    day: "J1",
    context:
      "Un contrat d’API fixe ce qui se passe à la jointure entre les équipes, et laisse le reste libre.",
    prompt: "Lequel de ces éléments le contrat ne fixe-t-il pas ?",
    choices: [
      "Le schéma de la base de données du back",
      "Les codes de statut et le format d’erreur",
      "La forme exacte des requêtes et des réponses",
      "Les limites : débit, taille, pagination",
    ],
    correctIndex: 0,
    explanation:
      "Le langage, le framework, la base de données et l’organisation du code restent la liberté de chaque équipe. Plus le contrat est précis à la jointure, plus chacun est libre derrière.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-idempotence",
    day: "J1",
    context:
      "Le réseau coupe juste après l’envoi de `POST /api/v1/scores`. Le client ne sait pas si la requête est arrivée et la rejoue.",
    prompt: "Pourquoi ce rejeu pose-t-il question ?",
    choices: [
      "Parce que POST est un verbe sûr : il ne modifie rien",
      "Parce qu’un POST rejoué est toujours refusé par le serveur",
      "Parce que le rejeu transforme le POST en GET",
      "Parce que POST n’est pas idempotent : le rejouer peut produire un second effet",
    ],
    correctIndex: 3,
    explanation:
      "Idempotent signifie que rejouer la requête produit le même état. GET, PUT et DELETE le sont, POST non : le contrat doit dire ce qu’il advient d’un score envoyé deux fois.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-strict",
    day: "J1",
    context:
      "Le contrat déclare `level` comme un entier. Un client envoie `\"level\": \"3\"`.",
    prompt: "Quelle réaction du back correspond à la règle du cours ?",
    choices: [
      "Convertir silencieusement `\"3\"` en `3` pour ne pas bloquer le client",
      "Ignorer le champ et utiliser le niveau 1 par défaut",
      "Refuser la requête avec une erreur explicite et documentée",
      "Accepter la requête et journaliser un avertissement",
    ],
    correctIndex: 2,
    explanation:
      "Être tolérant crée un contrat implicite que personne n’a écrit, et dont un client finira par dépendre (RFC 9413). Validation stricte, erreur explicite, jamais de correction silencieuse.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-websocket",
    day: "J1",
    context:
      "Une équipe passe d’une API REST à un WebSocket pour une négociation en temps réel entre joueurs.",
    prompt: "Qu’est-ce qui change pour le contrat ?",
    choices: [
      "Il n’y a plus de verbes ni de codes HTTP : noms d’événements, charges et accusés sont à contractualiser",
      "Rien : OpenAPI décrit aussi bien les événements WebSocket",
      "Le contrat devient inutile, car la connexion est persistante",
      "Seul le serveur a besoin de connaître le format des messages",
    ],
    correctIndex: 0,
    explanation:
      "Le WebSocket n’a pas de sémantique HTTP. On écrit le contrat soi-même : types partagés en TypeScript, ou AsyncAPI entre équipes de langages différents.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-bff-key",
    day: "J1",
    context:
      "Pour envoyer les scores au hub, une équipe place la `X-Game-Key` dans le code JavaScript de son front.",
    prompt: "Quel est le problème ?",
    choices: [
      "Aucun, si la clé est minifiée dans le bundle",
      "Le navigateur refusera d’envoyer un en-tête personnalisé",
      "La clé expire au bout de deux heures",
      "N’importe qui peut lire la clé et envoyer des scores : elle doit rester dans le back du jeu (BFF)",
    ],
    correctIndex: 3,
    explanation:
      "Le back du mini-jeu est un BFF : il garde les secrets côté serveur, appelle le hub et adapte les réponses au front.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-code-first-risk",
    day: "J2",
    context:
      "Le back génère sa spec OpenAPI à partir de ses annotations de code (code-first). Deux équipes front consomment cette API.",
    prompt: "Quel est le risque principal de cette approche ?",
    choices: [
      "La spec générée est souvent invalide",
      "Le front ne peut pas générer de types depuis une spec générée",
      "L’API épouse le modèle interne du back, et décrit ce qu’il a fait plutôt que ce dont le front a besoin",
      "Le back ne peut plus changer de framework",
    ],
    correctIndex: 2,
    explanation:
      "Le code-first convient à une équipe seule. Entre équipes, le contrat passe en premier et la PR de contrat devient la réunion.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-nullable-31",
    day: "J2",
    context:
      "On migre ce schéma d’OpenAPI 3.0 vers 3.1 :\n`avatarUrl:`\n`  type: string`\n`  nullable: true`",
    prompt: "Comment s’écrit-il en OpenAPI 3.1 ?",
    choices: [
      "`type: string` et `nullable: \"yes\"`",
      "`type: [string, \"null\"]`",
      "`type: string` et `required: false`",
      "`type: nullable<string>`",
    ],
    correctIndex: 1,
    explanation:
      "OpenAPI 3.1 adopte JSON Schema 2020-12 : `nullable` disparaît et `null` devient un type. Les validateurs JSON Schema lisent alors le schéma sans traduction.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-strict-in",
    day: "J2",
    context:
      "Le cours pose `additionalProperties: false` sur les schémas de requête, mais pas sur ceux des réponses.",
    prompt: "Pourquoi ne pas l’appliquer aussi aux réponses ?",
    choices: [
      "Parce qu’OpenAPI 3.1 l’interdit sur les réponses",
      "Parce que les réponses ne sont jamais validées",
      "Parce que cela ralentirait la sérialisation côté back",
      "Parce qu’ajouter un champ deviendrait une rupture pour les clients stricts : strict en entrée, extensible en sortie",
    ],
    correctIndex: 3,
    explanation:
      "En entrée, un champ inconnu est refusé (422). En sortie, on garde la liberté d’ajouter des champs sans casser les clients existants.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-error-code",
    day: "J2",
    context:
      "Toutes les erreurs suivent le format `{ \"error\": { \"code\": \"VALIDATION_ERROR\", \"message\": \"score : entier attendu\" } }`.",
    prompt: "Sur quel champ le front doit-il baser sa logique ?",
    choices: [
      "Sur `code`, stable et destiné aux programmes",
      "Sur `message`, plus précis que le code",
      "Sur les deux, en comparant le texte complet",
      "Sur aucun : seul le code de statut HTTP compte",
    ],
    correctIndex: 0,
    explanation:
      "Le `code` est stable et sert aux programmes. Le `message` peut changer et sert aux humains.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-undeclared-status",
    day: "J2",
    context:
      "Une opération déclare les réponses `201`, `404` et `422`. En production, elle renvoie un `409`. Le front affiche malgré tout un message correct.",
    prompt: "Comment qualifier cette situation ?",
    choices: [
      "Un comportement acceptable, puisque le front s’en sort",
      "Une erreur du front, qui aurait dû prévoir tous les codes HTTP",
      "Une rupture de contrat : chaque code de statut possible doit être déclaré",
      "Un simple avertissement de lint sans conséquence",
    ],
    correctIndex: 2,
    explanation:
      "Un code de statut non déclaré qui sort en production rompt le contrat, même si « ça marche ».",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-prism-422",
    day: "J2",
    context:
      "Prism simule le hub à partir de `integration-v1.yaml`. Le back envoie à `POST /api/v1/scores` :\n`{ \"gameId\": \"cache-racer\", \"level\": \"3\", \"score\": 10 }`",
    prompt: "Que répond Prism ?",
    choices: [
      "`201`, car Prism renvoie toujours l’exemple de succès",
      "`422`, car Prism valide la requête contre le contrat et `level` est une chaîne",
      "`500`, car Prism ne sait pas traiter un POST",
      "`401`, car Prism refuse tout jeton de test",
    ],
    correctIndex: 1,
    explanation:
      "Prism est un vrai serveur HTTP qui valide les requêtes contre le contrat. `level` doit être un entier : la requête est rejetée.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-msw",
    day: "J2",
    context:
      "Le front veut développer ses écrans avant que le back de l’équipe soit prêt, y compris les cas vide, lent et erreur 422.",
    prompt: "Quel outil le cours lui recommande-t-il, et comment fonctionne-t-il ?",
    choices: [
      "MSW, qui intercepte les requêtes dans le navigateur grâce à un Service Worker",
      "Prism, lancé dans un onglet du navigateur",
      "Spectral, qui génère de fausses réponses à partir du lint",
      "openapi-fetch, qui renvoie des données aléatoires",
    ],
    correctIndex: 0,
    explanation:
      "Chacun mocke ce qui est de l’autre côté de sa jointure : le front simule le back de l’équipe avec MSW, le back simule le hub avec Prism.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-generated-types",
    day: "J2",
    context:
      "Le front génère ses types avec `openapi-typescript` depuis `contracts/openapi.yaml`. Une PR de contrat renomme un champ, puis on régénère les types.",
    prompt: "Quand le front découvre-t-il le changement ?",
    choices: [
      "Pendant la démo, quand l’écran reste vide",
      "Jamais, car les mocks continuent de renvoyer l’ancien champ",
      "Seulement si le back publie une nouvelle version du serveur",
      "Au build : le code qui utilise l’ancien champ ne compile plus",
    ],
    correctIndex: 3,
    explanation:
      "Avec des types générés, le contrat change, la génération change, et le front casse au build plutôt qu’en démo. Un mock typé ne peut plus mentir.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-examples",
    day: "J2",
    context:
      "Le contrat déclare deux exemples nommés pour la réponse `200` d’un niveau : `premier` et `verrouille`.",
    prompt: "À quoi servent ces exemples ?",
    choices: [
      "À rien en dehors de la documentation : ils sont ignorés par les outils",
      "Les mocks les renvoient et la documentation les affiche : un exemple par cas qui change l’écran",
      "Ils remplacent le schéma quand celui-ci est trop long",
      "Ils servent uniquement à générer les tests de charge",
    ],
    correctIndex: 1,
    explanation:
      "Les exemples font partie du contrat : Prism les sert (au choix avec `Prefer: example=verrouille`), la doc les montre, et le lint détecte un exemple invalide.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-contrat-fsq-token",
    day: "J2",
    context:
      "Le hub ouvre le jeu avec `<url>?fsq_token=<JWT>`. Le front du jeu lit ce jeton dans l’URL.",
    prompt: "À qui le front doit-il transmettre ce jeton ?",
    choices: [
      "Directement à l’API du hub, pour gagner un aller-retour",
      "À personne : il le stocke dans le localStorage",
      "À son propre back, qui appelle ensuite `GET /api/v1/me` sur le hub",
      "Au manifeste `/fsq-manifest.json`",
    ],
    correctIndex: 2,
    explanation:
      "Le front ne parle jamais au hub directement. Son back appelle `/me` puis `/scores` : la jointure du contrat v1 est entre le back du jeu et l’API du hub.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
]
