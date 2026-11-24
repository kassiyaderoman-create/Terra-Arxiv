# Terra arxivi

Sayt oddiy HTML, CSS va JavaScript modullaridan tuzilgan. Ishlab chiqish uchun VS Code’da loyiha papkasini oching.

```sh
npm ci
npm test
python3 -m http.server 8080 --directory dist
```

Saytni `http://localhost:8080` orqali oching. JavaScript modullari HTTP orqali yuklanadi.

## Kod tuzilishi

| Fayl | Vazifasi |
| --- | --- |
| `dist/index.html`, `dist/terra.html` | Bosh sahifa va Terra maqola sahifasi |
| `dist/js/main.mjs` | Bosh sahifa modullarini yuklash |
| `dist/js/catalog.mjs`, `catalog-filter.mjs` | Qidiruv, filtrlar, sahifalash va sevimlilar |
| `dist/js/operator-model.mjs`, `dossier.mjs` | Operator kartochkasi ma’lumotlari va dosye |
| `dist/js/guide.mjs`, `atlas.mjs`, `dist/terra.js` | Qo‘llanma, atlas va maqolalar |
| `dist/js/anime.mjs`, `battle.mjs`, `team.mjs` | Tomosha kuzatuvchisi, mashq va jamoa |
| `dist/css/` | Asosiy uslublar, bo‘limlar va jamoa tuzuvchi |
| `tests/site.test.mjs` | Sahifa funksiyalarining avtomatik tekshiruvlari |

`npm run format` HTML, JS va CSS fayllarini bir xil uslubga keltiradi.

## Operator katalogini yangilash

1. [Global](https://github.com/ArknightsAssets/ArknightsGamedata/tree/master/en/gamedata/excel) va [CN](https://github.com/Kengxxiao/ArknightsGameData/tree/master/zh_CN/gamedata/excel) manbalaridan `character_table.json` fayllarini mos ravishda `global.json` va `cn.json` sifatida yuklab oling.
2. Yangi illyustratsiyalar uchun `python3 -m pip install Pillow` buyrug‘i bilan Pillow o‘rnating. Mahalliy fayllarni `--art-dir` orqali ko‘rsatish yoki `--download` orqali [to‘liq Operator illyustratsiyalarini](https://github.com/yuanyan3060/Arknights-Bot-Resource/tree/main/skin) yuklatish mumkin. Mahalliy fayl nomi `char_ID.webp` yoki `char_ID_1b.png` ko‘rinishida bo‘lsin.
3. Avval tekshirib ko‘ring, keyin import qiling.

```sh
python3 scripts/import-operators.py --global global.json --cn cn.json --download --check
python3 scripts/import-operators.py --global global.json --cn cn.json --download
npm test
```

Importchi server bo‘yicha yozuvlarni birlashtiradi, Operator ID bo‘yicha mavjud biografik maydonlarni saqlaydi va yetishmayotgan rasmlarni WebP formatiga o‘tkazadi. Barcha rasmlar tayyor bo‘lgach, `dist/js/operator-data.mjs` yangilanadi. Importdan keyin diffni tekshiring. Maxsus o‘zbekcha dosye tavsiflari `dist/js/operator-model.mjs` faylida tahrirlanadi.
