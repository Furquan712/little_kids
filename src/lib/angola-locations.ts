export type Province = {
  name: string;
  cities: string[];
};

export const ANGOLA_PROVINCES: Province[] = [
  { name: "Bengo", cities: ["Caxito", "Dande", "Ambriz", "Nzeto"] },
  { name: "Benguela", cities: ["Benguela", "Lobito", "Catumbela", "Baía Farta"] },
  { name: "Bié", cities: ["Kuito", "Andulo", "Camacupa", "Catabola"] },
  { name: "Cabinda", cities: ["Cabinda", "Cacongo", "Buco-Zau", "Belize"] },
  { name: "Cuando Cubango", cities: ["Menongue", "Cuito Cuanavale", "Rivungo"] },
  { name: "Cuanza Norte", cities: ["N'dalatando", "Golungo Alto", "Lucala"] },
  { name: "Cuanza Sul", cities: ["Sumbe", "Porto Amboim", "Waku Kungo", "Gabela"] },
  { name: "Cunene", cities: ["Ondjiva", "Cuvelai", "Namacunde"] },
  { name: "Huambo", cities: ["Huambo", "Caála", "Bailundo", "Longonjo"] },
  { name: "Huíla", cities: ["Lubango", "Matala", "Chibia", "Humpata"] },
  { name: "Luanda", cities: ["Luanda", "Cacuaco", "Viana", "Belas", "Cazenga", "Talatona"] },
  { name: "Lunda Norte", cities: ["Dundo", "Cambulo", "Chitato"] },
  { name: "Lunda Sul", cities: ["Saurimo", "Cacolo", "Dala"] },
  { name: "Malanje", cities: ["Malanje", "Cacuso", "Calandula"] },
  { name: "Moxico", cities: ["Luena", "Cazombo", "Léua"] },
  { name: "Namibe", cities: ["Moçâmedes", "Tômbwa", "Bibala"] },
  { name: "Uíge", cities: ["Uíge", "Negage", "Songo"] },
  { name: "Zaire", cities: ["M'banza-Kongo", "Soyo", "N'zeto"] },
];

export const PROVINCE_NAMES = ANGOLA_PROVINCES.map((p) => p.name) as [string, ...string[]];

export function citiesForProvince(province: string): string[] {
  return ANGOLA_PROVINCES.find((p) => p.name === province)?.cities ?? [];
}
