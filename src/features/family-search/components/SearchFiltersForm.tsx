"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ANGOLA_PROVINCES, citiesForProvince } from "@/lib/angola-locations";
import { AGE_GROUPS } from "@/features/nanny-profile/schemas";
import { NANNY_LANGUAGES } from "@/lib/languages";
import type { SearchFiltersInput } from "../schemas";

export function SearchFiltersForm({ initial }: { initial: Partial<SearchFiltersInput> }) {
  const t = useTranslations("familySearch");
  const router = useRouter();

  const [province, setProvince] = useState(initial.province ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [minExperience, setMinExperience] = useState(initial.minExperience?.toString() ?? "");
  const [employmentType, setEmploymentType] = useState(initial.employmentType ?? "");
  const [liveIn, setLiveIn] = useState(initial.liveIn ?? "");
  const [ageGroups, setAgeGroups] = useState<string[]>(initial.ageGroups ?? []);
  const [languages, setLanguages] = useState<string[]>(initial.languages ?? []);
  const [salaryMin, setSalaryMin] = useState(initial.salaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(initial.salaryMax?.toString() ?? "");
  const [sort, setSort] = useState(initial.sort ?? "newest");

  function applyFilters() {
    const params = new URLSearchParams();
    if (province) params.set("province", province);
    if (city) params.set("city", city);
    if (minExperience) params.set("minExperience", minExperience);
    if (employmentType) params.set("employmentType", employmentType);
    if (liveIn) params.set("liveIn", liveIn);
    ageGroups.forEach((g) => params.append("ageGroups", g));
    languages.forEach((l) => params.append("languages", l));
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);
    params.set("sort", sort);
    params.set("page", "1");
    router.push(`/familia/procurar?${params.toString()}`);
  }

  function toggleAgeGroup(group: string) {
    setAgeGroups((prev) => (prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]));
  }

  function toggleLanguage(language: string) {
    setLanguages((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]));
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-plat-border bg-plat-bg p-4">
      <h2 className="font-medium text-plat-ink">{t("filters.title")}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t("filters.province")}</Label>
          <Select
            value={province}
            onValueChange={(value) => {
              setProvince(value);
              setCity("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
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
          <Label>{t("filters.city")}</Label>
          <Select value={city} onValueChange={setCity} disabled={!province}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {citiesForProvince(province).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("filters.experience")}</Label>
          <Input
            type="number"
            min={0}
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("filters.employmentType")}</Label>
          <Select value={employmentType} onValueChange={setEmploymentType}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Tempo inteiro</SelectItem>
              <SelectItem value="PART_TIME">Meio período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("filters.liveIn")}</Label>
          <Select value={liveIn} onValueChange={setLiveIn}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LIVE_IN">Interna</SelectItem>
              <SelectItem value="LIVE_OUT">Externa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("filters.salaryRange")}</Label>
          <div className="flex gap-2">
            <Input type="number" min={0} placeholder="Min" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            <Input type="number" min={0} placeholder="Max" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("sort.label")}</Label>
          <Select value={sort} onValueChange={(v) => setSort(v as never)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sort.newest")}</SelectItem>
              <SelectItem value="experience">{t("sort.experience")}</SelectItem>
              <SelectItem value="salary">{t("sort.salary")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("filters.ageGroups")}</Label>
        <div className="flex flex-wrap gap-4">
          {AGE_GROUPS.map((group) => (
            <label key={group} className="flex items-center gap-2 text-sm text-plat-ink">
              <Checkbox checked={ageGroups.includes(group)} onCheckedChange={() => toggleAgeGroup(group)} />
              {group}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("filters.languages")}</Label>
        <div className="flex flex-wrap gap-4">
          {NANNY_LANGUAGES.map((language) => (
            <label key={language} className="flex items-center gap-2 text-sm text-plat-ink">
              <Checkbox checked={languages.includes(language)} onCheckedChange={() => toggleLanguage(language)} />
              {language}
            </label>
          ))}
        </div>
      </div>

      <Button type="button" onClick={applyFilters} className="w-fit">
        {t("filters.apply")}
      </Button>
    </div>
  );
}
