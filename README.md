# GO/NO-GO

Quiz live type Kahoot pour le recap React + TypeScript Bachelor 2 (jours 1 à 5). Une question, quatre réponses, sessions avec callsign.

## Local

```bash
npm install
npm run dev
```

- Formateur : [http://localhost:3000/host](http://localhost:3000/host)
- Étudiants : [http://localhost:3000](http://localhost:3000) + code à 6 chiffres + callsign

En local, les sessions vivent en mémoire (un process `next dev`). Ça suffit pour tester.

## Vercel (salle de classe)

1. Pousser le repo sur GitHub, l’importer dans [Vercel](https://vercel.com/new).
2. Dans le projet Vercel : **Storage → Create Database → Upstash Redis** (gratuit). Relier le projet : ça injecte `KV_REST_API_URL` / `KV_REST_API_TOKEN` (ou les variables Upstash).
3. Redeploy. Sans Redis, chaque instance serverless perd les sessions : les étudiants verront « Lien sol introuvable ».

Puis ouvrir `/host` sur le projecteur, les téléphones scannent le QR.
