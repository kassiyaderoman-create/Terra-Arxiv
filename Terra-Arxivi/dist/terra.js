const entries = {
  rhodes: [
    "Rhodes Island",
    "Oripathy bo‘yicha tadqiqot qiladigan va kasallanganlarga yordam beradigan farmatsevtika tashkiloti.",
    "Harakatlanuvchi baza",
    "Tashkilotning nomi uning ko‘chma kemasiga ham tegishli. Amiya Rhodes Island’ni boshqaradi. Doktor esa Operatorlar ishtirokidagi operatsiyalarni muvofiqlashtiradi.",
    "Hikoya boshida Amiya boshchiligidagi guruh Doktorni Chernobogdagi sarkofagdan olib chiqadi.",
    "Rhodes_Island",
  ],
  reunion: [
    "Reunion",
    "Oripathy bilan kasallanganlar duch keladigan ta’qib va kamsitishga qarshi chiqqan harakat.",
    "Harakatning maqsadi",
    "Reunion kasallanganlarning huquqlari uchun kurashadi. Uning ayrim bo‘linmalari zo‘ravon usullarga murojaat qiladi. Chernobogdagi hujum hikoyaning boshidagi asosiy to‘qnashuvni boshlab beradi.",
    "FrostNova Reunion safidagi Yeti otryadiga boshchilik qiladi va Lungmen voqealarida Rhodes Island bilan to‘qnashadi.",
    "Reunion",
  ],
  lungmen: [
    "Lungmen",
    "Terra olamidagi yirik ko‘chma shahar va savdo markazi.",
    "Lungmen Guard Department",
    "Shahar xavfsizligini Lungmen Guard Department ta’minlaydi. Ch’en va Hoshiguma shu tashkilot orqali asosiy hikoyaga kirib keladi.",
    "Reunion hujumi vaqtida Rhodes Island va Lungmen hamkorlik qiladi, ammo kasallanganlarga nisbatan muomala bu ittifoqni taranglashtiradi.",
    "Lungmen",
  ],
  ursus: [
    "Ursus",
    "Chernobog joylashgan yirik imperiya.",
    "Chernobog inqirozi",
    "Imperiyada kasallanganlar qattiq ta’qib qilinadi. Ursusdagi bu sharoit Reunion harakatining shakllanishida muhim o‘rin tutadi.",
    "Hikoyaning keyingi bosqichida Chernobogning yadro shahri Lungmen tomonga yo‘naltiriladi va ikki tomon o‘rtasida siyosiy inqiroz xavfi kuchayadi.",
    "Ursus",
  ],
};
Object.assign(entries, {
  kazimierz: [
    "Kazimierz",
    "Ritsarlik an’analari bilan tanilgan Terra mamlakati.",
    "Arena va ritsarlar",
    "Kazimierz Major musobaqasida ritsarlar maydonda bellashadi. Jamoalar, tomoshabinlar va homiylar musobaqani yirik sanoatga aylantirgan.",
    "Nearl oilasining a’zolari ritsarlik va musobaqa bosimi bilan turlicha yo‘l tutadi. Maria Nearl voqealari shu muhitda rivojlanadi.",
    "Kazimierz",
  ],
  siracusa: [
    "Siracusa",
    "Shaharlar va oilalar ta’siri kuchli bo‘lgan Terra mamlakati.",
    "Oilalar ta’siri",
    "Siracusa siyosati va kundalik hayotida famiglie deb ataladigan oilalar muhim o‘rin egallaydi. Lappland va Texas hikoyalari bu mamlakat bilan chambarchas bog‘liq.",
    "Il Siracusano voqealari Texasning Siracusaga qaytishi bilan avvalgi aloqalarini yana yuzaga chiqaradi.",
    "Siracusa",
  ],
  columbia: [
    "Columbia",
    "Terra olamida sanoat va texnologiya rivojlangan mamlakat.",
    "Rhine Lab",
    "Rhine Lab Columbiada joylashgan tadqiqot tashkiloti. Saria va Silence dosyelari orqali laboratoriyaning ayrim yo‘nalishlari va ular atrofidagi munosabatlarni ko‘rish mumkin.",
    "Rhine Lab haqidagi voqealarda tadqiqot natijalari va tajribalarda qatnashgan insonlarning taqdiri bir-biriga bog‘lanadi.",
    "Columbia",
  ],
});
const art = {
  rhodes: "002_amiya",
  reunion: "113_cqbw",
  lungmen: "136_hsguma",
  ursus: "172_svrash",
  kazimierz: "148_nearl",
  siracusa: "140_whitew",
  columbia: "202_demkni",
};
const requested = new URLSearchParams(location.search).get("entry");
const key = Object.hasOwn(entries, requested) ? requested : "rhodes";
const [name, summary, heading, body, spoiler, source] = entries[key];
const illustration = document.querySelector("#entry-illustration");
illustration.src =
  key === "ursus"
    ? "editorial/terra-city.webp"
    : "operators/" + art[key] + ".webp";
document.title = name + " / Terra ensiklopediyasi";
for (const [field, value] of Object.entries({
  name,
  summary,
  heading,
  body,
  spoiler,
})) {
  document.querySelector("#entry-" + field).textContent = value;
}
document.querySelector("#entry-source").href =
  "https://arknights.wiki.gg/wiki/" + source;
document.querySelector("#entry-links").innerHTML = Object.entries(entries)
  .filter(([slug]) => slug !== key)
  .map(([slug, [label]]) => `<a href="?entry=${slug}">${label}</a>`)
  .join("");
