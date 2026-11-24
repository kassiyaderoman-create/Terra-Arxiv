#!/usr/bin/env python3
"""Build the static Operator catalogue from two Arknights character tables."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import io
import json
from pathlib import Path
import re
import tempfile
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
DATA = DIST / "js" / "operator-data.mjs"
PORTRAITS = DIST / "portraits"
ROLES = dict(
    PIONEER="Vanguard", WARRIOR="Guard", TANK="Defender", SNIPER="Sniper",
    CASTER="Caster", MEDIC="Medic", SUPPORT="Supporter", SPECIAL="Specialist",
)
FACTIONS = {
    "rhodes": "Rhodes Island", "rhine": "Rhine Lab", "penguin": "Penguin Logistics",
    "lgd": "Lungmen Guard Department", "karlan": "Karlan Trade", "sweep": "S.W.E.E.P.",
    "action4": "Reserve Op Team A4", "action6": "Reserve Op Team A6", "action1": "Op Team A1",
}
ARTWORK = "https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/skin/"


def read_table(path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_previous():
    archive = DATA.read_text(encoding="utf-8").split("=", 1)[1].strip().removesuffix(";")
    return {row[0]: row for row in json.loads(archive)}


def build_rows(global_table, cn_table, previous):
    rows = []
    names = set()
    for key in dict.fromkeys([*global_table, *cn_table]):
        record = global_table.get(key) or cn_table[key]
        role = ROLES.get(record.get("profession"))
        if not key.startswith("char_") or not role or record.get("isNotObtainable"):
            continue
        if not re.fullmatch(r"char_[a-zA-Z0-9_]+", key):
            raise ValueError(f"Invalid Operator ID: {key}")
        name = record.get("name")
        if key not in global_table and record.get("appellation") not in (None, "", "-", "—"):
            name = record["appellation"]
        if not name or name in names:
            raise ValueError(f"Missing or duplicate Operator name for {key}: {name}")
        names.add(name)
        rarity = record["rarity"]
        stars = rarity + 1 if isinstance(rarity, int) else int(rarity.rsplit("_", 1)[-1])
        faction = record.get("teamId") or record.get("groupId") or record.get("nationId")
        label = FACTIONS.get(faction, faction.replace("_", " ").title() if faction else "Fraksiya ko‘rsatilmagan")
        phases = record.get("phases") or []
        frames = (phases[0].get("attributesKeyFrames") or []) if phases else []
        stats = frames[0].get("data", {}) if frames else {}
        old = previous.get(key)
        rows.append([
            key, name, role, stars, label, "Global" if key in global_table else "CN",
            *(stats.get(field) for field in ("cost", "blockCnt", "maxHp", "atk", "def")),
            record.get("subProfessionId"), record.get("position"), record.get("displayNumber"),
            old[14] if old and len(old) > 14 else [], cn_table.get(key, {}).get("name"),
        ])
    if not rows:
        raise ValueError("Both tables produced an empty catalogue.")
    return rows


def prepare_portrait(key, staging, artwork_dir, download):
    if (PORTRAITS / f"{key}.webp").is_file():
        return
    source = None
    if artwork_dir:
        source = next((file for file in (
            artwork_dir / f"{key}.webp", artwork_dir / f"{key}_1b.png",
        ) if file.is_file()), None)
    if source is None and not download:
        raise FileNotFoundError(f"Portrait missing for {key}. Use --art-dir or --download.")
    from PIL import Image
    if source is None:
        with urlopen(ARTWORK + key + "_1b.png", timeout=30) as response:
            source = io.BytesIO(response.read())
    with Image.open(source) as original:
        image = original.convert("RGBA")
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"Empty portrait for {key}.")
    image = image.crop(bounds)
    if max(image.size) < 500:
        raise ValueError(f"Portrait for {key} must be at least 500 pixels along one side.")
    image.thumbnail((768, 768), Image.Resampling.LANCZOS)
    image.save(staging / f"{key}.webp", "WEBP", quality=86)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--global", dest="global_path", type=Path, required=True)
    parser.add_argument("--cn", type=Path, required=True)
    parser.add_argument("--art-dir", type=Path)
    parser.add_argument("--download", action="store_true", help="Download missing full-body artwork.")
    parser.add_argument("--check", action="store_true", help="Validate without changing site files.")
    args = parser.parse_args()
    rows = build_rows(read_table(args.global_path), read_table(args.cn), read_previous())
    with tempfile.TemporaryDirectory(dir=DIST) as folder:
        staging = Path(folder)
        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(lambda row: prepare_portrait(row[0], staging, args.art_dir, args.download), rows))
        if not args.check:
            staged_data = staging / DATA.name
            payload = ",\n".join("  " + json.dumps(row, ensure_ascii=False) for row in rows)
            staged_data.write_text(
                "// Generated by scripts/import-operators.py.\n"
                f"export const operatorArchive = [\n{payload}\n];\n",
                encoding="utf-8",
            )
            for artwork in staging.glob("*.webp"):
                artwork.replace(PORTRAITS / artwork.name)
            staged_data.replace(DATA)
    print(f"{len(rows)} operators validated" + (" (check only)" if args.check else " and imported"))


if __name__ == "__main__":
    main()
