import { archiveByName, operators } from "./operator-model.mjs";

function searchKey(value) {
  return value.toLowerCase().replace(/['’‘]/g, "");
}
export function findOperators({
  search = "",
  roleFilter,
  starsFilter,
  factionFilter,
  serverFilter,
  onlySaved = false,
  saved = new Set(),
} = {}) {
  const query = searchKey(search.trim());
  const matches = operators.filter(
    ([name, role, stars, faction]) =>
      searchKey(
        [
          name,
          role,
          faction,
          archiveByName.get(name)?.[13],
          archiveByName.get(name)?.[15],
        ].join(" "),
      ).includes(query) &&
      (!roleFilter || roleFilter === role) &&
      (!starsFilter || Number(starsFilter) === stars) &&
      (!factionFilter || factionFilter === faction) &&
      (!serverFilter || archiveByName.get(name)?.[5] === serverFilter) &&
      (!onlySaved || saved.has(name)),
  );
  return matches;
}
