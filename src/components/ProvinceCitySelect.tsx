"use client";

import { ANGOLA_PROVINCES, citiesForProvince } from "@/lib/angola-locations";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ProvinceCitySelect({
  province,
  city,
  onProvinceChange,
  onCityChange,
  provinceLabel,
  cityLabel,
  selectProvincePlaceholder,
  selectCityPlaceholder,
}: {
  province: string;
  city: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  provinceLabel: string;
  cityLabel: string;
  selectProvincePlaceholder: string;
  selectCityPlaceholder: string;
}) {
  const cities = citiesForProvince(province);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label>{provinceLabel}</Label>
        <Select
          value={province}
          onValueChange={(value) => {
            onProvinceChange(value);
            onCityChange("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectProvincePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {ANGOLA_PROVINCES.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{cityLabel}</Label>
        <Select value={city} onValueChange={onCityChange} disabled={!province}>
          <SelectTrigger>
            <SelectValue placeholder={selectCityPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
