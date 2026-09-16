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
    explanation:
      "`any` éteint le vérificateur sur cette valeur : plus d’autocomplete, plus d’erreur de compilation. `unknown` est l’inverse pédagogique — il force un test avant usage. Strict ne sauve rien si vous recouvrez tout avec `any` ou `as any`.",
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
    explanation:
      "`readonly` est une contrainte TypeScript, pas un cadenas JavaScript. `vehicle.id = \"x\"` est une erreur de compilation. Après le build, JS peut encore muter : d’où l’habitude de renvoyer un nouvel objet plutôt que d’écrire dans l’ancien.",
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
    explanation:
      "Le discriminant est un champ littéral (`kind: \"cargo\"` vs `kind: \"crewed\"`). Après `if (vehicle.kind === \"cargo\")`, TypeScript sait quels champs existent. Tout optionnel, ou un `as`, ne discrimine rien : 0 kg et « pas un cargo » restent indiscernables.",
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
    explanation:
      "Si toutes les variantes sont gérées, `vehicle` dans le `default` a le type `never` : `assertNever` compile. Ajoutez une famille sans `case`, et ce n’est plus `never` : `tsc` casse. C’est un filet d’exhaustivité, pas un log runtime.",
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
    explanation:
      "Immuable = nouvelle structure, ancienne intacte. `.push` mute le tableau partagé : un autre écran qui lit le même buffer voit le changement sans rendu. `T` empêche de glisser une alerte dans un buffer de carburant. `any[]` annule le contrat.",
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
    explanation:
      "La `key` est l’identité stable de la ligne. `vehicle.id` survit au filtre et au tri. L’index recycle le mauvais state interne si Aquila et Titan s’inversent. `Math.random()` détruit et recrée à chaque rendu. Le nom peut doubler.",
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
    explanation:
      "Une liste filtrée se calcule : `vehicles.filter(...)` pendant le rendu. Pas d’effet, pas de second state. Un `useEffect` + `setFiltered` introduit une frame de décalage. Muter `hidden` casse l’immuabilité. Le DOM n’est pas la source de vérité.",
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
    explanation:
      "React décide de re-rendre si la référence du state a changé. Muter puis `setVehicles(vehicles)` passe le même tableau : le rendu peut être sauté. Il faut un nouveau tableau et un nouveau véhicule (`map` + copie). Ce n’est pas une copie profonde magique.",
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
    explanation:
      "Contrôlé = React affiche `value`, et `onChange` met à jour le state. `defaultValue` initialise le DOM une fois, puis le champ vit sa vie. Lire le DOM dans un effet ou via `querySelector` inverse le flux : l’écran n’est plus une fonction de l’état.",
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
    explanation:
      "`children` est un emplacement : le cadre pose padding, titre optionnel, bordure. Le métier (Aquila, missions) arrive en enfant. Des booléens `showHeader` transforment `Panel` en usine à cas. Dupliquer le JSX de section trois fois, c’est le problème que `children` évite.",
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
    explanation:
      "`Link` / `NavLink` écrivent l’URL sans recharger l’app. F5 et Précédent redeviennent des outils. Un `useState` de module ment : l’adresse ne bouge pas. `window.location.href` casse la SPA (reload complet). Recopier quatre navs, c’est un layout qui devrait vivre une fois.",
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
    explanation:
      "La route `/fleet/:vehicleId` a matché, mais l’id n’existe pas : c’est une ressource absente, avec un retour vers la flotte. `/pizza-on-mars` n’a aucune route : 404 `path=\"*\"`. Un même écran « introuvable » mélange « mauvais lien métier » et « URL hors carte ».",
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
    explanation:
      "`useParams` lit l’URL, pas la base. Traitez-le comme une entrée utilisateur : string | undefined, éventuellement décodé, puis cherché dans les données. Absent, inconnu, mal encodé → écran métier, pas `!` ni crash. Ça ne remplace ni les `key` ni un state de module.",
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
    explanation:
      "Les deps disent « relance si ça change ». `setVehicles` change `vehicles`, donc l’effet repart. Deps utiles : `vehicleId`, un flag, rien (`[]`) si le chargement est unique. Filtrer reste un calcul de rendu. `AbortController` est le cleanup, pas un substitut aux deps.",
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
    explanation:
      "Le cleanup `abort()` annule volontairement la requête du composant démonté. `AbortError` / `DOMException` : on ignore, on n’affiche pas « Signal perdu ». Un 500 est une panne sol (retry). Un `[]` est un succès vide. Mélanger les trois ment à l’opérateur.",
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
    explanation:
      "`as` est un contrat pour le compilateur, effacé à l’exécution. Le JSON peut être un objet d’erreur, un 200 HTML, ou des champs manquants. Il faut `response.ok`, puis une adaptation / validation des champs (`fuel_ratio` → `fuelPercent`). L’assertion toute seule n’adapte rien.",
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
    explanation:
      "`[]` : le lien sol a répondu, la liste est vide — CTA « planifier une mission », pas « réessayer le réseau ». HTTP 500 : la requête a échoué — message de panne + retry. Afficher « Signal perdu » dans les deux cas, ou `0 %` sur une 500, mélange succès et incident.",
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
    explanation:
      "Zéro est une mesure (« réservoir vide »). Une donnée absente n’est pas une mesure. L’écran reste debout, le champ dit « indisponible », une anomalie part au journal. Crasher la fiche pour un champ optionnel, ou inventer 100 %, est pire qu’un trou assumé.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-label",
    day: "J5",
    context:
      "TP 01 — formulaire d’ordre de mission entièrement contrôlé : code, objectif, véhicule, date, début et fin de fenêtre. React connaît chaque valeur (`value` + `onChange`). Un placeholder « Objectif de la mission… » à la place du `<label>` disparaît dès la première lettre. Le lecteur d’écran, le Tab et l’opérateur qui revient sur le champ n’ont plus de nom. `htmlFor` et `id` doivent être identiques : cliquer le libellé focus le champ.",
    prompt:
      "Pourquoi un placeholder ne remplace pas un `<label htmlFor>` sur un champ de mission ?",
    choices: [
      "Il suffit pour nommer le champ, lecteur d’écran compris",
      "Il disparaît à la saisie : le champ n’a plus de nom visible ni annoncé",
      "Il remplace `htmlFor` / `id` une fois le submit lancé",
      "Il est obligatoire dès qu’on pose `aria-invalid`",
    ],
    correctIndex: 1,
    explanation:
      "Le placeholder est une aide temporaire, pas le nom du champ. Dès qu’on tape, il s’efface : plus de libellé à l’écran, et beaucoup de lecteurs d’écran l’ignorent ou ne le relisent pas. Un `<label htmlFor=\"objective\">` lié à `id=\"objective\"` reste. `aria-invalid` décrit l’erreur, pas le nom. Le submit ne « répare » pas un label manquant.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-aria",
    day: "J5",
    context:
      "TP 02 — « Erreur de formulaire » n’aide personne. Un message actionnable dit quoi faire : « Choisissez une date postérieure au 10 septembre 2026 », pas « invalide ». La bordure rouge seule est invisible pour une partie des opérateurs (daltonisme, projection, thème console). `aria-invalid` signale l’état au lecteur d’écran ; `aria-describedby` pointe l’id du paragraphe d’erreur. La couleur confirme, elle ne porte pas l’information.",
    prompt:
      "Un champ en erreur, côté HTML et accessibilité, doit surtout :",
    choices: [
      "Passer en rouge, le message n’est qu’un plus visuel",
      "Ouvrir un `alert()` au submit, puis laisser continuer",
      "Avoir `aria-invalid` et `aria-describedby` vers le texte qui nomme la correction",
      "Être désactivé jusqu’au prochain F5",
    ],
    correctIndex: 2,
    explanation:
      "Reliez le champ au texte : `aria-invalid={true}` et `aria-describedby=\"date-error\"` sur l’input, `id=\"date-error\"` sur le message. Le lecteur d’écran annonce alors l’erreur avec le champ. Un rouge orphelin, un `alert()` bloquant, ou un input disabled jusqu’au F5, ne disent pas quoi corriger et cassent le parcours clavier.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-submit",
    day: "J5",
    context:
      "Toujours TP 02 — valider au bon moment : pas d’agression rouge à la première lettre, blur pour aider le champ quitté, submit pour bloquer l’ordre invalide, retrait de l’erreur dès que la règle repasse. Un Submit `disabled` « pour éviter les erreurs » cache la raison : l’opérateur clique dans le vide. Les règles vivent dans `validateMissionDraft` (fonction pure), pas dans le `disabled` du bouton.",
    prompt:
      "Pourquoi éviter de désactiver le bouton Submit tant que le draft est invalide ?",
    choices: [
      "Ça cache la raison du blocage : le laisser cliquable, résumer les erreurs, focuser le premier champ",
      "C’est la seule façon d’être accessible",
      "Ça remplace `aria-invalid` sur les champs",
      "Ça évite d’écrire `validateMissionDraft`",
    ],
    correctIndex: 0,
    explanation:
      "Un bouton disabled n’explique rien et se comporte mal au clavier. Laissez Submit cliquable : au clic, validez tout, affichez un résumé en tête de formulaire, posez le focus sur le premier champ en erreur (ordre : code, objectif, véhicule, date, fenêtres). `aria-invalid` reste sur les champs. La fonction pure décide ; le bouton n’est pas la règle.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-effect",
    day: "J5",
    context:
      "TP 00 — recap fiche `/fleet/:vehicleId` : `useEffect` synchronise avec `/api/vehicles.json`, deps `[vehicleId]`, cleanup `AbortController`. Ce n’est pas un calcul de liste (ça, c’est le rendu). TP 04 — hydrater les missions dans `OperationsProvider`, c’est le même geste : l’effet vit dans le Provider (synchro externe), puis un `dispatch`. Le reducer, lui, reste pur : pas de `fetch`, pas de `Date.now()` caché.",
    prompt:
      "Où doit vivre le `fetch` des missions ou du JSON véhicule ?",
    choices: [
      "Dans `operationsReducer`, à côté du case `mission/started`",
      "Dans un `useEffect` (page ou Provider), puis un `dispatch` éventuel",
      "Dans `validateMissionDraft`, au moment du submit",
      "Nulle part : `as Vehicle[]` charge déjà le réseau",
    ],
    correctIndex: 1,
    explanation:
      "`useEffect` parle au monde extérieur (HTTP, timer, abonnement). Après la réponse, vous pouvez `dispatch` une action du type `missions/hydrated`. Le reducer calcule le prochain state, il ne fetch pas. `validateMissionDraft` est une fonction pure de règles. `as Vehicle[]` n’ouvre aucune socket : c’est une assertion de type.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-reducer",
    day: "J5",
    context:
      "TP 03 — formule : `operationsReducer(state, action) → nextState`. Même entrée, même sortie. Les actions racontent un verbe métier (`mission/started`, `mission/aborted`), pas « mets phase à X ». Payload minimal (`id`, éventuellement `reason`). `assertNever` dans le `default` : ajouter `mission/rescheduled` casse la compilation tant que le `switch` n’a pas décidé.",
    prompt:
      "Qu’est-ce qui rend un reducer de mission correct ?",
    choices: [
      "Il mute `state.history` avec `.push`, puis le retourne",
      "Il lance lui-même le POST abort vers le sol",
      "Il appelle `Date.now()` pour dater, sans que l’UI le sache",
      "Il reste pur : pas d’I/O, copies immuables, `assertNever` au `default`",
    ],
    correctIndex: 3,
    explanation:
      "Pur = testable et prévisible. Pas de `fetch`, pas de timer, pas de mutation de `state` (`[...history, entry]` plutôt que `.push`). `Date.now()` caché rend deux appels différents avec la « même » action. L’horloge, si besoin, arrive dans l’action (payload `at`) ou reste dans le handler UI. `assertNever` ferme le `switch` pour l’exhaustivité.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-illegal",
    day: "J5",
    context:
      "Graphe du jour : `planned → started → in-flight → completed` ; depuis `in-flight`, `held` puis `resumed` ; `aborted` depuis le vol ou le hold. `completed → in-flight` n’existe pas, non plus que `planned → completed` sans vol. Un `throw` métier crashe la console React. L’opérateur doit voir le refus : phase identique, entrée `rejected` dans l’historique, UI toujours vivante.",
    prompt:
      "Si on dispatch `mission/started` sur une mission déjà `completed`, le reducer doit :",
    choices: [
      "Passer quand même en `in-flight` pour « débloquer » l’opérateur",
      "Garder l’état, historiser `rejected`, sans `throw`",
      "`throw new Error` pour arrêter React tout de suite",
      "Ignorer l’action sans aucune trace dans l’historique",
    ],
    correctIndex: 1,
    explanation:
      "Une transition illégale est un no-op explicite : même `missions`, plus une ligne d’historique `rejected` (qui, depuis quelle phase, vers quel verbe). Pas de `throw` : l’UI reste utilisable, le banc de transitions peut montrer avant / après identiques. Un silence total (aucun log) empêche le diagnostic. Appliquer `started` quand même casse le graphe métier.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "j5-context",
    day: "J5",
    context:
      "TP 04 — le reducer raconte l’histoire, mais seul le composant qui appelle `useReducer` la connaît. Missions, Contrôle et Alertes ont besoin du même state sans le faire transiter par `AppLayout` (prop drilling). Context est un tuyau : il transporte une valeur déjà calculée. `useOperations` throw hors Provider (`\"OperationsProvider missing\"`) : un `null` « pour plus tard » cache l’oubli. Le Provider se place aussi bas que possible, aussi haut que nécessaire — autour des routes opérationnelles, pas autour du thème « au cas où ».",
    prompt:
      "Quel est le rôle de Context par rapport au reducer ?",
    choices: [
      "Il remplace `useReducer` : plus besoin d’actions nommées",
      "Il crée l’état à chaque `useContext`, indépendamment du Provider",
      "Il transporte `state` + `dispatch` ; le reducer décide encore des transitions",
      "Il doit envelopper le thème, même si Contrôle n’en a pas besoin",
    ],
    correctIndex: 2,
    explanation:
      "Reducer = règles (action → nextState). Context = portée dans l’arbre (Provider publie, `useContext` s’abonne). `useOperations` lit, il ne possède pas. Sans Provider, on throw tout de suite. Un id d’URL (`vehicleId`) et la query de recherche flotte restent hors Context : ils ne sont pas globaux à l’opération.",
    timeLimitMs: TIME_LIMIT_MS,
  },
]
