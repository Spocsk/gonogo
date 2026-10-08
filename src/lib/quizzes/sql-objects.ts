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
    id: "sql-objects-returns-contract",
    day: "J1",
    context:
      "En-tête d’une fonction : `CREATE FUNCTION demo_ttc(p_ht numeric, p_taux numeric) RETURNS numeric`. Le corps utilise les deux paramètres.",
    prompt: "Que précise `RETURNS numeric` ?",
    choices: [
      "Le nombre de paramètres obligatoires",
      "La table où le résultat sera enregistré",
      "Le type du résultat renvoyé par la fonction",
      "La valeur du taux de TVA par défaut",
    ],
    correctIndex: 2,
    explanation:
      "`p_ht` et `p_taux` sont les entrées, toutes deux de type numeric. `RETURNS numeric` annonce le type de sortie ; cela ne crée aucune colonne et ne stocke pas automatiquement le résultat.",
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
    id: "sql-objects-signature-overload",
    day: "J1",
    context:
      "Dans le même schéma, le cabinet définit `demo_libelle(integer)` et `demo_libelle(text)`. Les deux objets portent le même nom.",
    prompt: "Pourquoi ces deux fonctions peuvent-elles coexister ?",
    choices: [
      "Les noms des paramètres suffisent à distinguer deux fonctions",
      "Le type de retour permet toujours de départager deux signatures identiques",
      "PostgreSQL choisit systématiquement la dernière fonction créée",
      "Leurs types de paramètres d’entrée diffèrent : c’est une surcharge",
    ],
    correctIndex: 3,
    explanation:
      "La signature distingue les fonctions par leur nom et leurs types d’entrée. Changer seulement le nom d’un paramètre ou le type de retour ne crée pas une surcharge avec les mêmes types d’entrée.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-demo-ttc",
    day: "J1",
    context:
      "Le corps SQL de `demo_ttc(p_ht numeric, p_taux numeric)` est `SELECT p_ht * (1 + p_taux);`. On exécute `SELECT demo_ttc(50, 0.20);`.",
    prompt: "Quel montant numérique est renvoyé ?",
    choices: ["50", "60", "10", "70"],
    correctIndex: 1,
    explanation:
      "50 × (1 + 0.20) = 60. Le taux 0.20 ajoute 20 % au montant HT. 10 est seulement le montant de TVA, pas le TTC.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-strict-null",
    day: "J1",
    context:
      "`demo_ttc(numeric, numeric)` renvoie une valeur numeric et est déclarée `STRICT`. On l’appelle avec `SELECT demo_ttc(NULL, 0.20);`.",
    prompt: "Que se passe-t-il pour cet appel ?",
    choices: [
      "Le résultat est NULL sans exécuter le corps de la fonction",
      "NULL devient automatiquement 0, donc le résultat est 0",
      "STRICT lève toujours une exception si un argument est NULL",
      "Le corps s’exécute et peut remplacer NULL par une valeur",
    ],
    correctIndex: 0,
    explanation:
      "Pour une fonction STRICT, un argument NULL suffit à produire NULL sans exécuter le corps. Cette option ne convertit pas NULL en zéro et ne doit pas être confondue avec SELECT INTO STRICT.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-volatility",
    day: "J1",
    context:
      "Trois fonctions : A calcule uniquement avec ses arguments ; B compte les lignes de personne ; C renvoie un tirage aléatoire.",
    prompt: "Quelles catégories de volatilité conviennent à A, B et C ?",
    choices: [
      "A VOLATILE ; B IMMUTABLE ; C STABLE",
      "A STABLE ; B VOLATILE ; C IMMUTABLE",
      "A IMMUTABLE ; B IMMUTABLE ; C IMMUTABLE",
      "A IMMUTABLE ; B STABLE ; C VOLATILE",
    ],
    correctIndex: 3,
    explanation:
      "IMMUTABLE promet le même résultat pour les mêmes arguments. STABLE permet une lecture dont le résultat reste stable dans une instruction SQL. VOLATILE convient à un résultat pouvant varier entre appels, comme un tirage aléatoire.",
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
    id: "sql-objects-if-return",
    day: "J1",
    context:
      "Corps de `demo_charge(h numeric) RETURNS text` :\n`IF h >= 6 THEN`\n`  RETURN 'longue';`\n`ELSE`\n`  RETURN 'courte';`\n`END IF;`\nOn appelle la fonction avec h = 7.",
    prompt: "Quelle valeur la fonction renvoie-t-elle ?",
    choices: [
      "`'courte'`, car la branche ELSE est toujours exécutée en dernier",
      "NULL, car aucun RETURN n’est placé après END IF",
      "`'longue'` puis `'courte'`, car les deux RETURN s’enchaînent",
      "`'longue'`, puis l’exécution de la fonction se termine",
    ],
    correctIndex: 3,
    explanation:
      "7 >= 6 est vrai : la fonction entre dans la première branche. RETURN renvoie 'longue' et termine cet appel. ELSE n’est donc pas exécuté.",
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
    id: "sql-objects-before-after",
    day: "J1",
    context:
      "Le cabinet nettoie piece avec un BEFORE et audite temoignage avec un AFTER. Ces triggers ordinaires ne sont pas différés.",
    prompt: "Que signifie `AFTER` ici ?",
    choices: [
      "Après le COMMIT, dans une nouvelle transaction indépendante",
      "Après la fermeture de la session SQL",
      "Après l’opération concernée, mais encore dans la même transaction",
      "Avant l’écriture, avec la possibilité de réécrire NEW pour cette insertion",
    ],
    correctIndex: 2,
    explanation:
      "AFTER ne signifie pas « après COMMIT ». Le trigger observe l’opération effectuée dans la transaction en cours. BEFORE sert notamment à préparer la ligne avant son écriture.",
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
    id: "sql-objects-trim-return-new",
    day: "J1",
    context:
      "Trigger `BEFORE INSERT FOR EACH ROW` sur piece :\n`NEW.description := trim(NEW.description);`\n`RETURN NEW;`\nLa description envoyée est `' loupe '`.",
    prompt: "Quelle description est proposée à l’insertion ?",
    choices: [
      "NULL, car RETURN NEW annule toute insertion",
      "`'loupe'`, sans les espaces aux extrémités",
      "`' loupe '`, car un BEFORE ne peut jamais changer NEW",
      "La description de la pièce précédente, lue dans OLD",
    ],
    correctIndex: 1,
    explanation:
      "Le BEFORE modifie NEW puis renvoie cette ligne avec RETURN NEW. trim retire les espaces aux extrémités. OLD n’est pas la pièce précédente : il n’y a pas d’ancienne version de cette ligne lors d’un INSERT.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-audit-transaction",
    day: "J1",
    context:
      "Un témoignage lié à l’affaire 3 est inséré. Son trigger AFTER INSERT exécute `INSERT INTO journal(affaire_id, action) VALUES (NEW.affaire_id, 'temoignage_ajoute');`.",
    prompt: "Quelle trace est créée et par quel mécanisme ?",
    choices: [
      "Une trace pour l’affaire 3, seulement après un CALL manuel de l’audit",
      "Une trace pour l’affaire 3, automatiquement dans une transaction autonome",
      "Une trace (3, 'temoignage_ajoute'), automatiquement dans la même transaction",
      "Une trace pour l’identifiant du témoignage, car NEW.affaire_id change de sens",
    ],
    correctIndex: 2,
    explanation:
      "Le trigger écrit automatiquement l’affaire 3 et l’action 'temoignage_ajoute' dans journal. NEW.affaire_id reste l’identifiant de l’affaire liée. L’audit participe à la même transaction que l’insertion du témoignage.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "sql-objects-update-delta",
    day: "J1",
    context:
      "Un trigger de ligne sur UPDATE de vacation reçoit `OLD.heures = 3` et `NEW.heures = 5`. Le journal utilise `NEW.heures - OLD.heures`.",
    prompt: "Quelle variation d’heures est enregistrée ?",
    choices: [
      "+2 heures, en comparant la nouvelle version à l’ancienne",
      "-2 heures, car OLD désigne la valeur après UPDATE",
      "+5 heures, car NEW contient uniquement la différence",
      "+8 heures, car les deux versions doivent être additionnées",
    ],
    correctIndex: 0,
    explanation:
      "NEW contient 5, OLD contient 3 : 5 − 3 = +2. Les deux versions permettent d’auditer le changement. NEW.heures est la nouvelle valeur complète, pas le delta.",
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
]
