# GO/NO-GO

Quiz live type Kahoot pour les révisions Bachelor 2. Une question, quatre réponses, sessions avec callsign.

Trois briefs sont disponibles dans la console formateur :

- **ODYSSEY-01** : React + TypeScript, jours 1 et 5.
- **Dock Control** : Python + FastAPI, jours 1 à 5.
- **Le Cabinet du Quai** : exactement 20 questions SQL sur les objets programmables (fonctions, PL/pgSQL, procédures et triggers), basées sur la [première partie du cours](https://le-cabinet-du-quai-slides.vercel.app/objets/).

Après chaque question, le verdict et le corrigé restent affichés pendant **10 secondes**. La question suivante démarre automatiquement ; après la dernière, le podium s’affiche. Le formateur peut avancer immédiatement, mettre la correction en pause et la reprendre. Les horloges sont synchronisées par le serveur ; les transitions sont persistées dès qu’un joueur ou le formateur consulte la session.

Chaque joueur reçoit une grande réaction visuelle au verdict pendant au maximum 3 secondes, avec un bouton pour voir directement le corrigé. Les bonnes réponses consécutives alimentent une série : braises à 2, flammes à 3, feu renforcé à 5 et intensité maximale à 8. Une erreur ou une absence de réponse coupe la série. La meilleure série apparaît sur l’écran final. Le score ne reçoit pas de bonus de série.

## Local

```bash
npm install
npm run dev
```

Créez un `.env.local` (non commité) avec le mot de passe formateur :

```
HOST_PASSWORD=un-secret-de-seance
# Facultatif : clé API navigateur du fournisseur GIPHY
NEXT_PUBLIC_GIPHY_API_KEY=votre-cle-api-giphy
```

Sans `HOST_PASSWORD`, `/host` reste verrouillé.

Sans clé GIPHY, les réactions utilisent les animations locales : le jeu reste entièrement fonctionnel. Avec une clé, chaque verdict cherche un GIF correspondant à la réussite, l’erreur ou l’absence de réponse. Les appels et les médias viennent directement de GIPHY, avec un filtre `rating=g` et l’attribution « Powered by GIPHY », conformément aux [consignes du fournisseur](https://developers.giphy.com/docs/api/best-practices/). La clé `NEXT_PUBLIC_GIPHY_API_KEY` est une clé publique destinée au navigateur ; n’utilisez pas un secret privé dans cette variable. Les GIF ne sont pas téléchargés ni stockés par l’application.

Les réactions s’arrêtent lorsque l’onglet est masqué. Le réglage système de réduction des mouvements remplace les GIF animés et les effets en mouvement par un verdict statique. Aucun son ne joue automatiquement.

- Formateur : [http://localhost:3000/host](http://localhost:3000/host) puis le mot de passe
- Étudiants : [http://localhost:3000](http://localhost:3000) + code à 6 chiffres + callsign

En local, les sessions vivent en mémoire (un process `next dev`). Ça suffit pour tester.

## Vercel (salle de classe)

1. Pousser le repo sur GitHub, l’importer dans [Vercel](https://vercel.com/new).
2. Dans le projet Vercel : **Storage → Create Database → Upstash Redis** (gratuit). Relier le projet : ça injecte `KV_REST_API_URL` / `KV_REST_API_TOKEN` (ou les variables Upstash).
3. **Settings → Environment Variables** : ajouter `HOST_PASSWORD` (Production et Preview). Ce n’est pas une variable `NEXT_PUBLIC_`.
4. Facultatif : ajouter `NEXT_PUBLIC_GIPHY_API_KEY` (Production et Preview) avant le build pour les GIF.
5. Redeploy. Sans Redis, chaque instance serverless perd les sessions : les étudiants verront « Lien sol introuvable ». Sans `HOST_PASSWORD`, la console formateur affiche que le mot de passe n’est pas configuré.

Puis ouvrir `/host` sur le projecteur, entrer le mot de passe, les téléphones scannent le QR.

## Vérifications

```bash
npm test
npm run lint
npm run build
```
