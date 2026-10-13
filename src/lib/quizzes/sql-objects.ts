import { TIME_LIMIT_MS } from "../questions"
import type { Question } from "../types"

export const SQL_OBJECTS_QUESTIONS: Question[] = [
  {
    id: "sql-objects-choose-function",
    day: "J1",
    context:
      "Cabinet du Quai — on veut calculer un montant TTC à partir du HT et du taux de TVA, directement dans une requête SELECT.",
    prompt: "Quel objet programmable convient à ce calcul réutilisable ?",
    choices: [
      "Une fonction qui renvoie le montant TTC",
      "Une procédure appelée avec CALL dans chaque colonne",
      "Un trigger qui attend obligatoirement un INSERT",
      "Un trigger BEFORE SELECT qui remplace une colonne du résultat",
    ],
    correctIndex: 0,
    explanation:
      "Une fonction fournit un résultat utilisable dans une expression SQL. Une procédure se lance avec CALL. Un trigger réagit à un événement sur une table : il n’est pas appelé pour chaque calcul d’un SELECT.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-select-call",
    day: "J1",
    context:
      "La fonction scalaire `demo_ttc(numeric, numeric)` existe déjà. On veut afficher son résultat pour 50 euros HT et un taux de 0.20.",
    prompt: "Quel appel SQL est adapté ?",
    choices: [
      "`CALL demo_ttc(50, 0.20);`",
      "`SELECT demo_ttc(50, 0.20);`",
      "`SELECT demo_ttc;`",
      "`SELECT * FROM demo_ttc;`",
    ],
    correctIndex: 1,
    explanation:
      "Une fonction scalaire se place dans une expression, ici dans SELECT. CALL sert aux procédures. Le nom seul n’appelle pas la fonction : ses arguments doivent être transmis entre parenthèses.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-returns-table",
    day: "J1",
    context:
      "`demo_pieces(p_affaire integer)` est déclarée `RETURNS TABLE(id integer, type text)`. On veut lire les pièces de l’affaire 3, avec leurs deux colonnes séparées.",
    prompt: "Quelle requête expose ce résultat comme des lignes et colonnes ?",
    choices: [
      "`CALL demo_pieces(3);`",
      "`SELECT id, type FROM demo_pieces;`",
      "`SELECT id, type FROM demo_pieces(3);`",
      "`SELECT id, type FROM piece WHERE id = 3;`",
    ],
    correctIndex: 2,
    explanation:
      "L’appel dans FROM expose les colonnes id et type annoncées par RETURNS TABLE. Le paramètre 3 désigne ici l’affaire, pas l’identifiant d’une seule pièce. La fonction ne crée pas une table persistante.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-declare-into-notice",
    day: "J1",
    context:
      "personne contient 4 lignes. Extrait PL/pgSQL :\n`DECLARE v_n integer;`\n`BEGIN`\n`  SELECT count(*) INTO v_n FROM personne;`\n`  RAISE NOTICE 'Personnes : %', v_n;`\n`END;`",
    prompt: "Quel est l’effet de cet extrait ?",
    choices: [
      "Il crée une table v_n contenant les 4 personnes",
      "Il renvoie les 4 lignes au client sans remplir v_n",
      "Il place 4 dans v_n et affiche une notice, sans modifier personne",
      "Il lève une exception parce que count(*) porte sur plusieurs lignes",
    ],
    correctIndex: 2,
    explanation:
      "DECLARE introduit la variable locale. Dans PL/pgSQL, SELECT INTO range le résultat dans cette variable. RAISE NOTICE affiche un message d’information ; aucune écriture n’est présente ici.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-into-strict",
    day: "J1",
    context:
      "Extrait PL/pgSQL : `SELECT id INTO STRICT v_id FROM personne WHERE nom = p_nom;`. Aucune gestion d’exception n’entoure ce SELECT.",
    prompt: "Quelle exigence `INTO STRICT` impose-t-il au résultat ?",
    choices: [
      "Exactement une ligne ; zéro ou plusieurs lignes provoquent une erreur",
      "Au moins une ligne ; les lignes suivantes sont toujours ignorées",
      "Aucune ligne ; v_id doit obligatoirement rester NULL",
      "Une ligne contenant uniquement des colonnes NOT NULL",
    ],
    correctIndex: 0,
    explanation:
      "INTO STRICT exige exactement une ligne. Zéro ligne produit NO_DATA_FOUND et plusieurs lignes TOO_MANY_ROWS. Cette règle porte sur le nombre de lignes, pas sur la présence de NULL dans une colonne.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-raise-exception",
    day: "J1",
    context:
      "Avant d’insérer une vacation : `IF p_heures < 0 THEN RAISE EXCEPTION 'Heures négatives'; END IF;`. L’argument vaut -2 ; l’exception n’est pas interceptée.",
    prompt: "L’INSERT situé après ce contrôle :",
    choices: [
      "S’exécute avec 0 heure après conversion automatique",
      "N’est pas exécuté : l’exception interrompt la routine avec une erreur",
      "S’exécute quand même, comme après RAISE NOTICE",
      "S’exécute, mais la routine transforme l’exception en notice automatiquement",
    ],
    correctIndex: 1,
    explanation:
      "RAISE EXCEPTION signale une erreur et interrompt l’exécution normale. Comme elle n’est pas interceptée, on n’atteint pas l’INSERT. RAISE NOTICE, lui, sert à informer sans arrêter la routine.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-procedure-call-check",
    day: "J1",
    context:
      "`demo_suspendre(p_id integer)` refuse une affaire absente avec NOT EXISTS, puis met son statut à `'suspendue'`. L’affaire 5 existe.",
    prompt: "Quel enchaînement lance la procédure et vérifie son effet ?",
    choices: [
      "`SELECT demo_suspendre(5);` puis lire le statut de l’affaire 5",
      "`CALL demo_suspendre(999);` en supposant que l’absence crée une affaire",
      "`CALL demo_suspendre(5);` puis supposer que CALL renvoie la ligne modifiée",
      "`CALL demo_suspendre(5);` puis `SELECT statut FROM affaire WHERE id = 5;`",
    ],
    correctIndex: 3,
    explanation:
      "CALL lance la procédure ; le SELECT ciblé vérifie le statut 'suspendue'. NOT EXISTS refuse une affaire absente avant l’UPDATE. Ni CALL ni UPDATE ne créent automatiquement la cible manquante.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-trigger-event",
    day: "J1",
    context:
      "Un trigger actif `AFTER INSERT ON temoignage FOR EACH ROW` appelle une fonction d’audit. Un étudiant insère un témoignage.",
    prompt: "Comment la fonction d’audit est-elle déclenchée ?",
    choices: [
      "L’étudiant doit faire un CALL supplémentaire après l’INSERT",
      "PostgreSQL l’appelle automatiquement lorsque l’événement INSERT survient",
      "Elle s’exécute seulement au prochain SELECT sur temoignage",
      "Le nom de la fonction doit figurer dans le VALUES de l’INSERT",
    ],
    correctIndex: 1,
    explanation:
      "Le trigger relie un événement de la table à une fonction de trigger. L’INSERT suffit à le déclencher automatiquement : l’application n’a pas à appeler elle-même l’audit.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-old-new",
    day: "J1",
    context:
      "Une fonction de trigger FOR EACH ROW doit lire les valeurs d’une ligne selon l’événement : INSERT, UPDATE ou DELETE.",
    prompt: "Quelle association des versions de ligne est correcte ?",
    choices: [
      "INSERT : NEW ; UPDATE : OLD et NEW ; DELETE : OLD",
      "INSERT : OLD ; UPDATE : NEW seulement ; DELETE : NEW",
      "INSERT, UPDATE et DELETE : toujours OLD et NEW",
      "INSERT : NEW ; UPDATE : OLD seulement ; DELETE : ni OLD ni NEW",
    ],
    correctIndex: 0,
    explanation:
      "NEW porte la ligne insérée ou la nouvelle version après UPDATE. OLD porte l’ancienne version pour UPDATE ou DELETE. Une insertion n’a pas d’ancienne ligne et une suppression n’a pas de nouvelle ligne.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-row-statement",
    day: "J1",
    context:
      "Deux triggers actifs sur UPDATE : A `FOR EACH ROW`, B `FOR EACH STATEMENT`. Un premier UPDATE touche 3 lignes ; un second UPDATE n’en touche aucune. Il n’y a ni filtre WHEN ni écriture supplémentaire par les triggers.",
    prompt: "Combien d’appels A et B provoque chaque UPDATE ?",
    choices: [
      "Premier : A = 1, B = 3 ; second : A = 1, B = 0",
      "Premier : A = 3, B = 3 ; second : A = 0, B = 0",
      "Premier : A = 3, B = 1 ; second : A = 0, B = 0",
      "Premier : A = 3, B = 1 ; second : A = 0, B = 1",
    ],
    correctIndex: 3,
    explanation:
      "FOR EACH ROW s’exécute pour chaque ligne touchée : 3 puis 0. FOR EACH STATEMENT s’exécute une fois par instruction correspondante, même si celle-ci ne modifie aucune ligne : 1 puis 1.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-grain-window",
    day: "J1",
    context:
      "Le cabinet veut afficher chaque vacation avec le total d’heures de la personne. Il faut garder une ligne par vacation.",
    prompt: "Quel choix conserve ce niveau de détail ?",
    choices: [
      "`GROUP BY personne_id`, qui produit une ligne par personne",
      "`SUM(heures) OVER (PARTITION BY personne_id)`, qui garde les vacations et ajoute leur total",
      "`HAVING personne_id`, qui duplique chaque vacation",
      "`COUNT(*)`, qui ajoute le total d’heures à chaque ligne",
    ],
    correctIndex: 1,
    explanation:
      "Une fonction de fenêtre calcule une valeur sur les lignes de la partition sans les regrouper : chaque vacation reste visible. GROUP BY réduirait le résultat à une ligne par personne.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-where-having",
    day: "J1",
    context:
      "Le cabinet veut garder les personnes dont le total de vacations dépasse 15 heures. Le seuil porte sur la somme par personne.",
    prompt: "Où placer ce filtre après `GROUP BY personne_id` ?",
    choices: [
      "Dans `WHERE SUM(heures) > 15`, avant la formation des groupes",
      "Dans `HAVING SUM(heures) > 15`, après l’agrégation",
      "Dans `ORDER BY SUM(heures) > 15`, qui retire les groupes",
      "Dans `LIMIT 15`, qui teste le total de chaque groupe",
    ],
    correctIndex: 1,
    explanation:
      "WHERE sélectionne les lignes avant l’agrégation. HAVING teste les groupes déjà formés, donc il convient à un seuil portant sur SUM(heures).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-count-null",
    day: "J1",
    context:
      "La table affaire contient 10 affaires, dont 4 avec `clos_at` renseigné et 6 avec `clos_at = NULL`.",
    prompt: "Que renvoient `COUNT(*)` et `COUNT(clos_at)` ?",
    choices: [
      "10 et 4",
      "4 et 10",
      "10 et 10",
      "4 et 4",
    ],
    correctIndex: 0,
    explanation:
      "COUNT(*) compte les lignes, y compris celles dont clos_at est NULL. COUNT(clos_at) compte seulement les valeurs non NULL : ici 4 dates de clôture.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-left-join-count",
    day: "J1",
    context:
      "Une requête part de affaire et fait un LEFT JOIN vers vacation. Une affaire sans vacation doit tout de même apparaître avec un total égal à zéro.",
    prompt: "Quel comptage évite de compter la ligne préservée par le LEFT JOIN comme une vacation ?",
    choices: [
      "`COUNT(*)`, car il ignore automatiquement les lignes sans correspondance",
      "`COUNT(v.id)`, car l’identifiant de vacation vaut NULL sans correspondance",
      "`COUNT(affaire.id)`, car il compte les vacations jointes",
      "`COUNT(NULL)`, car il renvoie une vacation par affaire",
    ],
    correctIndex: 1,
    explanation:
      "LEFT JOIN garde une ligne pour l’affaire même sans vacation. Dans ce cas v.id vaut NULL ; COUNT(v.id) ne la compte donc pas. COUNT(*) compterait cette ligne préservée.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-row-number-order",
    day: "J1",
    context:
      "Deux vacations d’une même personne ont la même date. La requête utilise `ROW_NUMBER() OVER (PARTITION BY personne_id ORDER BY date_jour)` pour les numéroter.",
    prompt: "Comment rendre leur numérotation stable ?",
    choices: [
      "Ajouter `id` comme critère de départage dans l’ORDER BY de la fenêtre",
      "Ajouter `id` dans un ORDER BY final seulement",
      "Remplacer ROW_NUMBER par COUNT(*)",
      "Ajouter HAVING date_jour pour supprimer l’égalité",
    ],
    correctIndex: 0,
    explanation:
      "Si plusieurs lignes partagent date_jour, leur ordre relatif n’est pas déterminé par ce seul critère. Ajouter une clé unique comme id dans l’ORDER BY de la fenêtre rend les numéros reproductibles.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-rank-ties",
    day: "J1",
    context:
      "Les heures des vacations triées par ordre décroissant sont 8, 7, 6, 6, 5. On calcule `RANK()` et `DENSE_RANK()` sur ces heures.",
    prompt: "Quels rangs reçoivent les deux vacations à 6 heures ?",
    choices: [
      "RANK : 3 et 4 ; DENSE_RANK : 3 et 4",
      "RANK : 3 et 3 ; DENSE_RANK : 3 et 3",
      "RANK : 3 et 3 ; DENSE_RANK : 4 et 4",
      "RANK : 4 et 4 ; DENSE_RANK : 3 et 3",
    ],
    correctIndex: 1,
    explanation:
      "Les deux valeurs égales partagent le rang 3 avec les deux fonctions. RANK laisse ensuite un saut (la valeur suivante reçoit 5), tandis que DENSE_RANK ne saute pas (elle reçoit 4).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-lag-previous",
    day: "J1",
    context:
      "Pour une personne, les vacations sont ordonnées par date_jour puis id. `LAG(heures)` lit la valeur de la ligne précédente dans cet ordre.",
    prompt: "Que vaut LAG sur la première vacation de cette partition ?",
    choices: [
      "0, car aucune vacation antérieure n’a été enregistrée",
      "NULL, car aucune ligne précédente n’existe dans la partition",
      "Les heures de la veille au calendrier, même sans vacation ce jour-là",
      "Le total des heures de la personne",
    ],
    correctIndex: 1,
    explanation:
      "LAG suit l’ordre défini par la fenêtre et ne trouve pas de ligne précédente pour la première ligne : la valeur est NULL par défaut. Cette ligne n’est pas nécessairement la veille au calendrier.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-window-rows-frame",
    day: "J1",
    context:
      "Le cabinet veut un cumul qui avance vacation par vacation, même lorsque plusieurs vacations ont le même nombre d’heures. La fenêtre est ordonnée par heures.",
    prompt: "Quel choix exprime une progression ligne par ligne et un ordre déterministe ?",
    choices: [
      "`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, avec `ORDER BY heures, id`",
      "Le cadre par défaut avec `ORDER BY heures`, qui sépare toujours les valeurs égales",
      "`PARTITION BY heures`, qui ordonne les vacations par date",
      "`HAVING SUM(heures)`, qui construit un cadre de fenêtre",
    ],
    correctIndex: 0,
    explanation:
      "ROWS explicite un cadre qui progresse ligne par ligne. Ajouter id après heures départage les ex æquo. Le cadre par défaut avec ORDER BY inclut les pairs et peut donc donner le même cumul aux lignes de même valeur.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-cte-window-filter",
    day: "J1",
    context:
      "Le cabinet veut sélectionner la vacation la plus longue de chaque personne. Le rang est calculé avec ROW_NUMBER dans chaque partition, puis il faut garder `numero = 1`.",
    prompt: "Pourquoi calculer le numéro dans une CTE puis filtrer dans la requête principale ?",
    choices: [
      "Une fonction de fenêtre peut être utilisée directement dans WHERE",
      "WHERE s’exécute avant les fenêtres ; la requête extérieure peut filtrer la colonne calculée",
      "Une CTE rend le rang permanent dans une table",
      "La CTE fait ignorer les autres vacations lors du classement",
    ],
    correctIndex: 1,
    explanation:
      "WHERE intervient avant le calcul des fonctions de fenêtre, donc il ne peut pas filtrer leur résultat dans la même sélection. La CTE calcule le numéro sur les vacations, puis la requête principale conserve numero = 1.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-analytics-cte-scope",
    day: "J1",
    context:
      "Une requête commence par `WITH extrait AS (SELECT id FROM affaire) SELECT id FROM extrait;`. Ensuite, une nouvelle instruction SQL tente `SELECT * FROM extrait;`.",
    prompt: "Que se passe-t-il lors de la deuxième instruction ?",
    choices: [
      "Elle relit la CTE, qui reste disponible pendant la session",
      "Elle réussit si la première instruction a renvoyé au moins une ligne",
      "Elle échoue : le nom de la CTE n’existe que pendant l’instruction qui suit WITH",
      "Elle crée une vue temporaire nommée extrait",
    ],
    correctIndex: 2,
    explanation:
      "Une CTE nomme un résultat intermédiaire pour une seule instruction. Elle ne crée ni table ni vue persistante ; la seconde instruction ne connaît donc pas extrait.",
    timeLimitMs: TIME_LIMIT_MS,
  },
]
