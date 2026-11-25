# Kutonu — lieux à visiter au Bénin

Carte interactive des musées, sites historiques, lieux de culte et espaces naturels du Bénin, avec filtres par commune et par catégorie, fiche détaillée et favoris.

## Données

Le jeu `src/data/lieux.json` est **généré depuis Wikidata** (licence CC0) par `scripts/build_lieux.py`. Chaque lieu porte :

- son identifiant Wikidata (`id`) et un lien vers la source (`source_url`) ;
- les coordonnées Wikidata ;
- la photo officielle de l'élément sur Wikimedia Commons (`P18`), quand elle existe. Chaque fichier a sa propre licence, visible sur sa page ;
- le lien vers l'article Wikipédia en français, s'il existe.

Mettre à jour le jeu (après une amélioration sur Wikidata) :

```bash
npm run data      # = python3 scripts/build_lieux.py
npm test          # contrôle d'intégrité du jeu
```

> **Pourquoi ?** L'ancien jeu (CSV/JSON) était inventé : 27 lieux sur 30 partageaient leurs coordonnées (15 lieux de Cotonou sur un même point), aucune des 30 URL de photo ne correspondait à un fichier Commons valide, et les chiffres des descriptions n'avaient pas de source.

**Pour enrichir la carte**, le levier est de compléter Wikidata (coordonnées `P625`, image `P18`, libellé français), puis de régénérer le jeu. Cela profite aussi à Wikipédia et à OpenStreetMap.

### Limites connues

- Quelques libellés sont en anglais : ils n'ont pas encore de libellé français sur Wikidata.
- « Saint Michel Church, Benin » (Q106947829) et « Église Saint Michel Gbeto de Cotonou » (Q66486504) pourraient être le même édifice. Le doublon est **non vérifié** et doit être tranché sur Wikidata.
- Les plages, marchés et restaurants sont peu présents sur Wikidata, donc absents d'ici.

## Base Supabase (facultative)

Si `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définis (voir `.env.example`), l'appli lit la table `lieux_touristiques`. Sinon, ou en cas d'échec, elle utilise le jeu intégré, qui fonctionne aussi hors ligne.

## Développement

```bash
npm ci
npm run dev
npm test && npm run lint && npm run build
```

Fonds de carte : © contributeurs OpenStreetMap.
