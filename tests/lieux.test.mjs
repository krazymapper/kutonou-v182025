import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data/lieux.json', import.meta.url), 'utf8'));
const L = data.lieux;

test('métadonnées de source présentes', () => {
  assert.match(data.source, /Wikidata/);
  assert.match(data.checked_on, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(L.length >= 30, `seulement ${L.length} lieux`);
});

test('chaque lieu a un identifiant Wikidata unique et une source', () => {
  const ids = new Set();
  for (const l of L) {
    assert.match(l.id, /^Q\d+$/);
    assert.ok(!ids.has(l.id), `doublon ${l.id}`);
    ids.add(l.id);
    assert.equal(l.source_url, `https://www.wikidata.org/wiki/${l.id}`);
    assert.ok(l.nom && l.ville && l.type, l.id);
  }
});

test('coordonnées dans l’emprise du Bénin et sans doublon (l’ancien jeu en avait 27/30)', () => {
  const seen = new Set();
  for (const l of L) {
    assert.ok(l.latitude >= 6.1 && l.latitude <= 12.5 && l.longitude >= 0.7 && l.longitude <= 3.9, `${l.id} hors Bénin`);
    const k = `${l.latitude},${l.longitude}`;
    assert.ok(!seen.has(k), `coordonnées dupliquées ${k}`);
    seen.add(k);
  }
});

test('photos : uniquement des fichiers Commons via Special:FilePath', () => {
  for (const l of L.filter((x) => x.photo_url)) {
    assert.match(l.photo_url, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/[^/]+\?width=800$/, l.id);
  }
});

test('catégories connues', () => {
  const ok = new Set(['Musée', 'Religion', 'Nature', 'Histoire', 'Culture', 'Loisirs']);
  for (const l of L) assert.ok(ok.has(l.type), `${l.id} : ${l.type}`);
});
