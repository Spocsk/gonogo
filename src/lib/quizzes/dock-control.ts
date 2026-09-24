import { TIME_LIMIT_MS } from "../questions"
import type { Question } from "../types"

export const DOCK_CONTROL_QUESTIONS: Question[] = [
  {
    id: "py-j3-extra-forbid",
    day: "J3",
    context:
      "TP 01 — Invalid Station. `StationCreate` : `code` non vide, `lat` ∈ [-90, 90], `lng` ∈ [-180, 180], `capacity >= 1`, `ConfigDict(extra=\"forbid\")`. Le POST porte un `lat` valide et un champ `foo` que personne n’a déclaré.",
    prompt: "Le champ `foo` en trop :",
    choices: [
      "Est ignoré, 201, OpenAPI n’a pas à le connaître",
      "Est stocké dans `fleet.json` « au cas où »",
      "Fait 422 : `extra=\"forbid\"` refuse les champs fantômes",
      "Devient l’`id` de la station",
    ],
    correctIndex: 2,
    explanation:
      "Pydantic v2 jette ce qui n’est pas dans le schéma. `lat=200` ou `capacity=0` sont aussi des 422, avant toute écriture. La borne doit se voir dans `/docs`. Un `if` dans la route, oubliable, n’est pas le contrat.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-replay-post",
    day: "J1",
    context:
      "Séance 1 — idempotence. `GET /stations/1` deux fois rend la même station. `PATCH` du même corps deux fois laisse le même état. `POST /stations` avec le body de HX-CHATELET-01, rejoué tel quel, n’est pas « la même création ».",
    prompt: "Rejouer le même `POST /stations` :",
    choices: [
      "Rend 200 et la station déjà créée",
      "Crée un deuxième dock : un POST de création n’est pas idempotent",
      "Répond 409 dès que le body est identique au précédent",
      "Équivaut à un GET qui crée la station si l’id manque",
    ],
    correctIndex: 1,
    explanation:
      "GET et PATCH (même corps) se rejouent. POST crée : le second appel alloue un autre dock. 409 est une collision (serial, code), pas « body déjà vu ». Un GET qui crée est le bug de la spec Ghost Bike.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j5-bcrypt",
    day: "J5",
    context:
      "TP 01 — Hash the Badge. `hash_password` renvoyait encore le clair, et le seed écrivait ce clair dans `operators.hashed_password`. `ADMIN_PASSWORD` vient de l’environnement. Deux appels sur le même secret ne donnent pas la même chaîne.",
    prompt: "bcrypt, sur le badge admin :",
    choices: [
      "Chiffre le mot de passe : on le déchiffre au login",
      "Empreinte lente + sel : le hash commence par `$2`, `verify_password` compare, le clair ne va pas en base",
      "Stocke `HelixAdmin!26` si `verify_password` le reconnaît",
      "Produit toujours le même hash, pour pouvoir le committer",
    ],
    correctIndex: 1,
    explanation:
      "`hashpw` + `gensalt`. On ne revient pas au clair : `checkpw` recalcule et compare. Le sel change à chaque appel. Secret absent au seed : le boot s’arrête. Pas de clair dans Git, un `print` ou un JSON.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-omit-patch",
    day: "J2",
    context:
      "TP 01 — Dock CRUD. Station HX-NATION-02, `capacity` 20, `status` `open`. Le body du PATCH est seulement `{\"status\": \"closed\"}`. PUT, lui, remplacerait toute la ressource.",
    prompt: "Après ce PATCH, `capacity` :",
    choices: [
      "Passe à `null` : un champ omis est effacé",
      "Passe à 0, valeur par défaut SQL",
      "Reste 20 : un champ omis n’est pas un champ null",
      "Disparaît du JSON, le fichier ne garde que `status`",
    ],
    correctIndex: 2,
    explanation:
      "PATCH est partiel. On change `status`, `capacity` reste. Rejouer le même PATCH laisse le même état. PUT aurait exigé l’objet entier : un champ absent aurait été perdu. Le 201, lui, est réservé à la création.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j4-sql-types",
    day: "J4",
    context:
      "Séance 4 — six types, pas plus. `battery_pct` compte. `lat` / `lng` sont du WGS84. `exposed` est vrai ou faux. `started_at` est un horodatage UTC. Le JSON acceptait encore `\"80%\"` et `\"true\"`.",
    prompt: "`battery_pct`, `lat`, `exposed` en SQL :",
    choices: [
      "`VARCHAR` partout : on parsera à la lecture",
      "`INTEGER`, `FLOAT`, `BOOLEAN` — pas `\"80%\"`, pas une latitude en texte",
      "`FLOAT` pour la batterie, `INTEGER` pour la latitude",
      "`ARRAY` de vélos dans la colonne `stations.bikes`",
    ],
    correctIndex: 1,
    explanation:
      "Batterie : `INTEGER` 0–100. Coordonnées : `FLOAT`. `exposed` : `BOOLEAN`. `status` : `VARCHAR` fermé, pas un booléen. Pas de JSON, pas d’UUID, pas d’ARRAY aujourd’hui. Pydantic filtre l’HTTP. SQL filtre ce qui survit au restart.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-query-status",
    day: "J1",
    context:
      "TP 03 — Empty Dock. La collection est `GET /stations`. On veut seulement les docks ouverts. Un camarade propose `GET /open-stations` « pour que Swagger soit plus clair ».",
    prompt: "Le filtre « ouverts » se pose :",
    choices: [
      "En query `?status=open` sur `GET /stations`",
      "Sur une nouvelle ressource `GET /open-stations`",
      "Dans le path : `GET /stations/open`",
      "En header, pour qu’OpenAPI n’ait pas à le montrer",
    ],
    correctIndex: 0,
    explanation:
      "`?status=open` affine la collection. Ce n’est pas une ressource. Path et route dédiée inventent un nom. Le query param doit apparaître dans `/docs`, à côté du path `{id}`.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j5-close-403",
    day: "J5",
    context:
      "TP 03 et 04. `GET` des stations reste public. `PATCH /stations/{id}` passe par `Depends(get_current_user)`. Sans header, la route ne tourne pas. `ops` envoie `{\"status\": \"closed\"}`. Le même `ops` envoie `{\"name\": \"Quai\"}`. `/auth/me` ne liste pas `hashed_password`.",
    prompt: "Fermer la station sans badge, puis avec le badge `operator` :",
    choices: [
      "404 puis 200 : le nom du dock suffit",
      "401 (pas de badge), puis 403 et la station reste `open` ; un PATCH du nom par `ops` passe",
      "Les deux en 403 : on sait déjà que quelqu’un a appelé",
      "401 dans les deux cas : `operator` n’est pas un utilisateur",
    ],
    correctIndex: 1,
    explanation:
      "401 : je ne sais pas qui tu es (token manquant, illisible, expiré, ou opérateur absent). 403 : je sais, et non. Le `raise` est avant `commit`. `GET` reste ouvert. Le hash ne sort pas dans `OperatorOut`.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-literal",
    day: "J3",
    context:
      "Séance 3 — statuts fermés. Station : `open`, `closed`, `maintenance`. Vélo : `docked`, `in_trip`, `offline`. Le payload dit `status: \"riding\"`. Chaque champ, pris seul, pourrait passer si `status` était une `str` libre.",
    prompt: "`status: \"riding\"` sur `BikeCreate` :",
    choices: [
      "201 : une chaîne est une chaîne",
      "409 Flat Battery, quel que soit le pourcentage",
      "422 : `Literal` (ou enum), pas une chaîne libre",
      "200, et `/docs` documente `riding` comme alias",
    ],
    correctIndex: 2,
    explanation:
      "Hors liste → 422. `Field` borne un nombre (`battery_pct` 0–100). Il ne ferme pas une liste de statuts. `model_validator` viendra pour deux champs vrais chacun et faux ensemble (`docked` sans station).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-station-missing",
    day: "J2",
    context:
      "TP 02 — Stolen Serial. Deux `POST /bikes`. L’un répète le serial `HX-S2-1042`. L’autre est un serial neuf, `docked`, avec `station_id` qui ne correspond à aucune station du fichier.",
    prompt: "Serial déjà pris, puis `station_id` inconnu :",
    choices: [
      "409 puis 404 — unicité et ressource liée ne partagent pas le même code",
      "Les deux en 400 « bad request »",
      "Les deux en 201, on logue l’anomalie",
      "404 pour le serial, 409 pour la station absente",
    ],
    correctIndex: 0,
    explanation:
      "Collision de `serial` → 409. Station liée absente → 404. Les inverser ment à l’opérateur : il cherche un dock qui n’existe pas, ou il croit qu’un serial neuf est un conflit. `docked` sans `station_id` reste un refus Ghost Bike, à part.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j4-pk-unique",
    day: "J4",
    context:
      "Trois verrous. `stations.id` identifie la ligne. `bikes.serial` et `stations.code` sont ce que l’opérateur lit (`HX-S2-1042`, `HX-CHATELET-01`). `DEFAULT` sur une colonne n’est pas la règle Flat Battery.",
    prompt: "PK et UNIQUE, ici :",
    choices: [
      "`serial` est la PK : l’`id` est décoratif",
      "`id` est interne (PK) ; `code` / `serial` sont UNIQUE, lus par l’opérateur",
      "UNIQUE remplace la FK `station_id`",
      "`DEFAULT 15` sur `battery_pct` interdit les départs sous 15 %",
    ],
    correctIndex: 1,
    explanation:
      "La PK n’est pas l’unicité métier. `NOT NULL` oblige une valeur (`trips.bike_id`). `NULL` autorise l’absence (`bikes.station_id` en trajet). Un `DEFAULT` SQL ne remplace pas `is_rideable`.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-slots",
    day: "J1",
    context:
      "TP 04 — Fleet Classes. Station `capacity` 12, 9 vélos déjà `docked`. `remaining_slots()` appartient à la station. La route l’appelle. Elle ne refait pas `capacity - docked_count` dans le handler.",
    prompt: "`remaining_slots()` sur cette station :",
    choices: [
      "Vaut 21, recalculé dans chaque route",
      "Vaut 12 : la capacité ignore les vélos déjà dockés",
      "Vaut 3, méthode de `Station`, pas un `if` dans le handler",
      "Vaut `None` tant qu’il n’y a pas de base SQL",
    ],
    correctIndex: 2,
    explanation:
      "12 − 9 = 3. La règle vit dans la classe, comme `is_rideable` sur `Bike`. Le jour 1 n’a pas encore de Postgres : la méthode se teste sans uvicorn. Un god dict partagé ne porte pas cette règle.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j5-jwt",
    day: "J5",
    context:
      "TP 02 — Login Lane. `POST /auth/login` reçoit `email` + `password`. Le JWT a trois morceaux : en-tête `HS256`, payload, signature. TTL 30 min. `SECRET_KEY` était encore `\"changeme\"` dans `main.py`.",
    prompt: "Email inconnu, ou bon email et mauvais mot de passe :",
    choices: [
      "404 si l’email manque, 401 si le mot de passe est faux",
      "Les deux en 401, même message ; le token porte `sub`, `role`, `exp` ; la clé vient de l’env",
      "200 avec un JWT sans `exp`, pour ne pas déconnecter l’opérateur",
      "500 si la signature est fausse : PyJWT a planté",
    ],
    correctIndex: 1,
    explanation:
      "Même détail `Identifiants invalides.` : on ne dit pas lequel des deux a échoué. Payload lisible par n’importe qui ; la signature empêche de le modifier. Sans `exp`, le badge est éternel. Mauvaise clé → 401, pas 500. Pas de refresh aujourd’hui.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-audit-line",
    day: "J2",
    context:
      "TP 03 — Night Audit. `data/night-audit.log` : une ligne, quatre champs, ISO-8601 UTC. `event` ∈ `dock`, `undock`, `offline`, `battery_low`. Le script n’est pas une route FastAPI. Une ligne est vide, une autre n’a que trois champs.",
    prompt: "Le parseur face à la ligne cassée :",
    choices: [
      "Lève et abandonne tout le fichier",
      "La saute (compteur ou message), et `station_id` des bonnes lignes est un `int`",
      "La recolle au JSON de la flotte et répond 201",
      "Imprime le fichier brut : pas de liste d’événements",
    ],
    correctIndex: 1,
    explanation:
      "Ligne vide ignorée. Ligne mal formée : skip, pas un crash du journal. Sortie : liste (`timestamp`, `station_id` int, `bike_serial`, `event`). Un `print` du texte brut ne structure rien. `dockctl` rejouera ce journal plus tard.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j4-back-populates",
    day: "J4",
    context:
      "TP 02 — ORM. `Station.bikes` est une liste (1-N). `Bike.station` est un objet ou `None` (N-1). `mapped_column(ForeignKey(\"stations.id\"))` n’est écrit qu’une fois. `Mapped[int | None]` sur `station_id`.",
    prompt: "`back_populates` et `Mapped[int | None]` :",
    choices: [
      "`back_populates` relie les deux attributs du même 1-N ; `None` autorise `in_trip`",
      "Il faut une seconde FK sur `stations.bike_ids`",
      "`Mapped[int]` sans `None` : `in_trip` mettra `station_id` à 0",
      "`relationship` écrit la colonne SQL à la place de `ForeignKey`",
    ],
    correctIndex: 0,
    explanation:
      "Sans `back_populates`, SQLAlchemy ne sait pas que les deux faces sont le même lien. Oublier `| None` interdit le NULL de `in_trip`. La FK reste du côté N. `relationship` n’est pas une colonne.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-create-read",
    day: "J3",
    context:
      "Create n’est pas Read. L’opérateur envoie `code`, coordonnées, `capacity`. L’`id` est alloué par l’API. `StationRead` est ce qui sort, via `response_model`. Un god dict ou l’ORM brut n’est pas une réponse.",
    prompt: "Sur `POST /stations`, l’`id` :",
    choices: [
      "Est obligatoire dans `StationCreate` : le client le choisit",
      "N’est pas dans l’entrée ; `StationRead` le renvoie après création",
      "Est le `code` (`HX-CHATELET-01`), pas une clé interne",
      "Reste caché : 201 sans body",
    ],
    correctIndex: 1,
    explanation:
      "L’entrée n’expose pas l’`id`. La sortie le porte, schéma `StationRead`, pas un dict accidentel. 201 sans body laisse le client sans identifiant. `response_model` est aussi la frontière : pas de traceback, pas de chemin de fichier, pas d’objet ORM dumpé.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-helix-error",
    day: "J1",
    context:
      "Toujours Fleet Classes. `HelixError`, puis `StationNotFound` et `BikeNotRideable`. Trois classes, pas une pyramide. Aujourd’hui ce n’est pas encore le JSON renvoyé au client. Plus tard la route traduira en `HTTPException`.",
    prompt: "`HelixError` aujourd’hui sert à :",
    choices: [
      "Renvoyer déjà un body 404 à la place de `HTTPException`",
      "Nommer le métier avant le code HTTP",
      "Interdire tout `except` dans FastAPI",
      "Écrire la traceback dans `GET /health`",
    ],
    correctIndex: 1,
    explanation:
      "L’héritage nomme l’incident (`StationNotFound`, `BikeNotRideable`). Le code HTTP viendra après. Coller la stack dans `/health` ou sauter `HTTPException` trop tôt mélange le métier et le contrat REST.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j5-cors",
    day: "J5",
    context:
      "TP 05 — CORS Gate. Le middleware est déjà là, avec `allow_origins=[\"*\"]` et `allow_credentials=True`. Un `curl` envoie `Origin: http://evil.example`. Un autre envoie `Origin: http://127.0.0.1:8000`, qui est dans `CORS_ORIGINS`.",
    prompt: "CORS sur Dock Control :",
    choices: [
      "`[\"*\"]` pour que `/docs` marche, y compris avec credentials",
      "Liste explicite : l’origine connue est recopiée, `evil.example` non. Ce n’est pas un login",
      "Remplace le JWT : une origine listée peut fermer une station",
      "Bloque aussi `curl` sans navigateur",
    ],
    correctIndex: 1,
    explanation:
      "Le middleware compare `Origin` à la liste et renvoie `Access-Control-Allow-Origin` seulement si elle est connue. Un `*` « pour que ça marche » est le bug de la séance. CORS n’est ni un mot de passe ni un rôle : `curl` parle encore à l’API.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-weather-hold",
    day: "J2",
    context:
      "TP 04 — Weather Hold. Fixture locale `condition: storm`, pas Météo-France. `requests.get(..., timeout=2)`. Des stations `exposed: true`, d’autres non. Sans timeout, `GET /ops/weather` pend et `/health` ne répond plus.",
    prompt: "Orage sur helix-city, aujourd’hui :",
    choices: [
      "PATCH silencieux : toute la ville passe `closed`",
      "On recommande les `code` exposés ; on ne ferme pas la flotte ; timeout obligatoire",
      "Timeout 30 s, stack `ConnectionError` dans `/docs` si ça rate",
      "`json.load` du fichier, sans GET HTTP",
    ],
    correctIndex: 1,
    explanation:
      "Recommandation seulement. L’admin appliquera plus tard. Un timeout explicite évite de prendre uvicorn en otage. L’échec est une phrase lisible, pas une traceback. Le TP exige un GET HTTP vers la fixture, pas un `json.load` seul.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j4-session-close",
    day: "J4",
    context:
      "Une requête, une session. `Depends(get_db)` ouvre, la route `add` / `commit` / `refresh`, puis la session se ferme. `POST /bikes` lève 409 (`IntegrityError`, rollback). Un mot de passe Postgres traîne dans un commit « pour que ça marche en salle ».",
    prompt: "Après le 409, et pour `DATABASE_URL` :",
    choices: [
      "On garde une session globale : la rouvrir coûte trop cher",
      "`finally` ferme quand même ; l’URL vient de l’env, le secret reste hors du dépôt",
      "On laisse la session ouverte pour le GET suivant",
      "Les routes changent de path quand on passe de SQLite à Postgres",
    ],
    correctIndex: 1,
    explanation:
      "Même si la route répond 409, `finally` ferme. Sinon la connexion fuit. SQLite si l’env est vide, Postgres dès que `DATABASE_URL` le dit. Les paths ne bougent pas. `.env.example` sans secret réel. `create_all` suffit, Alembic peut attendre.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-field-vs-validator",
    day: "J3",
    context:
      "TP 02 — Battery Bounds. Payload A : `battery_pct` 140, `docked`, `station_id` 1. Payload B : `battery_pct` 40, `docked`, `station_id` null. Les deux sont refusés. Pas pour la même raison.",
    prompt: "140 % vs Ghost Bike (`docked` sans station) :",
    choices: [
      "`Field(ge=0, le=100)` suffit pour les deux",
      "140 → `Field` ; Ghost Bike → `model_validator` (deux champs cohérents ensemble)",
      "Les deux → 409 `FLAT_BATTERY`",
      "Les deux passent : on corrigera au PATCH",
    ],
    correctIndex: 1,
    explanation:
      "140 est hors bornes, un champ. `docked` + `station_id` null : chaque pièce peut être valide, le couple non. `in_trip` exige `station_id is None`. Le seuil 15 % à l’ouverture d’un trajet est encore une autre règle, métier, pas ce schéma.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-bikes-on-dock",
    day: "J1",
    context:
      "Mini-défi — `GET /stations/{id}/bikes`, encore en mémoire. Statuts du jour : `docked`, `in_trip`, `maintenance`, `offline`. HX-1042 est `in_trip`, `station_id` null. Un opérateur ouvre le dock de Châtelet.",
    prompt: "Ce vélo `in_trip` sur la collection du dock :",
    choices: [
      "Apparaît, avec `station_id` reconstruit depuis le serial",
      "Apparaît si `battery_pct >= 15`",
      "N’apparaît sur aucune station",
      "Force un 201 pour « le rattacher »",
    ],
    correctIndex: 2,
    explanation:
      "Un `in_trip` n’est sur aucun dock. L’afficher à Châtelet recrée Ghost Bike. `is_rideable` (docké et ≥ 15 %) est une autre règle : elle dit si on peut le louer, pas s’il est listé ici.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j5-authz",
    day: "J5",
    context:
      "Séance 5 — un badge valide n’ouvre pas toutes les portes. `ops@helix.example` se connecte, `GET /auth/me` rend `role: operator`. Il envoie ensuite `PATCH /stations/1` avec `{\"status\": \"closed\"}`.",
    prompt: "Authentification et autorisation, ici :",
    choices: [
      "C’est le même contrôle : un JWT valide peut tout PATCH",
      "Auth : qui es-tu. Autorisation : as-tu le droit de fermer. Les deux se testent à part",
      "L’autorisation se fait au login, le rôle n’est plus relu",
      "CORS remplace les deux : une origine listée est un admin",
    ],
    correctIndex: 1,
    explanation:
      "Le login prouve l’identité. Le rôle dit ce que ce badge peut faire. Fermer une station est réservé à `admin`. Un opérateur authentifié reste un 403, pas un second login.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-save-when",
    day: "J2",
    context:
      "Incident ops : `POST` HX-NATION-02 répond, puis Ctrl-C. `GET /stations` → `[]`. `load_fleet` au démarrage ne sert à rien si personne n’a écrit `data/fleet.json`. Lifespan ou appels explicites : le cours s’en fiche, pas du moment.",
    prompt: "`save_fleet` s’appelle :",
    choices: [
      "Une fois par nuit, dans le parseur de `night-audit.log`",
      "À chaque mutation, avant de croire le 201",
      "Seulement si `/health` passe à 503",
      "Jamais : uvicorn snapshot la liste Python tout seul",
    ],
    correctIndex: 1,
    explanation:
      "Chaque POST, PATCH (stations et bikes) écrit le fichier. Sinon le 201 n’a eu lieu qu’en RAM. Au restart, `load_fleet` relit le disque. Le JSON est la vérité du jour 2. Postgres arrive au jour 4.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j4-station-bikes",
    day: "J4",
    context:
      "TP 05 — First Query. `GET /stations/1/bikes`. Trois vélos ont `station_id = 1`. HX-9104 est `in_trip`, `station_id` NULL. Le dock 999 n’existe pas. La route ne filtre plus une liste Python à la main.",
    prompt: "Cette collection liée :",
    choices: [
      "Passe par `station.bikes` ; 404 si le dock manque ; le `in_trip` est absent",
      "Relit `fleet.json`, SQL seulement si le fichier est vide",
      "Renvoie aussi HX-9104, `station_id` forcé à 1",
      "Exige un `JOIN` écrit dans la route, `relationship` est optionnel",
    ],
    correctIndex: 0,
    explanation:
      "`db.get(Station, id)` → 404 si absent. `station.bikes` est le lien (le JOIN, vous ne l’écrivez plus). `in_trip` a `station_id` NULL : hors de cette liste. `list[BikeRead]` via `from_attributes`. Tuer uvicorn : la flotte est toujours en base.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-patch-ghost",
    day: "J3",
    context:
      "Mini-défi — `BikePatch`. Le vélo est `in_trip`, `station_id` null, batterie 40. Le PATCH envoie `{\"status\": \"docked\"}` sans `station_id`. Un PATCH partiel peut encore fabriquer un Ghost Bike si le schéma ne regarde que le body.",
    prompt: "Ce PATCH `docked` sans station :",
    choices: [
      "201 : on crée un second vélo docké",
      "Passe : le champ omis « reste null » et c’est voulu",
      "Doit être refusé : l’invariant 1 s’applique aussi au partiel",
      "404, le vélo `in_trip` n’existe plus",
    ],
    correctIndex: 2,
    explanation:
      "Après merge, `docked` + `station_id` null est Ghost Bike. Le `model_validator` voit l’état résultant, pas seulement les clés envoyées. 201 n’est pas un PATCH. 404 serait un id inconnu.",
    timeLimitMs: TIME_LIMIT_MS,
  },
]
