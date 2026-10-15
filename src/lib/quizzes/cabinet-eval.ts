import { EXAM_QUESTION_MS } from "../exam-timing"
import type { Question } from "../types"

// J1 : objets programmables · J2 : SQL analytique et CTE · J3 : administration, sécurité et optimisation.
export const CABINET_EVAL_QUESTIONS: Question[] = [
  {
    id: "eval-objets-choose-trigger",
    day: "J1",
    context:
      "Le Cabinet exige qu’une ligne soit écrite dans un journal à chaque suppression d’une pièce, quel que soit l’outil ou la requête qui supprime.",
    prompt: "Quel objet SQL répond à ce besoin ?",
    choices: [
      "Une procédure que l’application doit appeler avant chaque DELETE",
      "Un trigger sur `piece` déclenché par l’événement DELETE",
      "Une fonction IMMUTABLE appelée dans le SELECT du journal",
      "Une vue qui liste les pièces encore présentes",
    ],
    correctIndex: 1,
    explanation:
      "Un trigger réagit à un événement sur la table, sans que l’appelant ait à y penser. Une procédure dépend d’un appel explicite que l’on peut oublier.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-objets-volatility",
    day: "J1",
    context:
      "`nb_pieces(p_affaire integer)` exécute `SELECT count(*) FROM piece WHERE affaire_id = p_affaire`.",
    prompt: "Pourquoi ne faut-il pas la déclarer IMMUTABLE ?",
    choices: [
      "Parce qu’une fonction écrite en SQL ne peut jamais être IMMUTABLE",
      "Parce qu’une fonction IMMUTABLE ne peut pas recevoir de paramètre",
      "Parce que IMMUTABLE interdit l’usage de count(*) dans le corps",
      "Parce que son résultat change quand la table `piece` change, à argument identique",
    ],
    correctIndex: 3,
    explanation:
      "IMMUTABLE promet que le résultat ne dépend que des arguments. Une lecture de table peut évoluer : STABLE décrit mieux ce comportement.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-objets-into-strict",
    day: "J1",
    context:
      "Trois affaires ont le statut `'ouverte'`. Une fonction PL/pgSQL exécute :\n`SELECT id INTO STRICT v_id FROM affaire WHERE statut = 'ouverte';`",
    prompt: "Que se passe-t-il ?",
    choices: [
      "Une erreur : INTO STRICT exige exactement une ligne",
      "`v_id` reçoit l’identifiant de la première ligne trouvée",
      "`v_id` reçoit NULL, car le résultat est ambigu",
      "`v_id` reçoit un tableau des trois identifiants",
    ],
    correctIndex: 0,
    explanation:
      "Sans STRICT, la première ligne serait retenue. Avec STRICT, zéro ligne ou plusieurs lignes provoquent une erreur.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-objets-procedure-missing",
    day: "J1",
    context:
      "`demo_suspendre(p_id integer)` commence par :\n`IF NOT EXISTS (SELECT 1 FROM affaire WHERE id = p_id) THEN`\n`  RAISE EXCEPTION 'Affaire absente';`\n`END IF;`\npuis met le statut à `'suspendue'`. Aucune affaire n’a l’identifiant 999.",
    prompt: "Que produit `CALL demo_suspendre(999);` ?",
    choices: [
      "L’UPDATE ne touche aucune ligne et l’appel réussit sans message",
      "La procédure crée l’affaire 999 avec le statut suspendue",
      "L’appel échoue avec « Affaire absente », avant toute écriture",
      "CALL renvoie la valeur false",
    ],
    correctIndex: 2,
    explanation:
      "Le contrôle NOT EXISTS lève l’exception avant l’UPDATE. Une opération qui échoue en silence pourrait être prise pour un succès.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-objets-before-trim",
    day: "J1",
    context:
      "Un trigger `BEFORE INSERT ... FOR EACH ROW` sur `piece` exécute :\n`NEW.description := trim(NEW.description);`\n`RETURN NEW;`\nOn insère la description `'  carnet de bord  '`.",
    prompt: "Quelle valeur est stockée dans la table ?",
    choices: [
      "`'  carnet de bord  '` : un trigger ne peut pas modifier la ligne",
      "Aucune : RETURN NEW annule l’insertion",
      "`'carnet de bord'`",
      "Deux lignes : la version d’origine et la version nettoyée",
    ],
    correctIndex: 2,
    explanation:
      "Un trigger BEFORE peut transformer NEW. RETURN NEW laisse l’insertion se poursuivre avec la ligne modifiée.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-objets-old-delete",
    day: "J1",
    context:
      "Un trigger `AFTER DELETE ... FOR EACH ROW` sur `vacation` doit écrire dans un journal les heures de la vacation supprimée.",
    prompt: "Où la fonction du trigger trouve-t-elle ces heures ?",
    choices: [
      "Dans OLD : la ligne supprimée reste accessible",
      "Dans NEW, qui contient la ligne avant suppression",
      "Dans OLD ou NEW, qui sont identiques pour un DELETE",
      "Nulle part : il faut relire la ligne dans `vacation`",
    ],
    correctIndex: 0,
    explanation:
      "INSERT fournit NEW, DELETE fournit OLD, UPDATE fournit les deux. La ligne n’est plus dans la table, mais OLD la conserve pour le trigger.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-objets-statement-trigger",
    day: "J1",
    context:
      "Un trigger `AFTER UPDATE ... FOR EACH STATEMENT` sur `vacation` insère une trace dans un journal. On exécute :\n`UPDATE vacation SET heures = heures + 1 WHERE personne_id = 1;`\nqui modifie 5 lignes.",
    prompt: "Combien de traces sont écrites ?",
    choices: [
      "5, une par ligne modifiée",
      "0, car FOR EACH STATEMENT ne réagit qu’à une instruction sans ligne",
      "6, une par ligne et une pour l’instruction",
      "1",
    ],
    correctIndex: 3,
    explanation:
      "FOR EACH STATEMENT s’exécute une fois par instruction, même si elle touche plusieurs lignes ou aucune. FOR EACH ROW aurait produit 5 traces.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-analytique-having",
    day: "J2",
    context:
      "On veut les personnes dont le total des heures de vacation dépasse 15, avec `GROUP BY personne_id`.",
    prompt: "Où placer la condition `SUM(heures) > 15` ?",
    choices: [
      "Dans WHERE, avant le GROUP BY",
      "Dans HAVING, après le GROUP BY",
      "Dans ORDER BY, pour trier puis couper",
      "Dans le SELECT, au moyen d’un CASE",
    ],
    correctIndex: 1,
    explanation:
      "WHERE filtre les lignes avant l’agrégation, HAVING filtre les groupes après. La somme n’existe qu’une fois les groupes formés.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-analytique-left-join-count",
    day: "J2",
    context:
      "`affaire a LEFT JOIN vacation v ON v.affaire_id = a.id`, puis `GROUP BY a.id`. L’affaire 7 n’a aucune vacation.",
    prompt: "Que valent `COUNT(*)` et `COUNT(v.id)` pour l’affaire 7 ?",
    choices: [
      "1 et 0",
      "0 et 0",
      "1 et 1",
      "NULL et 0",
    ],
    correctIndex: 0,
    explanation:
      "LEFT JOIN conserve une ligne pour l’affaire 7, avec des colonnes de vacation à NULL. COUNT(*) compte cette ligne, COUNT(v.id) ignore la valeur NULL.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-analytique-rank-dense",
    day: "J2",
    context:
      "Des vacations triées par heures décroissantes valent : 8.0, 7.0, 6.0, 6.0, 5.5.",
    prompt: "Quel rang reçoit la vacation de 5.5 heures avec RANK, puis avec DENSE_RANK ?",
    choices: [
      "5 et 5",
      "4 et 5",
      "5 et 4",
      "4 et 4",
    ],
    correctIndex: 2,
    explanation:
      "Les deux vacations à 6.0 partagent le rang 3. RANK laisse ensuite un saut (5), DENSE_RANK n’en laisse pas (4).",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-analytique-lag-first",
    day: "J2",
    context:
      "`LAG(heures) OVER (PARTITION BY personne_id ORDER BY date_jour, id)`. La toute première vacation de la personne 1 dure 3.5 heures.",
    prompt: "Quelle valeur LAG renvoie-t-il sur cette première vacation ?",
    choices: [
      "0",
      "3.5",
      "Les heures de la dernière vacation de la personne précédente",
      "NULL",
    ],
    correctIndex: 3,
    explanation:
      "La première ligne d’une partition n’a pas de précédente : LAG renvoie NULL. La partition empêche de lire une autre personne.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-analytique-cte-filter",
    day: "J2",
    context:
      "Pour garder la plus longue vacation de chaque personne, on écrit :\n`WHERE ROW_NUMBER() OVER (PARTITION BY personne_id ORDER BY heures DESC, id) = 1`\nPostgreSQL refuse la requête.",
    prompt: "Quelle correction respecte l’ordre d’évaluation ?",
    choices: [
      "Remplacer ROW_NUMBER par RANK, qui est autorisé dans WHERE",
      "Calculer le numéro dans une CTE, puis filtrer `numero = 1` dans la requête principale",
      "Déplacer la condition dans HAVING, sans autre changement",
      "Ajouter `GROUP BY personne_id` pour que la fenêtre soit acceptée",
    ],
    correctIndex: 1,
    explanation:
      "WHERE est évalué avant les fonctions de fenêtre. La CTE calcule d’abord le numéro, la requête extérieure peut ensuite le filtrer.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-analytique-rows-frame",
    day: "J2",
    context:
      "`SUM(heures) OVER (ORDER BY heures)` donne le même cumul à deux vacations de mêmes heures. On veut un cumul qui progresse ligne par ligne.",
    prompt: "Quelle fenêtre convient ?",
    choices: [
      "`OVER (PARTITION BY heures)`",
      "`OVER (ORDER BY heures DESC)`",
      "`OVER (ORDER BY heures, id ROWS UNBOUNDED PRECEDING)`",
      "`OVER ()` suivi d’un `GROUP BY id`",
    ],
    correctIndex: 2,
    explanation:
      "Avec ORDER BY, le cadre par défaut inclut les pairs (ex æquo). ROWS et une clé de départage comme id rendent la progression explicite et déterministe.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-admin-role-login",
    day: "J3",
    context:
      "Un administrateur exécute `CREATE ROLE demo_lecteur;` puis essaie de se connecter à la base avec ce rôle.",
    prompt: "Que se passe-t-il ?",
    choices: [
      "La connexion fonctionne avec un mot de passe vide",
      "Le rôle est supprimé faute de mot de passe",
      "La connexion fonctionne : CREATE ROLE donne LOGIN comme CREATE USER",
      "La connexion est refusée : sans LOGIN, le rôle n’est pas un compte de connexion",
    ],
    correctIndex: 3,
    explanation:
      "Un utilisateur PostgreSQL est un rôle avec LOGIN. CREATE USER ajoute LOGIN par défaut, CREATE ROLE non (rolcanlogin = false).",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-admin-revoke-inherited",
    day: "J3",
    context:
      "Après `REVOKE SELECT ON piece FROM demo_lecteur;`, le rôle `demo_lecteur` arrive encore à lire `piece`.",
    prompt: "Quelle explication faut-il vérifier en premier ?",
    choices: [
      "REVOKE ne prend effet qu’après un redémarrage du serveur",
      "Le rôle est membre d’un rôle (ex. `demo_equipe`) qui possède SELECT sur `piece`",
      "REVOKE ne retire que INSERT, UPDATE et DELETE",
      "La lecture vient d’un cache du client SQL",
    ],
    correctIndex: 1,
    explanation:
      "REVOKE retire le droit direct, pas les autres sources : appartenance à un rôle, droits PUBLIC. Il faut contrôler les droits effectifs.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-admin-view-live",
    day: "J3",
    context:
      "`demo_annuaire` est une vue ordinaire sur `personne`. On modifie la ville d’une personne dans `personne`, puis on relit la vue.",
    prompt: "Que montre la vue ?",
    choices: [
      "La nouvelle ville : la vue réévalue sa requête à chaque lecture",
      "L’ancienne ville, jusqu’à un REFRESH de la vue",
      "Une erreur, car la table source a changé",
      "Plus aucune ligne pour cette personne",
    ],
    correctIndex: 0,
    explanation:
      "Une vue ordinaire conserve sa définition, pas une copie des lignes. Seule une vue matérialisée stocke un résultat à rafraîchir avec REFRESH.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-admin-view-boundary",
    day: "J3",
    context:
      "Le rôle `demo_rue` a reçu `GRANT SELECT ON demo_annuaire` (une vue sur `personne`), mais aucun droit sur `personne`. Il exécute `SELECT * FROM personne;`.",
    prompt: "Quel est le résultat ?",
    choices: [
      "Toutes les colonnes de `personne`",
      "Seulement les colonnes exposées par la vue",
      "Une erreur permission denied for table personne",
      "Seulement les lignes filtrées par la vue",
    ],
    correctIndex: 2,
    explanation:
      "Le droit sur la vue ne donne aucun droit sur la table source. C’est la gestion des privilèges qui fait de la vue une frontière d’accès.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-admin-savepoint",
    day: "J3",
    context:
      "La vacation 3 vaut 3.0 heures. On exécute :\n`BEGIN;`\n`UPDATE vacation SET heures = 4 WHERE id = 3;`\n`SAVEPOINT essai;`\n`UPDATE vacation SET heures = 99 WHERE id = 3;`\n`ROLLBACK TO essai;`\n`COMMIT;`",
    prompt: "Combien d’heures la vacation 3 a-t-elle ensuite ?",
    choices: [
      "3.0",
      "4.0",
      "99",
      "Aucune valeur : ROLLBACK TO annule toute la transaction",
    ],
    correctIndex: 1,
    explanation:
      "ROLLBACK TO annule seulement ce qui suit le point de sauvegarde. La première modification est conservée, puis validée par COMMIT.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-admin-aborted-transaction",
    day: "J3",
    context:
      "Dans une transaction ouverte par `BEGIN`, un UPDATE réussit, puis un INSERT échoue sur une clé primaire en double. On envoie ensuite un SELECT.",
    prompt: "Que se passe-t-il ?",
    choices: [
      "Le SELECT s’exécute : seule l’instruction fautive est ignorée",
      "L’UPDATE est validé automatiquement au moment de l’erreur",
      "PostgreSQL ouvre de lui-même une nouvelle transaction",
      "La transaction est en échec : les commandes sont refusées jusqu’au ROLLBACK",
    ],
    correctIndex: 3,
    explanation:
      "Dans une transaction explicite, une erreur met la transaction en échec. Il faut annuler, ou revenir à un point de sauvegarde, avant de continuer.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
  {
    id: "eval-admin-index-seq-scan",
    day: "J3",
    context:
      "On crée un index B-tree sur `temoignage(personne_id)`. La table contient 8 lignes. `EXPLAIN SELECT * FROM temoignage WHERE personne_id = 5;` affiche toujours `Seq Scan on temoignage`.",
    prompt: "Comment interpréter ce plan ?",
    choices: [
      "C’est normal : sur une si petite table, le parcours séquentiel est estimé moins coûteux",
      "L’index est cassé et doit être recréé",
      "Il faut un COMMIT pour que l’index soit activé",
      "EXPLAIN ignore toujours les index : seul EXPLAIN ANALYZE les utilise",
    ],
    correctIndex: 0,
    explanation:
      "Un index est un chemin possible, pas une obligation. Le moteur compare les coûts estimés : sur 8 lignes, tout parcourir peut coûter moins cher.",
    timeLimitMs: EXAM_QUESTION_MS,
  },
]
