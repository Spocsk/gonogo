import type { Question } from "./types"

export const TIME_LIMIT_MS = 40_000

export const ODYSSEY_QUESTIONS: Question[] = [
  {
    id: "j1-annotate",
    day: "J1",
    context:
      "TP 01 — `const callsign = \"AQUILA-7\"` se passe d’annotation : l’intention est évidente. `remainingFuel(fuel)` sans type de paramètre, en mode strict, devient implicitement `any`. Les frontières du manifeste (paramètres, retours publics, données qui arrivent de l’extérieur) sont l’endroit où le type doit être écrit.",
    prompt: "Où une annotation de type est-elle vraiment utile ?",
    choices: [
      "Sur chaque `const` dont la valeur est déjà un littéral",
      "Aux frontières : paramètres, retours publics, données externes",
      "Seulement à l’intérieur d’un `if`",
      "Nulle part : l’inférence remplace le mode strict",
    ],
    correctIndex: 1,
    explanation:
      "On laisse inférer quand la valeur dit déjà le type. On annote là où TypeScript ne peut pas deviner : un paramètre, le retour d’une fonction publique, un JSON ou un champ venu d’ailleurs. Strict sans ces annotations laisse passer un `any` implicite.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-fuel-unit",
    day: "J1",
    context:
      "Incident Titan : le carburant vaut `\"0.78\"`. 0,78 %, 78 %, ou une chaîne inutilisable ? Le même manifeste a `fuelPercent = \"87\"` et `altitudeKm = \"120\"`. `remainingFuel` doit soustraire 10 et rendre un `number`.",
    prompt: "Quelle représentation interne tient pour le carburant ?",
    choices: [
      "Garder la chaîne et convertir dans chaque calcul",
      "Un `number`, une unité nommée, conversion une fois à la frontière",
      "`any`, le temps de trancher entre % et fraction",
      "Deux champs jumeaux : la chaîne pour l’écran, le nombre pour le calcul",
    ],
    correctIndex: 1,
    explanation:
      "On choisit une unité (pourcentage 0–100 nommé `fuelPercent`, ou une fraction nommée autrement) et on convertit une seule fois, à l’entrée. `\"0.78\"` n’est pas un type. Recalculer la conversion partout, ou doubler le champ, laisse l’ambiguïté dans le modèle.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-optional",
    day: "J1",
    context:
      "Revue du registre : `launchAt?: string` sur une mission. Le champ peut ne pas être là. Ce n’est pas une date présente mais illisible, ni un `null` qui dirait « la fenêtre est connue comme absente ». Une donnée reçue mais pas encore comprise a un autre type.",
    prompt: "`launchAt?: string` veut dire :",
    choices: [
      "La date est là, TypeScript ne sait pas la lire",
      "La propriété peut être absente de l’objet",
      "La valeur vaut `null` jusqu’au décollage",
      "Le champ reste `unknown` tant que le JSON n’est pas parsé",
    ],
    correctIndex: 1,
    explanation:
      "Le `?` dit que la clé peut manquer. `null` est une valeur présente qui signifie une absence métier. `unknown` force un test avant usage. Si la donnée existe et qu’on ne la comprend pas encore, le type doit le dire autrement qu’avec un optionnel.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-status",
    day: "J1",
    context:
      "Le manifeste corrompu porte `status = \"prelaunch-maybe\"`. Les statuts du jour sont `grounded`, `ready`, `in-flight`, `maintenance`. Mini-défi : `getStatusLabel` et un style par statut. Ajouter un statut doit casser `tsc` tant que son libellé n’existe pas.",
    prompt: "Pourquoi typer le statut en union de littéraux ?",
    choices: [
      "Pour accepter `\"prelaunch-maybe\"` sans décision",
      "Pour qu’un oubli dans `getStatusLabel` passe la compilation",
      "Pour qu’un nouveau statut casse tant que son affichage n’est pas écrit",
      "Parce qu’une `string` ne peut pas être une prop de `VehicleCard`",
    ],
    correctIndex: 2,
    explanation:
      "L’union ferme la liste. Un `default` en `never` (ou un retour exhaustif) fait hurler le compilateur dès qu’une valeur autorisée n’a pas de libellé. Une `string` libre laisse passer `\"prelaunch-maybe\"` jusqu’à l’écran.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-buffer",
    day: "J1",
    context:
      "TP 04 — un buffer de capacité N, un seul type à la fois. Vide : `getLatest` vaut `undefined`. Au-delà de N, le plus ancien sort et la taille reste N. Cinquième essai du test de résistance : glisser une `Alert` dans un buffer de carburant.",
    prompt: "Capacité dépassée, puis une `Alert` dans un `Buffer<number>` :",
    choices: [
      "La taille grandit ; l’alerte est filtrée par un `if` à l’exécution",
      "Taille N, le plus ancien sort ; l’alerte est refusée à la compilation",
      "Le buffer se vide et `getLatest` renvoie `0`",
      "Ça compile dès qu’on écrit `Buffer<any>`",
    ],
    correctIndex: 1,
    explanation:
      "FIFO borné : on garde les N derniers, l’ancien `items` n’est pas muté. `T` fait échouer l’insertion d’une `Alert` dans un buffer de `number` avant l’exécution. `Buffer<any>` annule ce contrat. Un buffer vide expose `T | undefined`, pas un zéro inventé.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-janus",
    day: "J1",
    context:
      "Boss fight JANUS : ce véhicule transporte du fret et un équipage. Rendre `payloadKg?` et `crew?` sur toutes les familles fait compiler. « Cargo à 0 kg » et « ce n’est pas un cargo » redeviennent le même trou.",
    prompt: "Que produit une avalanche de `payloadKg?` et `crew?` sur toutes les familles ?",
    choices: [
      "Elle rend les états impossibles difficiles à écrire",
      "Elle confond « cargo à 0 kg » et « ce n’est pas un cargo »",
      "Elle remplace le discriminant `kind`",
      "Elle est exigée par le mode strict",
    ],
    correctIndex: 1,
    explanation:
      "Tout optionnel fait compiler JANUS, et efface la distinction entre une mesure à zéro et une capacité qui n’existe pas. Une variante dédiée, ou des capacités composées, garde les états impossibles difficiles à représenter. `kind` reste le discriminant du narrowing.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-preview",
    day: "J5",
    context:
      "TP 01 — `/missions/new`, titre « Nouvel ordre de mission ». L’aperçu est hors du `<form>` et doit montrer les mêmes chaînes que le draft, véhicule résolu depuis l’id, `non renseigné` si vide. Le submit appelle `preventDefault` pour ne pas recharger la page.",
    prompt: "Pourquoi `FormData` seul ne suffit pas sur cet écran ?",
    choices: [
      "L’aperçu en direct lit l’état React pendant la frappe",
      "`FormData` appelle déjà `preventDefault`",
      "Il remplace le typage de `FormEvent` sur `handleSubmit`",
      "Il empêche le rechargement à la place du state",
    ],
    correctIndex: 0,
    explanation:
      "`FormData` ne voit les champs qu’au submit. L’aperçu doit suivre `draft` à chaque frappe : `value` + `onChange`. `handleSubmit` extrait s’annote `FormEvent<HTMLFormElement>` et appelle `preventDefault`. Le state reste la source affichée.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-reset",
    day: "J5",
    context:
      "Mini-défi du TP 01 : après une création, vider code, objectif, date et fenêtres. Le véhicule préféré reste sélectionné. La consigne interdit de toucher les inputs dans le DOM. L’aperçu doit suivre, sans valeur divergente.",
    prompt: "Le reset sélectif se fait en :",
    choices: [
      "Vidant chaque input avec `querySelector`",
      "Appelant `form.reset()`, puis en relisant le DOM pour l’aperçu",
      "Remettant le state du draft, en conservant `vehicleId`",
      "Dispatchant `mission/aborted` pour effacer le formulaire",
    ],
    correctIndex: 2,
    explanation:
      "La source de vérité est le draft React. On remplace cet objet (tous les champs à vide, `vehicleId` inchangé). Le DOM suit au rendu suivant. `form.reset()` et `querySelector` recréent un deuxième état, celui que l’aperçu ne voit plus.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-when",
    day: "J5",
    context:
      "TP 02 — « objectif obligatoire » ne doit pas agresser à la première lettre. Quitter le champ aide à corriger celui-là. Le submit bloque l’ordre entier. Dès que la règle repasse, cette erreur disparaît.",
    prompt: "Quand montrer l’erreur sur l’objectif ?",
    choices: [
      "Dès le premier caractère, et la garder après correction",
      "Au blur du champ ou au submit, puis la retirer quand la règle repasse",
      "Dans la console uniquement",
      "Seulement si le bouton Submit est désactivé",
    ],
    correctIndex: 1,
    explanation:
      "Quatre moments : pas de rouge permanent pendant la saisie, aide au blur, blocage au submit, retrait de l’erreur devenue fausse. Le message nomme la correction. La règle vit dans `validateMissionDraft`, pas dans l’attribut `disabled` du bouton.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-aquila",
    day: "J5",
    context:
      "Le formulaire est ouvert sur Aquila Dawn. Objectif, code et dates sont déjà saisis. Un bouton DEV passe Dawn en `maintenance`. Les options qui ne sont plus `ready` restent visibles, marquées « (indisponible) ».",
    prompt: "Que doit faire l’écran ?",
    choices: [
      "Vider tout le draft et fermer `/missions/new`",
      "Créer la mission : le statut se corrigera en vol",
      "Remplacer Dawn par le premier véhicule de la liste, sans message",
      "Invalider ce véhicule, garder le reste, guider vers un engin `ready`",
    ],
    correctIndex: 3,
    explanation:
      "L’incident touche le select, pas le brouillon. Le message d’erreur reste sur le véhicule. Code, objectif et fenêtres restent. `isVehicleReady` refuse le submit tant qu’un lanceur `ready` n’est pas choisi.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-which-hook",
    day: "J5",
    context:
      "Le draft de mission, c’est quelques champs indépendants. Les phases, c’est un graphe : `planned → started → in-flight → completed`, hold puis resume, abort depuis le vol ou le hold. Un clic ne peint pas la phase dans le JSX.",
    prompt: "`useReducer` devient le bon outil quand :",
    choices: [
      "Il y a des transitions nommées et des passages interdits",
      "Le formulaire a trois inputs sans règle de passage",
      "On veut éviter d’annoter `FormEvent`",
      "Il n’existe pas encore de verbe métier",
    ],
    correctIndex: 0,
    explanation:
      "Champs indépendants : un objet `draft` ou plusieurs `useState`. Transitions liées et interdits (`completed` ne repart pas en vol) : `useReducer`. Le cycle est clic → `dispatch` → reducer → prochain state → rendu. Le JSX affiche, il n’applique pas la règle.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-context-null",
    day: "J5",
    context:
      "TP 04 — `createContext<OperationsValue | null>(null)`. Le Provider est le seul à appeler `useReducer(operationsReducer, INITIAL_OPERATIONS)`. Il publie `state` et `dispatch` aux routes `/missions`, `/control` et `/alerts`.",
    prompt: "Pourquoi la valeur par défaut du contexte est `null` ?",
    choices: [
      "Pour créer les missions à la place du reducer",
      "Un objet vide masquerait l’absence de Provider",
      "React refuse un objet comme `value`",
      "Pour couper les re-rendus de tout le sous-arbre",
    ],
    correctIndex: 1,
    explanation:
      "`null` veut dire « pas de Provider ». `{ missions: [] }` afficherait une console vide et cacherait l’oubli. `useOperations` lit ce `null` et throw `\"OperationsProvider missing\"`. Le state naît dans le Provider, une seule fois.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-use-context",
    day: "J5",
    context:
      "Le header Contrôle n’a plus de prop `missions`. Il appelle `useOperations`, qui appelle `useContext`. Hors de l’arbre, l’overlay React montre `OperationsProvider missing`. Dedans, un `dispatch` de `mission/started` met les trois routes à jour sans F5.",
    prompt: "Dans cet écran, `useContext` sert à :",
    choices: [
      "Instancier un second reducer local à la page",
      "Lire le Provider le plus proche et se re-rendre quand sa value change",
      "Remplacer les actions nommées du reducer",
      "Relire l’état seulement après un rafraîchissement",
    ],
    correctIndex: 1,
    explanation:
      "`useContext` s’abonne à la value du Provider le plus proche. Nouvelle value, nouveaux rendus, sans props à travers `AppLayout`. Il ne crée pas l’état et ne décide aucune transition : ça reste `useReducer` dans `OperationsProvider`.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-split",
    day: "J5",
    context:
      "Le TP 04 coupe le tuyau en deux : `OperationsStateContext` et `OperationsDispatchContext`. Le bouton « Démarrer » ne fait que `dispatch`. Les alertes, elles, bougent souvent.",
    prompt: "Deux contextes, state et dispatch, servent à :",
    choices: [
      "Faire diverger deux reducers",
      "Qu’un bouton de commande ne re-rende pas quand seules les alertes changent",
      "Remettre `missions` en props de `AppLayout`",
      "Sortir `vehicleId` de l’URL",
    ],
    correctIndex: 1,
    explanation:
      "`dispatch` est stable. Un composant qui ne lit que le contexte de dispatch ne s’abonne pas aux alertes. Le contexte d’état porte missions, historique, alertes et `preferences.compactLists`. Chacun reste un tuyau : aucun des deux ne recalcule une transition.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-anti",
    day: "J5",
    context:
      "Contrôle anti-Context, en tête de `OperationsProvider`. Dedans : mission active, alertes, densité compacte (le toggle de Contrôle resserre aussi les cartes de `/missions`). Dehors : le champ `code` du formulaire, la recherche flotte, et `useVehicles` qui reste un GET sol.",
    prompt: "Laquelle reste hors d’OperationsContext ?",
    choices: [
      "La mission active",
      "La densité compacte partagée par Missions et Contrôle",
      "`vehicleId`, lu dans l’URL de la fiche",
      "`dispatch` des commandes de vol",
    ],
    correctIndex: 2,
    explanation:
      "Context ne prend que ce qui est global à ce sous-arbre. `vehicleId` appartient à l’URL (`useParams`). Le `code` en cours de frappe et la query flotte restent locaux. `useVehicles` parle au sol : ce n’est pas une entrée du contexte opérations.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-abort-lock",
    day: "J5",
    context:
      "TP 05 — « Interrompre » ouvre un dialog : mission concernée, conséquence, motif d’au moins 8 caractères, Annuler ou Échap sans `dispatch`. La latence simulée dure 1,5 s dans le handler. Un second Enter peut partir avant le re-render. La phase d’arrivée est `aborted`.",
    prompt: "Contre le double abort, le bouton `disabled` ne suffit pas parce que :",
    choices: [
      "Un second Enter peut partir avant le re-render : un `useRef` verrouille",
      "`disabled` envoie deux `mission/aborted` par contrat React",
      "Le reducer doit `fetch` pour dédupliquer",
      "Il faut un retour vers `scheduled` entre les deux clics",
    ],
    correctIndex: 0,
    explanation:
      "Le `disabled` n’existe qu’au rendu suivant. `abortLock` dans un `useRef` ignore le second clic tout de suite. Un abort confirmé dispatch `{ type: \"mission/aborted\", id, reason }` une seule fois. Pas de recover vers `scheduled` : la phase sûre est `aborted`.",
    timeLimitMs: TIME_LIMIT_MS,
  },
]
