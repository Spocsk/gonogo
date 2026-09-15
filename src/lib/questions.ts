import type { Question } from "./types"

export const TIME_LIMIT_MS = 40_000

export const QUESTIONS: Question[] = [
  {
    id: "j1-any",
    day: "J1",
    context:
      "TP 01 — le manifeste ODYSSEY-01 compilait encore : identifiants qui changent de forme, carburant en chaîne, crew hétérogène. Le mode strict était coché, mais plusieurs `any` (et des `as any`) masquaient les erreurs. TypeScript n’exécute pas le vol : il analyse avant le décollage.",
    prompt: "En TypeScript strict, que fait vraiment `any` sur une valeur ?",
    choices: [
      "Il convertit automatiquement la valeur en number",
      "Il coupe le contrôle de type sur cette valeur",
      "Il est obligatoire pour typer les props React",
      "C’est un alias plus sûr de `unknown`",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-readonly",
    day: "J1",
    context:
      "TP 02 — trois familles (Aquila, Titan, Hermes) partagent une identité. `VehicleBase` pose `id`, `name`, `model`, `status`. L’id d’Aquila ne doit pas changer quand on passe le statut en maintenance : c’est une identité, pas une métrique.",
    prompt: "Sur `VehicleBase`, `readonly id` signifie concrètement :",
    choices: [
      "L’id est optionnel à la création",
      "L’id est chiffré au runtime",
      "TypeScript refuse `vehicle.id = \"x\"`",
      "L’id peut changer tant que le nom reste identique",
    ],
    correctIndex: 2,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-kind",
    day: "J1",
    context:
      "TP 03 — le centre de contrôle affiche une capacité différente selon la famille : équipage, charge utile, port d’amarrage. Un `if (vehicle.payloadKg)` sur un objet où tout est optionnel ne distingue pas « cargo à 0 kg » et « ce n’est pas un cargo ».",
    prompt: "Une union discriminante se reconnaît surtout à :",
    choices: [
      "Tous les champs métier mis en optionnel (`?`)",
      "Un `as CrewedVehicle` dans chaque branche",
      "Un `if (vehicle.payloadKg)` sur un objet fourre-tout",
      "Un champ `kind` littéral distinct par variante",
    ],
    correctIndex: 3,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-never",
    day: "J1",
    context:
      "Toujours TP 03 — vous ajoutez Orionis (`kind: \"crew-capsule\"`) dans l’union. Tant que `getVehicleCapability` n’a pas de `case` pour cette famille, le compilateur doit hurler. C’est le rôle du `default` typé `never`.",
    prompt: "`assertNever(vehicle)` dans le `default` d’un `switch (kind)` :",
    choices: [
      "Fait échouer la compilation si une variante n’est pas traitée",
      "Ignore silencieusement les cas oubliés",
      "Convertit le véhicule en string",
      "Est un hook React",
    ],
    correctIndex: 0,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j1-buffer",
    day: "J1",
    context:
      "TP 04 — Orbital Command garde les N derniers points de télémétrie. Le comportement (créer, empiler, lire le plus récent) est identique pour un carburant ou une alerte : seul le type transporté change. FIFO, sans mutation de l’objet déjà stocké.",
    prompt: "Un `Buffer<T>` immuable : que doit faire `pushToBuffer` ?",
    choices: [
      "Muter `buffer.items` avec `.push`",
      "Retourner `any[]` pour rester flexible",
      "Retourner un nouveau buffer, l’ancien `items` inchangé",
      "Accepter une `Alert` dans un buffer de carburant",
    ],
    correctIndex: 2,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j2-key",
    day: "J2",
    context:
      "TP 01 jour 2 — on découpe la console (`FleetGrid`, `VehicleCard`). React doit suivre chaque carte quand le filtre change ou qu’un Titan passe en maintenance. L’index du `.map` n’est pas une identité métier : si la liste se réordonne, React recycle le mauvais composant.",
    prompt: "Dans une liste de véhicules, la `key` correcte est :",
    choices: [
      "L’index du `.map`",
      "`vehicle.id`",
      "`Math.random()` à chaque rendu",
      "Le nom du véhicule",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j2-derived",
    day: "J2",
    context:
      "TP 04 jour 2 — recherche, filtre de statut et tri s’appliquent à la même source `vehicles`. Un `useEffect` qui `setFilteredVehicles` duplique la vérité : une frame où la recherche a changé mais pas encore la liste filtrée, et l’opérateur voit un compteur faux.",
    prompt: "Pour filtrer / trier la flotte, la bonne approche est :",
    choices: [
      "`useEffect` + `setFilteredVehicles`",
      "Calculer `visibleVehicles` pendant le rendu",
      "Muter `vehicles[i].hidden = true`",
      "Lire l’input via `document.getElementById`",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j2-mutate",
    day: "J2",
    context:
      "TP 03 jour 2 — un bouton sur la carte passe CE véhicule en maintenance. Modifier `vehicle.status = \"maintenance\"` puis rappeler `setVehicles(vehicles)` mute la même référence. React compare par identité : il peut ignorer le rendu.",
    prompt: "`vehicle.status = \"maintenance\"` puis `setVehicles(vehicles)` :",
    choices: [
      "C’est la mise à jour immuable recommandée",
      "Crée automatiquement une copie profonde",
      "Mute la même référence : React peut ignorer le rendu",
      "Fonctionne uniquement avec `key={index}`",
    ],
    correctIndex: 2,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j2-controlled",
    day: "J2",
    context:
      "Toujours la recherche flotte : le champ doit afficher exactement l’état React. Saisie → événement typé `ChangeEvent<HTMLInputElement>` → setter → rendu → nouvelle `value`. `defaultValue` tout seul laisse le DOM diverger de l’état.",
    prompt: "Un champ de recherche contrôlé, c’est :",
    choices: [
      "`value` + `onChange` branchés sur un state",
      "`defaultValue` tout seul",
      "Un `useEffect` qui lit l’input après coup",
      "`document.querySelector(\"input\").value`",
    ],
    correctIndex: 0,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j2-children",
    day: "J2",
    context:
      "TP 02 jour 2 — vous composez des panneaux (flotte, disponibilité, maintenance). Une ribambelle de booléens (`showHeader`, `showFooter`, `compact`) transforme `Panel` en moteur de templates. `children` ouvre un emplacement : le cadre ne connaît pas Aquila.",
    prompt: "Un `Panel` avec `children` doit :",
    choices: [
      "Importer `vehicles.ts` pour connaître Aquila",
      "Exposer `showHeader: boolean` plutôt qu’un header enfant",
      "Organiser le cadre sans connaître le métier",
      "Dupliquer le JSX de section trois fois",
    ],
    correctIndex: 2,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j3-nav",
    day: "J3",
    context:
      "Jour 3 / 4-bis — le starter simulait les modules avec `useState(\"fleet\")` : l’URL ne bougeait pas, F5 ramenait à la flotte, le bouton précédent du navigateur ne servait à rien. Une SPA se navigue avec des liens, pas des boutons qui swap du JSX.",
    prompt: "Pour changer de module (Flotte, Missions, Contrôle) :",
    choices: [
      "`useState(\"fleet\")` et des boutons qui swap le JSX",
      "Quatre barres de nav recopiées dans chaque page",
      "`window.location.href` obligatoire à chaque clic",
      "`Link` / `NavLink` : l’URL change, F5 et Précédent marchent",
    ],
    correctIndex: 3,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j3-404",
    day: "J3",
    context:
      "Deux absences différentes dans Orbital Command. `/fleet/unknown` : la route `/fleet/:vehicleId` existe, aucun véhicule n’a cet id → `ResourceNotFound`. `/pizza-on-mars` : aucune route ne correspond → page 404 `path=\"*\"`. Les fusionner ment à l’opérateur.",
    prompt: "`/fleet/unknown` et `/pizza-on-mars`, c’est :",
    choices: [
      "La même page 404",
      "Route OK / ressource absente vs aucune route",
      "Deux crashs JavaScript attendus",
      "Deux redirections silencieuses vers `/fleet`",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j3-params",
    day: "J3",
    context:
      "La fiche véhicule lit `:vehicleId` avec `useParams`. Ce paramètre vient de la barre d’adresse : un collègue colle un lien, un id est mal encodé (`%20`), ou quelqu’un tape `/fleet/unknown`. Ce n’est pas un crash, pas un écran blanc, pas une redirection silencieuse.",
    prompt: "`useParams()` pour `:vehicleId` :",
    choices: [
      "Garantit un véhicule valide",
      "Est une entrée externe : absente, mal encodée, ou inconnue",
      "Remplace les `key` de liste",
      "Ne fonctionne qu’avec un `useState` du module",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j4-effect-loop",
    day: "J4",
    context:
      "TP 03 jour 4 — on remplace les mocks par un `GET`. Un effet décrit une synchronisation avec un système externe (API), pas un calcul de liste. Le classique qui boucle : l’effet écrit `vehicles`, `vehicles` est en dépendance, ça relance l’effet à l’infini.",
    prompt: "`useEffect(() => { fetch().then(setVehicles) }, [vehicles])` :",
    choices: [
      "C’est le pattern recommandé pour charger",
      "Boucle : l’effet écrit `vehicles`, qui relance l’effet",
      "Remplace `AbortController`",
      "Est le bon endroit pour filtrer la liste",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j4-abort",
    day: "J4",
    context:
      "L’opérateur quitte `/fleet` pendant le fetch. Sans `AbortController`, la requête hors-écran peut encore `setState` après démontage. Le cleanup fait `controller.abort()`. L’erreur d’annulation n’est pas une panne sol : on ne l’affiche pas comme un HTTP 500.",
    prompt: "Un `AbortError` pendant le fetch, c’est :",
    choices: [
      "Une panne sol à afficher avec « Réessayer »",
      "Un HTTP 500",
      "L’annulation d’une requête, pas une erreur métier",
      "Un JSON `[]`",
    ],
    correctIndex: 2,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j4-assert",
    day: "J4",
    context:
      "Une réponse HTTP n’est pas encore une donnée fiable. Les interfaces TypeScript disparaissent à l’exécution. Écrire `response.json() as Vehicle[]` documente une attente. Ça ne vérifie ni `response.ok`, ni la forme des champs, ni `fuel_ratio`.",
    prompt: "`const data = (await response.json()) as Vehicle[]` :",
    choices: [
      "Valide le JSON à l’exécution",
      "Documente une attente, ne valide rien",
      "Remplace le test `response.ok`",
      "Convertit `fuel_ratio` en `fuelPercent`",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j4-empty",
    day: "J4",
    context:
      "TP 04 — cinq états réseau : idle, loading, success, empty, error. Un tableau JSON `[]` est un succès : la requête a marché, il n’y a juste aucune mission. Un HTTP 500 est une erreur : bouton Réessayer. Les deux ne doivent pas afficher « Signal perdu ».",
    prompt: "Tableau JSON `[]` vs HTTP 500 :",
    choices: [
      "Les deux affichent « Signal perdu »",
      "`[]` = succès vide ; 500 = erreur + retry",
      "Empty doit retry le réseau comme seule action",
      "500 doit afficher `0 %` de carburant",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j4-fuel",
    day: "J4",
    context:
      "Incident Hermes : le DTO arrive sans `fuel_ratio`, ou la valeur n’est pas un nombre. Afficher `0 %` mentirait — zéro voudrait dire « réservoir mesuré vide ». L’écran continue, le champ dit « donnée indisponible », une ligne d’anomalie va au journal.",
    prompt: "Hermes arrive sans `fuel_ratio`. L’écran doit :",
    choices: [
      "Afficher `0 %`",
      "Crasher la fiche",
      "Mentir avec un réservoir plein",
      "Dire « donnée indisponible », jamais `0 %`",
    ],
    correctIndex: 3,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-label",
    day: "J5",
    context:
      "TP 01 — ordre de mission contrôlé. Code, objectif, véhicule, date, fenêtres : React connaît chaque valeur. Un placeholder « Objectif… » qui remplace le `<label>` disparaît dès la première lettre. Le lecteur d’écran et le Tab n’ont plus de nom de champ.",
    prompt: "Un placeholder à la place d’un `<label htmlFor>` :",
    choices: [
      "Suffit pour nommer le champ (lecteur d’écran compris)",
      "Disparaît à la saisie : le champ n’a plus de nom",
      "Remplace `htmlFor` / `id` une fois le submit lancé",
      "Est obligatoire dès qu’on pose `aria-invalid`",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-aria",
    day: "J5",
    context:
      "TP 02 — « Erreur de formulaire » n’aide personne. Un message actionnable dit quoi faire : « Choisissez une date postérieure au 10 septembre 2026 ». La bordure rouge seule est invisible pour une partie des opérateurs. `aria-invalid` et `aria-describedby` collent le texte au champ.",
    prompt: "Un champ en erreur, côté HTML / accessibilité :",
    choices: [
      "Le passer en rouge suffit",
      "`alert()` au submit, puis on continue",
      "`aria-invalid` + `aria-describedby` vers le message qui nomme la correction",
      "Désactiver l’input jusqu’au prochain F5",
    ],
    correctIndex: 2,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-submit",
    day: "J5",
    context:
      "Toujours TP 02 — valider au bon moment : pas d’agression à la première lettre, blur pour le champ quitté, submit pour bloquer l’ordre. Un Submit `disabled` « pour éviter les erreurs » cache la raison. L’opérateur clique, lit le résumé, le focus va sur le premier champ fautif.",
    prompt: "Désactiver le bouton Submit tant que le draft est invalide :",
    choices: [
      "Cache la raison du blocage : le laisser cliquable, résumer, focuser",
      "Est la seule façon d’être accessible",
      "Remplace `aria-invalid`",
      "Évite d’écrire `validateMissionDraft`",
    ],
    correctIndex: 0,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-effect",
    day: "J5",
    context:
      "TP 00 — recap fiche `/fleet/:vehicleId`. `useEffect` synchronise avec `/api/vehicles.json`, pas avec un calcul de liste. Cleanup : `AbortController`. Deps : `[vehicleId]`. Hydrater les missions dans `OperationsProvider` (TP 04), c’est le même geste : l’effet vit dans le Provider, jamais dans le reducer.",
    prompt: "`fetch` des missions / du JSON véhicule : où ça vit ?",
    choices: [
      "Dans `operationsReducer`, à côté de `mission/started`",
      "Dans un `useEffect` (page ou Provider), puis un `dispatch` éventuel",
      "Dans `validateMissionDraft`, au submit",
      "Nulle part : `as Vehicle[]` charge déjà le réseau",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-reducer",
    day: "J5",
    context:
      "TP 03 — `operationsReducer(state, action) → nextState`. Même entrée, même sortie. Pas de `fetch`, pas de `Date.now()` caché, pas de `state.missions.push`. Les actions racontent un verbe métier (`mission/started`), pas « mets phase à X ». `assertNever` ferme le `switch`.",
    prompt: "Un reducer de mission est correct s’il :",
    choices: [
      "Mute `state.history` puis le retourne",
      "Lance le POST abort lui-même",
      "Appelle `Date.now()` pour dater sans que l’UI le sache",
      "Reste pur : pas d’I/O, copies immuables, `assertNever` au `default`",
    ],
    correctIndex: 3,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-illegal",
    day: "J5",
    context:
      "Graphe du jour : `planned → in-flight → completed`, hold/resume, abort. `completed → in-flight` n’existe pas. Un `throw` métier crashe la console. L’opérateur doit voir le refus : state inchangé, entrée `rejected` dans l’historique.",
    prompt: "`completed` + `mission/started` : le reducer doit :",
    choices: [
      "Passer quand même en `in-flight`",
      "Garder l’état, historiser `rejected`, sans `throw`",
      "`throw new Error` pour arrêter React",
      "Ignorer l’action sans aucune trace",
    ],
    correctIndex: 1,
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-context",
    day: "J5",
    context:
      "TP 04 — le reducer raconte, il ne voyage pas. Missions, Contrôle et Alertes ont besoin du même state sans le faire transiter par `AppLayout`. Context transporte une valeur déjà calculée. `useOperations` throw hors Provider : un `null` « pour plus tard » cache l’oubli.",
    prompt: "Context, par rapport au reducer :",
    choices: [
      "Remplace `useReducer` : plus besoin d’actions",
      "Crée l’état à chaque `useContext`",
      "Transporte state + `dispatch` ; le reducer décide encore des transitions",
      "Doit envelopper le thème, même si Contrôle n’en a pas besoin",
    ],
    correctIndex: 2,
    timeLimitMs: TIME_LIMIT_MS,
  },
]
