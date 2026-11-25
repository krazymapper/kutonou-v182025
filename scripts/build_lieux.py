#!/usr/bin/env python3
"""Génère src/data/lieux.json depuis Wikidata (CC0) — reproductible.

Usage : python3 scripts/build_lieux.py [--from-file reponse.json]
Chaque lieu garde son identifiant Wikidata (source), ses coordonnées Wikidata
et, si elle existe, l'image Commons officielle de l'élément (P18).
"""
import argparse
import datetime as dt
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
QUERY = (ROOT / "scripts" / "lieux.rq").read_text(encoding="utf-8")
OUT = ROOT / "src" / "data" / "lieux.json"
UA = "Kutonu-data-build/1.0 (https://github.com/krazymapper/kutonou-v182025)"

# Emprise du Bénin (approximative, sert à écarter les éléments transfrontaliers
# dont la coordonnée tombe hors du pays).
BBOX = {"lat": (6.1, 12.5), "lon": (0.7, 3.9)}

# Éléments écartés : non visitables comme un lieu ponctuel ou doublons.
EXCLURE_TYPES = {"fleuve ou rivière", "fonds d'archives", "ensemble d'aires protégées",
                 "ville", "commune du Bénin", "groupe de constructions et de bâtiments"}
EXCLURE_QIDS = {
    "Q726863",  # parc national du W (transfrontalier) : doublon de Q64188731
    "Q508040",  # Koutammakou : point Wikidata situé au Togo (Kéran)
}

CATEGORIES = [  # premier motif trouvé (types Wikidata + nom) → catégorie affichée
    ("Nature", r"jardin|forêt"),
    ("Musée", r"musée"),
    ("Religion", r"cathédrale|église|basilique"),
    ("Nature", r"parc national|aire protégée|réserve|lagune|lac|zone humide|jardin|forêt"),
    ("Histoire", r"palais|forteresse|archéologique|stèle|navire|monument"),
    ("Loisirs", r"zoologique|parc"),
    ("Culture", r"."),
]


def run_query():
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": QUERY})
    req = urllib.request.Request(url, headers={"Accept": "application/sparql-results+json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def categorie(types, nom=""):
    joined = (" ".join(sorted(types)) + " " + nom).lower()
    for nom, motif in CATEGORIES:
        if re.search(motif, joined):
            return nom
    return "Culture"


def parse_point(wkt):
    m = re.match(r"Point\(([-\d.]+) ([-\d.]+)\)", wkt)
    return (float(m.group(2)), float(m.group(1))) if m else None


def build(data):
    items = {}
    for b in data["results"]["bindings"]:
        qid = b["item"]["value"].rsplit("/", 1)[1]
        it = items.setdefault(qid, {"qid": qid, "nom": b["itemLabel"]["value"],
                                    "description": b.get("itemDescription", {}).get("value", ""),
                                    "coord": b["coord"]["value"], "image": b.get("image", {}).get("value"),
                                    "types": set(), "lieux": set(), "wikipedia": b.get("article", {}).get("value")})
        if "typeLabel" in b:
            it["types"].add(b["typeLabel"]["value"])
        if "lieuLabel" in b:
            it["lieux"].add(b["lieuLabel"]["value"])

    lieux = []
    for it in items.values():
        pt = parse_point(it["coord"])
        if not pt or it["qid"] in EXCLURE_QIDS or re.fullmatch(r"Q\d+", it["nom"]):
            continue
        lat, lon = pt
        if not (BBOX["lat"][0] <= lat <= BBOX["lat"][1] and BBOX["lon"][0] <= lon <= BBOX["lon"][1]):
            continue
        if it["types"] & EXCLURE_TYPES and categorie(it["types"]) not in ("Musée", "Histoire"):
            continue
        villes = sorted(v for v in it["lieux"] if not v.startswith(("Département", "Région", "Commune d")))
        photo = None
        if it["image"]:
            fichier = urllib.parse.unquote(it["image"].rsplit("/", 1)[1])
            photo = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(fichier) + "?width=800"
        lieux.append({
            "id": it["qid"],
            "nom": it["nom"][:1].upper() + it["nom"][1:],
            "description": it["description"],
            "ville": villes[0] if villes else (sorted(it["lieux"])[0] if it["lieux"] else "Non renseignée"),
            "type": categorie(it["types"], it["nom"]),
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "photo_url": photo,
            "wikipedia_url": it["wikipedia"],
            "source_url": f"https://www.wikidata.org/wiki/{it['qid']}",
        })
    lieux.sort(key=lambda l: (l["ville"], l["nom"]))
    return {
        "source": "Wikidata (CC0) — https://query.wikidata.org",
        "licence_images": "Wikimedia Commons, licence propre à chaque fichier (voir la page du fichier)",
        "checked_on": dt.date.today().isoformat(),
        "lieux": lieux,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from-file", help="réponse SPARQL JSON déjà téléchargée")
    a = ap.parse_args()
    data = json.loads(pathlib.Path(a.from_file).read_text()) if a.from_file else run_query()
    out = build(data)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(out['lieux'])} lieux écrits dans {OUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
