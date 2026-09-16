import { TIME_LIMIT_MS } from "../questions"
import type { Question } from "../types"

export const DOCK_CONTROL_QUESTIONS: Question[] = [
  {
    id: "py-j1-get-create",
    day: "J1",
    context:
      "TP 01 — Ghost Bike. Un camarade annote une spec Helix : `GET /stations/{id}` « crée la station si elle n’existe pas ». REST ne marche pas comme une base qui s’auto-remplit. Un GET lit une ressource ; il ne la fabrique pas pour arranger le client.",
    prompt: "Un `GET /stations/99` sur une station absente doit :",
    choices: [
      "Créer la station 99 puis répondre 200",
      "Répondre 201 avec un body vide",
      "Répondre 404, sans écrire de station",
      "Répondre 204 et supprimer `/health`",
    ],
    correctIndex: 2,
    explanation:
      "GET est une lecture. Ressource absente → 404. Inventer la station « pour que ça marche » casse l’idempotence et masque un bug client. 201 est une création (POST). 204 sur `/health` n’a rien à voir : ce n’est pas une ressource métier à supprimer.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-post-201",
    day: "J1",
    context:
      "Toujours Ghost Bike, puis TP 01 jour 2 — Dock CRUD. Le manifeste notait `POST /stations` → 200. Un 200 dit « j’ai lu ou mis à jour ». Une création réussie a son code : la ressource n’existait pas, elle existe maintenant, et le body porte souvent l’`id` alloué.",
    prompt: "Un `POST /stations` qui crée vraiment une station répond :",
    choices: [
      "200 — comme un GET réussi",
      "201 — ressource créée",
      "204 — pas de body, donc pas d’id",
      "409 — toute écriture est un conflit",
    ],
    correctIndex: 1,
    explanation:
      "201 Created. Le body renvoie la station avec son `id`. 200 laisse croire à une lecture. 204 sans body empêche le client de connaître l’id. 409 est pour un conflit (serial déjà pris), pas pour une création saine.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-404",
    day: "J1",
    context:
      "TP 03 — Empty Dock. `GET /stations/{id}` : la station n’est pas dans la liste mémoire. La spec Ghost Bike montrait un traceback Python dans le body. L’opérateur d’exploitation n’a pas à lire une stack FastAPI. `HTTPException` existe pour ça.",
    prompt: "Station inconnue : la réponse correcte est :",
    choices: [
      "Un traceback Python dans le body, code 500",
      "`HTTPException` 404, message lisible",
      "200 avec `{}` pour « ne rien casser »",
      "301 vers `GET /stations`",
    ],
    correctIndex: 1,
    explanation:
      "`raise HTTPException(status_code=404, detail=…)` : code métier, pas de stack. Un 500 + traceback fuit l’implémentation. Un 200 vide ment (« la station existe mais elle est creuse »). Une redirection vers la liste n’explique pas que l’id est faux.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-path-query",
    day: "J1",
    context:
      "Capsule FastAPI — une ressource se désigne dans le chemin ; un filtre optionnel se pose en query. `GET /stations/12` n’est pas `GET /stations?id=12`. `GET /stations?status=open` n’est pas une autre ressource, c’est la collection filtrée.",
    prompt: "`GET /stations/{id}` et `GET /stations?status=open`, c’est :",
    choices: [
      "Deux façons identiques de lire une station",
      "Path = une ressource ; query = filtre sur la collection",
      "Query obligatoire pour tout GET",
      "Path réservé à POST, query réservée à GET",
    ],
    correctIndex: 1,
    explanation:
      "Le path identifie : `/stations/12` est la station 12. La query affine une liste : `?status=open`. Ce n’est pas interchangeable. FastAPI mappe `{id}` en paramètre de chemin et `status` en query. POST n’a pas le monopole du path.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-slots",
    day: "J1",
    context:
      "TP 04 — Fleet Classes. Plus de « god dict ». `Station` porte `capacity`, `docked_count`, et une méthode. Exemple du TP : capacity 12, 9 vélos dockés. Le nombre de places libres n’est pas un champ magique, c’est un calcul.",
    prompt: "`Station(capacity=12, docked_count=9).remaining_slots()` vaut :",
    choices: [
      "12",
      "9",
      "3",
      "None, tant que uvicorn n’a pas démarré",
    ],
    correctIndex: 2,
    explanation:
      "`remaining_slots() = capacity - docked_count` → 3. La règle vit dans la classe, pas dans la route. uvicorn n’est pas requis : le TP demande un `scripts/check_models.py` qui instancie la station hors serveur.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-rideable",
    day: "J1",
    context:
      "Toujours Fleet Classes. Helix refuse un départ sous 15 % (Flat Battery). `is_rideable()` n’est pas « batterie haute ». Un vélo `in_trip` à 80 % n’est plus au dock : on ne le propose pas à un nouvel usager. Un `docked` à 10 % non plus.",
    prompt: "`Bike(status=\"in_trip\", battery_pct=80).is_rideable()` :",
    choices: [
      "True : 80 % dépasse le seuil",
      "False : il faut `docked` et `battery_pct >= 15`",
      "True si `station_id` est renseigné",
      "Ça lève `StationNotFound`",
    ],
    correctIndex: 1,
    explanation:
      "Rideable = docké **et** batterie ≥ 15. `in_trip` à 80 % → False. `docked` à 10 % → False. `docked` à 40 % → True. `StationNotFound` concerne une station absente, pas cette règle. `station_id` ne remplace pas le statut.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-docs",
    day: "J1",
    context:
      "TP 02 — Station Board. Premier serveur : uvicorn, `GET /health` → `{\"status\":\"ok\"}`, `GET /stations` en mémoire. La démo du cours ne passe pas par un frontend : le contrat se lit dans le navigateur, généré par FastAPI.",
    prompt: "Où lit-on le contrat OpenAPI de Dock Control pendant la séance ?",
    choices: [
      "Dans `data/stations.json`",
      "Sur `GET /health` uniquement",
      "Sur `/docs` (Swagger UI)",
      "Dans le traceback d’un 404",
    ],
    correctIndex: 2,
    explanation:
      "`/docs` expose le schéma OpenAPI : routes, codes, bodies. `/health` dit juste que le process vit. Le JSON flotte n’est pas le contrat HTTP. Un traceback n’est pas de la documentation.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j1-ghost",
    day: "J1",
    context:
      "Ghost Bike encore. Un payload arrive : `{\"serial\":\"HX-1042\",\"status\":\"docked\",\"station_id\":null,\"battery_pct\":\"37%\"}`. Deux invariants Helix cassés d’un coup : docké ⇒ une station ; `battery_pct` est un entier 0–100, pas une chaîne avec `%`.",
    prompt: "Un vélo `docked` avec `station_id: null`, c’est :",
    choices: [
      "Valide : le dock se déduit du serial",
      "Valide si la batterie est au-dessus de 15 %",
      "Une spec cassée : docké implique une station",
      "Un 201 attendu sur `DELETE /health`",
    ],
    correctIndex: 2,
    explanation:
      "Invariants : `docked` ⇒ `station_id` non null ; `in_trip` ⇒ `station_id` null. Un docké orphelin est le Ghost Bike. La batterie en `\"37%\"` est un second défaut (unité). DELETE `/health` était l’autre aberration de la spec, pas une réparation.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-patch",
    day: "J2",
    context:
      "TP 01 jour 2 — Dock CRUD. On corrige le `capacity` d’une station sans renvoyer tout l’objet. PUT remplacerait la ressource ; un champ oublié l’effacerait. PATCH est partiel : ce qui n’est pas dans le body reste.",
    prompt: "Deux `PATCH` identiques sur la même station :",
    choices: [
      "Le second doit répondre 409",
      "Le second recrée la station (201)",
      "Même état final : PATCH partiel et idempotent ici",
      "Le premier est un GET déguisé",
    ],
    correctIndex: 2,
    explanation:
      "PATCH partiel : `{\"capacity\": 16}` deux fois laisse capacity à 16. Idempotent sur ce contrat. Ce n’est pas une création (201) ni un conflit (409). PUT, lui, remplacerait tout le document — un champ absent disparaîtrait.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-serial",
    day: "J2",
    context:
      "TP 02 — Stolen Serial. Chaque vélo a un `serial` unique (HX-1042). Un second `POST /bikes` avec le même serial n’est pas « encore une création ». C’est un conflit d’unicité. Un `station_id` qui n’existe pas, lui, est une ressource liée absente — autre code.",
    prompt: "Serial déjà pris sur `POST /bikes` :",
    choices: [
      "200, on écrase le premier vélo",
      "201, Helix accepte les doublons",
      "404, comme une station absente",
      "409, unicité cassée",
    ],
    correctIndex: 3,
    explanation:
      "409 Conflict pour le serial dupliqué. 404 si `station_id` pointe vers une station inconnue (lien cassé). 201 mentirait (« créé »). Écraser en 200 perd le premier vélo. Un seul choix par cas, documenté dans le README.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-persist",
    day: "J2",
    context:
      "Jour 1, la flotte vivait en mémoire. uvicorn redémarre → liste vide. Jour 2, `data/stations.json` et `data/bikes.json` survivent au process. Le TP JSON Fleet Store assemble les deux fichiers + un hold météo.",
    prompt: "Après un restart uvicorn, une liste seulement en mémoire :",
    choices: [
      "Revient intacte, FastAPI snapshot tout seul",
      "Est perdue : d’où la persistance JSON du jour 2",
      "Est recréée par `GET /health`",
      "Est la même chose que `data/stations.json`",
    ],
    correctIndex: 1,
    explanation:
      "La RAM meurt avec le process. Le JSON sur disque, non. `/health` ne restaure rien. `data/stations.json` est précisément le correctif du jour 2 — ce n’est pas « la même chose » que la liste Python en mémoire tant qu’on n’écrit pas le fichier.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-audit",
    day: "J2",
    context:
      "TP 03 — Night Audit. Script, pas une route. Lignes : `<ISO-8601> <station_id> <bike_serial> <event>` avec `event ∈ {dock, undock, offline, battery_low}`. Un log réel est sale : colonne manquante, event `yeet`, horodatage cassé. Le parseur ne doit pas tout faire exploser.",
    prompt: "Une ligne de log mal formée dans Night Audit :",
    choices: [
      "Fait crasher le script (exit 1 immédiat)",
      "Est skippée, le parseur continue",
      "Crée la station manquante en 201",
      "Doit être POST-ée sur `/health`",
    ],
    correctIndex: 1,
    explanation:
      "Skip et continue. Un audit de nuit ne s’arrête pas sur une ligne pourrie. Ce n’est pas une API : pas de 201, pas de POST `/health`. Exit ≠ 0 est pour un échec réseau (Weather Hold), pas pour une ligne ignorée.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-timeout",
    day: "J2",
    context:
      "TP 04 — Weather Hold. `requests.get(url, timeout=2)` vers une météo fictive. Sans timeout, un DNS mort laisse le script pendu. En cas d’échec réseau : message lisible, exit ≠ 0. Le cours mentionne `httpx` / async, mais le geste du TP est synchrone + timeout.",
    prompt: "`timeout=2` sur `requests.get`, c’est pour :",
    choices: [
      "Convertir la réponse en JSON deux fois",
      "Éviter un hang si le service météo ne répond pas",
      "Forcer un 409 sur les stations `exposed`",
      "Remplacer le parseur Night Audit",
    ],
    correctIndex: 1,
    explanation:
      "Le timeout borne l’attente. Sans lui, `requests` peut bloquer indéfiniment. Ça n’a rien à voir avec 409, JSON double, ou les logs. L’échec se traduit par un message d’erreur et un code de sortie non nul — pas un traceback silencieux.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-storm",
    day: "J2",
    context:
      "Weather Hold : si `condition == \"storm\"`, lister les codes des stations `exposed: true`. Ce n’est pas encore un PATCH admin qui ferme les docks. C’est une recommandation d’exploitation (`hold_recommended`). Jour 2 assemble ça dans `GET /ops/weather` ou un champ de `/health`.",
    prompt: "Orage + stations `exposed` : Dock Control doit :",
    choices: [
      "PATCH toutes les stations en `closed` tout seul",
      "Recommander un hold et lister les stations exposées",
      "Répondre 422, le JSON météo est invalide",
      "Ignorer la météo : ce n’est pas une ressource REST",
    ],
    correctIndex: 1,
    explanation:
      "Hold recommandé, liste des stations exposées. Pas d’écriture automatique de statut. 422 serait une erreur de forme sur un body Pydantic, pas une alerte météo. La météo est bien consommée (script puis route ops) : ce n’est pas « hors REST » par principe.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j2-health-delete",
    day: "J1",
    context:
      "Ghost Bike listait `DELETE /health` → 204. `/health` dit si le process répond. Ce n’est pas une station, pas un vélo, pas une ressource à retirer du système d’exploitation. Le jour 2 ne répare pas ça en persistate JSON : on ne supprime tout simplement pas le healthcheck.",
    prompt: "`DELETE /health` avec 204, dans la spec Ghost Bike :",
    choices: [
      "Correct : health est une ressource comme une station",
      "Aberrant : `/health` n’est pas une ressource métier à détruire",
      "Équivalent à `GET /health` → `{\"status\":\"ok\"}`",
      "Obligatoire avant d’écrire `data/bikes.json`",
    ],
    correctIndex: 1,
    explanation:
      "`/health` est un signal de vie, pas une entité CRUD. DELETE 204 est l’une des cassures de la spec à annoter le jour 1. Ça n’équivaut pas un GET ok, et ça n’a aucun lien avec la persistance JSON.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-lat",
    day: "J3",
    context:
      "TP 01 jour 3 — Invalid Station. `StationCreate` : latitude ∈ [-90, 90], longitude ∈ [-180, 180], `capacity ≥ 1`. Un POST `{..., \"lat\": 200}` n’est pas « presque Paris ». Rien ne doit atterrir dans `data/stations.json`.",
    prompt: "`POST /stations` avec `lat: 200` :",
    choices: [
      "201, Helix clamp à 90",
      "404, la station n’existe pas encore",
      "422, et le JSON flotte inchangé",
      "409, latitude déjà prise",
    ],
    correctIndex: 2,
    explanation:
      "422 Unprocessable Entity : le body ne passe pas le schéma. Aucune écriture. 201 écrirait n’importe quoi. 404 c’est « id inconnu », pas « champ hors bornes ». 409 c’est un conflit d’unicité (serial), pas une latitude.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-battery-field",
    day: "J3",
    context:
      "TP 02 — Battery Bounds. Ghost Bike avait `battery_pct: \"37%\"`. Pydantic v2 : `battery_pct: int = Field(..., ge=0, le=100)`. Ce n’est plus une chaîne, plus un float libre, plus un pourcentage formaté. Le seuil Flat Battery (15) est une règle métier à part.",
    prompt: "Sur `BikeCreate`, `battery_pct` se déclare surtout :",
    choices: [
      "`str` pour accepter `\"37%\"`",
      "`int` + `Field(..., ge=0, le=100)`",
      "`float` sans borne, on filtrera dans la route",
      "`Optional[int]`, 15 par défaut",
    ],
    correctIndex: 1,
    explanation:
      "Entier 0–100, borné par `Field`. `\"37%\"` doit 422, pas être parsé à la main. Filtrer dans la route trop tard : le JSON peut déjà être écrit. Le défaut 15 mélangerait « valeur absente » et « pile au seuil Flat Battery ».",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-in-trip",
    day: "J3",
    context:
      "Battery Bounds continue avec `model_validator`. Status en `Literal`. Après les champs unitaires : si `in_trip` alors `station_id is None` ; si `docked` alors `station_id` est un int. Un vélo `in_trip` encore accroché à la station 1 est incohérent — 422, pas un 201 « on verra ».",
    prompt: "`in_trip` avec `station_id=1` sur `BikeCreate` :",
    choices: [
      "201 : le trajet a une station de départ",
      "422 : `model_validator`, `station_id` doit être null",
      "409 : serial forcément pris",
      "403 Flat Battery, quel que soit le %",
    ],
    correctIndex: 1,
    explanation:
      "Le validator croise deux champs. `in_trip` ⇒ pas de station. `docked` ⇒ une station. 201 laisserait un Ghost Bike inverse. 409 / Flat Battery sont d’autres règles (unicité, seuil 15 % à l’ouverture de trajet).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-flat",
    day: "J3",
    context:
      "TP 04 — Flat Battery. `POST /trips` : le JSON est valide (types, bornes, `station_id` cohérent) mais `battery_pct < 15`. Ce n’est pas une erreur de forme. Helix refuse le métier : 403 ou 409, choix unique documenté. Pas un 422 Pydantic.",
    prompt: "Ouverture de trajet, batterie à 10 %, body sinon valide :",
    choices: [
      "422, Pydantic refuse le pourcentage",
      "201, `is_rideable` est décoratif",
      "403 ou 409 métier (FLAT_BATTERY), pas 422",
      "404, le vélo n’existe plus",
    ],
    correctIndex: 2,
    explanation:
      "10 est dans [0, 100] : le schéma passe. La règle d’exploitation refuse le départ. 422 = forme. 403/409 = métier, code `FLAT_BATTERY`. 201 trahirait `is_rideable`. 404 c’est « vélo inconnu », pas « trop plat ».",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-envelope",
    day: "J3",
    context:
      "TP 03 et 05 — Structured 422 + Error Catalog. FastAPI brut envoie `detail` (liste de loc/msg). Helix aligne tous les échecs : 400, 404, 409, 422, Flat Battery. Même forme, codes métier stables (`STATION_NOT_FOUND`, `SERIAL_TAKEN`, `VALIDATION_ERROR`, `FLAT_BATTERY`).",
    prompt: "L’envelope d’erreur Helix porte les clés :",
    choices: [
      "`detail` uniquement, comme FastAPI par défaut",
      "`code`, `message`, `details`",
      "`stack` et `traceback` pour le front",
      "`ok: false` sans code métier",
    ],
    correctIndex: 1,
    explanation:
      "`code` machine, `message` humain, `details` optionnel. Un handler `RequestValidationError` traduit le 422 vers cette envelope. `detail` brut casse les clients. Stack/traceback : c’est Ghost Bike, pas le catalogue.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-form-vs-biz",
    day: "J3",
    context:
      "Fin du jour 3 : trois familles. Forme (lat 200, battery `\"37%\"`) → 422. Ressource absente → 404. Conflit ou règle d’exploitation (serial pris, Flat Battery) → 409 ou 403. Les fusionner en un seul 400 « error » empêche le client de décider : corriger le champ, changer d’id, ou attendre une charge.",
    prompt: "Lat 200 vs serial déjà pris vs batterie à 10 % sur un trajet :",
    choices: [
      "Les trois en 500 avec traceback",
      "422 / 409 / métier (403 ou 409) — pas le même tiroir",
      "Tout en 422, Pydantic règle le monde",
      "Tout en 201, on logue à part",
    ],
    correctIndex: 1,
    explanation:
      "422 = schéma. 409 = unicité (SERIAL_TAKEN). Flat Battery = 403 ou 409 documenté, JSON pourtant valide. Pydantic ne connaît pas le seuil 15 %. Un 201 ou un 500 unique efface le diagnostic.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "py-j3-pydantic-v2",
    day: "J3",
    context:
      "Capsule jour 3 : Pydantic **v2**. `BaseModel`, `Field`, `ConfigDict`, `model_validator`. Ce n’est plus v1 (`@validator`, `orm_mode`, `class Config:`). Un copier-coller Stack Overflow v1 compile parfois, et ment sur le contrat du cours.",
    prompt: "Le standard du cours Dock Control pour valider les bodies :",
    choices: [
      "Pydantic v1 : `@validator` et `orm_mode`",
      "Pydantic v2 : `Field`, `ConfigDict`, `model_validator`",
      "Des `if` dans chaque route, sans schéma",
      "`dict` + `response_model=None` partout",
    ],
    correctIndex: 1,
    explanation:
      "v2 uniquement. `@validator` / `orm_mode` sont v1. Les `if` dans la route reviennent au god dict du jour 1. `response_model` documente la sortie OpenAPI : le désactiver partout cache le contrat que `/docs` doit montrer.",
    timeLimitMs: TIME_LIMIT_MS,
  },
]
