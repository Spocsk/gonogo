import { TIME_LIMIT_MS } from "../questions"
import type { Question } from "../types"

// Source : UP1 « Panorama réglementaire et normatif », module Gouvernance & conformité (M1 Cybersécurité).
// Fil rouge : due diligence d’Arcadia Capital sur Novalia Services (univers fictif).
export const NOVALIA_UP1_QUESTIONS: Question[] = [
  {
    id: "novalia-up1-directive",
    day: "J1",
    context:
      "Le RGPD est un règlement européen, NIS2 une directive européenne. Arcadia veut savoir pourquoi la seconde n’oblige pas encore Novalia de la même façon.",
    prompt: "Qui une directive européenne oblige-t-elle en premier lieu ?",
    choices: [
      "Toutes les entreprises de l’UE, directement et dès sa publication",
      "Les États membres, qui doivent la transposer dans leur droit national",
      "Uniquement les entreprises certifiées ISO 27001",
      "Les signataires d’un contrat qui la cite",
    ],
    correctIndex: 1,
    explanation:
      "Une directive fixe un résultat aux États, qui la transposent par une loi nationale. Un règlement, comme le RGPD, s’applique directement dans toute l’UE (art. 288 TFUE).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-rgs-indirect",
    day: "J1",
    context:
      "Pièce DR-01-E02, CCAP du marché de la Ville de Sainte-Aure, art. 9 : « Le titulaire fournit à la Ville, avant la mise en service, les éléments nécessaires à son homologation au titre du RGS. »",
    prompt: "Dans la matrice, comment qualifier le RGS pour Novalia ?",
    choices: [
      "Oui : Novalia est une autorité administrative",
      "Non : le RGS ne vise que l’État et les collectivités",
      "Non applicable : MaMairie+ n’est pas un téléservice",
      "Indirect (contractuel) : le marché l’attache aux exigences RGS",
    ],
    correctIndex: 3,
    explanation:
      "Le RGS s’impose aux autorités administratives, pas à Novalia. Mais le CCAP lui transfère l’obligation de fournir le dossier d’homologation : l’obligation existe, par contrat. Un contrat peut rendre obligatoire ce que la loi ne vous impose pas.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-roles",
    day: "J1",
    context:
      "Novalia Paie calcule les bulletins de 1 900 PME selon leurs instructions. Novalia gère aussi la paie de ses propres 312 salariés.",
    prompt: "Quelle qualification RGPD est exacte ?",
    choices: [
      "Novalia est responsable de traitement pour les deux paies",
      "Novalia est sous-traitante pour les deux paies",
      "Responsable pour sa paie interne, sous-traitante pour celle des PME",
      "Novalia est hors champ : ce sont des données RH, pas des données clients",
    ],
    correctIndex: 2,
    explanation:
      "On qualifie traitement par traitement. Pour la paie des PME, ce sont elles qui fixent la finalité : Novalia traite pour leur compte (art. 4.8, 28). Pour ses propres salariés, Novalia décide seule : elle est responsable (art. 4.7).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-reuse",
    day: "J1",
    context:
      "Un commercial propose de réutiliser les fichiers de salariés des PME clientes de Novalia Paie pour leur proposer une mutuelle partenaire.",
    prompt: "Quelle serait la situation de Novalia ?",
    choices: [
      "Elle deviendrait responsable de ce nouveau traitement, et fautive",
      "Rien ne change : elle reste sous-traitante sur ces données",
      "C’est licite tant que les données restent hébergées en France",
      "C’est licite si la PME cliente est prévenue a posteriori",
    ],
    correctIndex: 0,
    explanation:
      "En fixant elle-même une nouvelle finalité, Novalia sort de son rôle de sous-traitante et devient responsable de ce traitement, sans base légale et en violation de la limitation des finalités.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-non-verifie",
    day: "J1",
    context:
      "En entretien, le DSI affirme : « On a un plan de continuité, il est testé chaque année. » Aucun PCA ni compte rendu de test n’est versé à la data room.",
    prompt: "Quel tampon pose le cabinet sur ce point ?",
    choices: [
      "Conforme : le DSI est la personne la mieux placée",
      "Non conforme : l’absence de pièce prouve l’absence de PCA",
      "Non vérifié : une affirmation orale n’est pas une preuve",
      "Non applicable : la continuité ne relève pas du RGPD",
    ],
    correctIndex: 2,
    explanation:
      "Sans pièce, pas de constat : « Non vérifié ». On n’accuse pas le DSI de mentir ; on dit qu’Arcadia ne peut pas s’appuyer dessus. C’est l’esprit de l’accountability (art. 5.2) : ce qui n’est pas documenté n’existe pas.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-art9",
    day: "J1",
    context:
      "Les bulletins traités par Novalia Paie intègrent les arrêts maladie des salariés des PME clientes.",
    prompt: "Comment le RGPD traite-t-il ces données ?",
    choices: [
      "Données ordinaires : un arrêt maladie n’est qu’une absence",
      "Catégorie particulière : interdite par principe, sauf exception listée",
      "Données de santé : seule une certification HDS en autorise le traitement",
      "Interdites sans exception : la paie doit ignorer les arrêts maladie",
    ],
    correctIndex: 1,
    explanation:
      "Une donnée de santé relève de l’art. 9 : traitement interdit par principe, sauf exception. Ici, les obligations du droit du travail (art. 9.2.b) le permettent. HDS concerne l’hébergement pour compte de tiers, pas la licéité du traitement.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-effacement",
    day: "J1",
    context:
      "Un usager de MaMairie+ écrit directement à Novalia : « Je veux la suppression de toutes mes données. »",
    prompt: "Que doit faire Novalia ?",
    choices: [
      "Supprimer immédiatement toutes ses données, sous un mois",
      "Refuser : seul un juge peut ordonner un effacement",
      "Ignorer la demande : l’usager n’est pas son client",
      "Transmettre à la commune et l’aider techniquement à répondre",
    ],
    correctIndex: 3,
    explanation:
      "La commune est responsable : c’est elle qui décide (l’état civil, par exemple, ne s’efface pas). Le sous-traitant ne répond pas à sa place, il l’outille (art. 28.3.e), puis exécute la décision.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-registre",
    day: "J1",
    context:
      "Pièce DR-01-E04 : registre des traitements de Novalia. 5 traitements, tous en qualité de responsable (personnel, paie interne, prospection, vidéosurveillance, badges). Dernière mise à jour : 2021.",
    prompt: "Quel est le manque le plus grave ?",
    choices: [
      "Le registre sous-traitant (art. 30.2) : paie clients, MaMairie+, santé",
      "La signature du registre par la CNIL",
      "Le registre devrait être publié sur le site de Novalia",
      "Rien : une PME de 312 salariés est dispensée de registre",
    ],
    correctIndex: 0,
    explanation:
      "Les activités qui font 100 % du chiffre d’affaires, traiter pour des clients, ne sont pas documentées. Le registre ST (30.2) est distinct du registre RT (30.1). Quatre ans sans mise à jour aggravent le constat.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-violation",
    day: "J1",
    context:
      "Un commercial de Novalia perd un ordinateur non chiffré contenant un export de paie d’une PME cliente : NIR et IBAN de ses salariés.",
    prompt: "Qui notifie la CNIL sous 72 h ?",
    choices: [
      "Novalia, puisque c’est elle qui a perdu l’ordinateur",
      "Le commercial, à titre personnel",
      "La PME, responsable ; Novalia l’a alertée sans délai",
      "Personne : la CNIL ne traite que les cyberattaques",
    ],
    correctIndex: 2,
    explanation:
      "Le sous-traitant notifie le responsable dans les meilleurs délais (art. 33.2). Le responsable notifie la CNIL sous 72 h (art. 33) et, vu le risque élevé, informe probablement les salariés (art. 34). Un disque chiffré aurait pu éviter cette dernière étape (34.3.a).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-dpo",
    day: "J1",
    context:
      "Pièce DR-01-E06 : en 2018, Mme Lemaire, directrice juridique, est désignée DPO « en complément de ses fonctions actuelles ». Elle négocie elle-même les contrats de sous-traitance art. 28.",
    prompt: "Quel est le point d’attention ?",
    choices: [
      "Aucun : un DPO interne peut cumuler toutes les fonctions",
      "Le DPO doit obligatoirement être un prestataire externe",
      "Une désignation antérieure au RGPD est nulle",
      "Un conflit d’intérêts : elle contrôlerait ses propres décisions",
    ],
    correctIndex: 3,
    explanation:
      "Le cumul est possible, à condition de ne pas contrôler des décisions qu’on prend soi-même (art. 38.6). Si elle fixe les engagements art. 28, elle ne peut pas ensuite les contrôler en tant que DPO. C’est à examiner en entretien, pas à condamner d’emblée.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-sanction",
    day: "J1",
    context:
      "Novalia réalise 46,8 M€ de CA. Le palier haut de l’art. 83 prévoit 20 M€ ou 4 % du CA mondial, le montant le plus élevé étant retenu.",
    prompt: "Quel est le plafond théorique pour Novalia sur ce palier ?",
    choices: [
      "≈ 1,9 M€, soit 4 % du CA",
      "20 M€",
      "≈ 0,94 M€, soit 2 % du CA",
      "Aucun : le plafond ne vaut que pour les groupes mondiaux",
    ],
    correctIndex: 1,
    explanation:
      "4 % de 46,8 M€ ≈ 1,9 M€, inférieur à 20 M€ : c’est le montant fixe qui sert de plafond. Pour Arcadia, la sanction n’est pourtant qu’une partie du risque : la perte des clients pèse plus lourd.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-nis2-ee",
    day: "J1",
    context:
      "NIS2 : Novalia compte 312 salariés et fait de l’infogérance, soit de la gestion de services TIC (B2B), secteur de l’annexe I.",
    prompt: "Quel profil NIS2 présente Novalia ?",
    choices: [
      "Entité essentielle : grande entreprise d’un secteur de l’annexe I",
      "Entité importante : les prestataires sont toujours EI",
      "Hors champ : seul le secteur santé de ses clients compte",
      "Opérateur désigné : NIS2 reprend la liste NIS1",
    ],
    correctIndex: 0,
    explanation:
      "312 salariés ≥ 250 : grande entreprise, le CA n’est même pas nécessaire. Services gérés : annexe I. Profil d’entité essentielle. C’est l’activité de Novalia qui la qualifie, pas le secteur de ses clients.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-ee-ei",
    day: "J1",
    context:
      "Arcadia demande ce qui changerait si Novalia n’avait que 200 salariés et devenait entité importante plutôt qu’essentielle.",
    prompt: "Quelle différence principale entre EE et EI ?",
    choices: [
      "Les EI n’ont aucune obligation de notification",
      "Les EI ne sont pas soumises à l’art. 21",
      "Mêmes obligations ; contrôle a priori pour les EE, a posteriori pour les EI",
      "Les EE notifient la CNIL, les EI l’ANSSI",
    ],
    correctIndex: 2,
    explanation:
      "Gouvernance (art. 20), mesures (art. 21) et notification (art. 23) sont les mêmes. L’intensité du contrôle change : audits possibles sans incident pour une EE, contrôle après incident ou signalement pour une EI. Amende max : 10 M€/2 % contre 7 M€/1,4 %.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-nis2-notif",
    day: "J1",
    context:
      "Lundi 8 h, un rançongiciel chiffre les serveurs de Santé Cloud : les 12 centres de santé n’ont plus accès aux dossiers patients.",
    prompt: "Quel calendrier NIS2 s’applique vers l’ANSSI ?",
    choices: [
      "72 h, en une seule notification",
      "24 h alerte précoce, 72 h notification, 1 mois rapport final",
      "1 h alerte, 24 h notification, 1 semaine rapport",
      "Aucun : seul le RGPD impose une notification",
    ],
    correctIndex: 1,
    explanation:
      "NIS2 (art. 23) prévoit trois étapes vers le CSIRT, l’ANSSI en France. En parallèle, côté RGPD, Novalia alerte les centres, qui notifient la CNIL sous 72 h. Un même incident, deux circuits.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-nis2-transposition",
    day: "J1",
    context:
      "Fin octobre 2026, la loi « Résilience » qui transpose NIS2 n’est toujours pas promulguée en France. Novalia a pourtant le profil d’une entité essentielle.",
    prompt: "Comment le cabinet traite-t-il NIS2 dans son avis ?",
    choices: [
      "On l’ignore : sans loi, aucun risque pour l’acheteur",
      "Non conforme : l’échéance d’octobre 2024 est dépassée",
      "Conforme par défaut tant que la loi n’existe pas",
      "À vérifier : pas opposable aujourd’hui, mais un coût futur à chiffrer",
    ],
    correctIndex: 3,
    explanation:
      "Une directive non transposée ne crée pas, en principe, d’obligation directe pour une entreprise privée. Mais la mise en conformité est quasi certaine après le rachat : elle entre dans le prix. Et on date ses constats, car la réglementation bouge pendant la due diligence.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-homologation",
    day: "J1",
    context:
      "La commune de Sainte-Aure doit homologuer MaMairie+ au titre du RGS avant sa mise en service.",
    prompt: "Qu’est-ce que l’homologation ?",
    choices: [
      "La décision de l’autorité qui accepte formellement les risques résiduels",
      "Un certificat délivré par l’ANSSI à Novalia",
      "Le tampon d’un organisme certificateur accrédité COFRAC",
      "Une déclaration du système à la CNIL",
    ],
    correctIndex: 0,
    explanation:
      "L’homologation est une acceptation de risque signée par l’autorité, ici la commune, après analyse de risque, mesures et tests. Elle se réexamine périodiquement. Novalia fournit le dossier ; la décision ne lui appartient pas.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-iso-perimetre",
    day: "J1",
    context:
      "Question d’ouverture : « Novalia héberge vos données dans un datacenter certifié ISO 27001. » La réponse tenait en un mot.",
    prompt: "Que prouve un certificat ISO 27001 ?",
    choices: [
      "La conformité de l’entreprise au RGPD",
      "Une exemption des obligations NIS2",
      "Un SMSI audité sur un périmètre donné, ni plus ni moins",
      "Une équivalence automatique avec HDS",
    ],
    correctIndex: 2,
    explanation:
      "ISO 27001 certifie un système de management de la sécurité sur un périmètre choisi par l’organisme. Le réflexe : demander le certificat et son périmètre (scope statement).",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-plaquette",
    day: "J1",
    context:
      "Pièce DR-01-E05, plaquette « Santé Cloud » : « Hébergement souverain dans le datacenter DataSeine, certifié ISO 27001 et HDS. Sécurité de niveau bancaire. »",
    prompt: "Qui cette plaquette prouve-t-elle certifié ?",
    choices: [
      "Novalia et DataSeine, conjointement",
      "Novalia seule, puisque c’est sa plaquette",
      "Personne : un document marketing n’a aucune valeur",
      "DataSeine, sur son périmètre ; rien ne le prouve pour Novalia",
    ],
    correctIndex: 3,
    explanation:
      "Le certificat couvre le périmètre de DataSeine, pas l’infogérance de Novalia. « Souverain » et « niveau bancaire » sont des formules commerciales sans référentiel. Pièce à demander : le certificat de Novalia et son périmètre.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-soa",
    day: "J1",
    context:
      "Dans la SoA de Novalia, la mesure 8.13 « Sauvegarde » est exclue avec la justification « pas prioritaire ». Novalia sauvegarde pourtant des dossiers patients.",
    prompt: "Comment lire cette exclusion ?",
    choices: [
      "Acceptable : chaque organisme choisit librement ses mesures",
      "Signal d’alarme : une exclusion doit découler du traitement des risques",
      "Sans importance : la SoA n’est pas exigée par ISO 27001",
      "Acceptable si le datacenter fait lui-même des sauvegardes",
    ],
    correctIndex: 1,
    explanation:
      "La SoA (clause 6.1.3) liste chaque mesure de l’annexe A, dit si elle est retenue, pourquoi, et si elle est mise en œuvre. Une exclusion se justifie par l’analyse de risque, pas par une préférence. Exclure la sauvegarde de données de santé ne tient pas.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-27002-version",
    day: "J1",
    context:
      "Un rapport interne de Novalia cite la mesure « A.12.3.1 Sauvegarde » et parle de 114 mesures.",
    prompt: "Que révèle cette référence ?",
    choices: [
      "Une numérotation 2013 : en 2022, la sauvegarde est la mesure 8.13",
      "Une numérotation 2022 parfaitement à jour",
      "Une mesure propre à la certification HDS",
      "Une référence à l’article 12 du RGPD",
    ],
    correctIndex: 0,
    explanation:
      "ISO 27002:2022 compte 93 mesures en 4 thèmes (5 organisationnelles, 6 humaines, 7 physiques, 8 technologiques). « A.12.3.1 » vient de 2013 : document jamais mis à jour. Citer une mesure, c’est citer sa version.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-hds",
    day: "J1",
    context:
      "Verdict n° 3 : « Le datacenter DataSeine est certifié HDS, donc Novalia Santé Cloud est en règle. » Novalia installe les serveurs, gère les VM, applique les correctifs et fait les sauvegardes.",
    prompt: "Quel certificat Novalia doit-elle détenir ?",
    choices: [
      "Aucun : celui de DataSeine couvre toute la chaîne",
      "Un certificat d’hébergeur d’infrastructure physique",
      "Son propre certificat d’hébergeur infogéreur",
      "Une qualification RGS de niveau ***",
    ],
    correctIndex: 2,
    explanation:
      "DataSeine fournit locaux, électricité et baies : infrastructure physique. Administrer, exploiter et sauvegarder relève de l’hébergeur infogéreur (art. L.1111-8 CSP). Sans pièce : non vérifié, risque majeur sur 30 % du CA.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-pgssi-s",
    day: "J1",
    context:
      "La convention Réseau Santé Ouest (DR-01-E03) impose à Novalia d’appliquer les référentiels de la PGSSI-S.",
    prompt: "Qui publie la PGSSI-S ?",
    choices: [
      "L’ANSSI",
      "La CNIL",
      "L’ISO",
      "L’Agence du numérique en santé (ANS)",
    ],
    correctIndex: 3,
    explanation:
      "La PGSSI-S est un corpus de référentiels de l’ANS, sous tutelle du ministère de la Santé. Beaucoup de supports l’attribuent à tort à l’ANSSI.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-iso-loi",
    day: "J1",
    context:
      "Le dirigeant de Novalia argumente : « Si on obtient ISO 27001, on sera de fait conformes à la loi. »",
    prompt: "Pourquoi l’argument ne tient-il pas ?",
    choices: [
      "ISO 27001 interdit d’inclure des données personnelles dans le périmètre",
      "La mesure 5.31 demande d’identifier les exigences légales, pas de prouver leur respect",
      "Une norme internationale ne s’applique pas en France",
      "L’auditeur de certification est mandaté par la CNIL",
    ],
    correctIndex: 1,
    explanation:
      "Le périmètre est choisi par l’organisme et l’auditeur n’est ni la CNIL ni l’ANSSI. La norme dit comment s’organiser, la loi dit ce qui est obligatoire. ISO 27001 reste un excellent levier pour l’accountability, NIS2 art. 21 et HDS.",
    timeLimitMs: TIME_LIMIT_MS,
  },
  {
    id: "novalia-up1-pci-dss",
    day: "J1",
    context:
      "Matrice d’applicabilité : Novalia Paie verse les salaires par virement et manipule des IBAN. Aucun paiement par carte n’apparaît dans le dossier.",
    prompt: "Que met-on en face de PCI DSS ?",
    choices: [
      "Non, justifié : un IBAN n’est pas une donnée de carte",
      "Oui : toute donnée bancaire relève de PCI DSS",
      "Indirect : les banques des PME l’imposent par contrat",
      "Ligne laissée vide : un « Non » n’a pas à être justifié",
    ],
    correctIndex: 0,
    explanation:
      "PCI DSS vise qui stocke, traite ou transmet des données de carte. Un IBAN est une donnée personnelle, pas une donnée de carte. Et un « Non » se justifie autant qu’un « Oui », par un fait du dossier (E01).",
    timeLimitMs: TIME_LIMIT_MS,
  },
]
