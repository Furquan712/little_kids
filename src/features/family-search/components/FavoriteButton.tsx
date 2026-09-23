"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "../actions";

export function FavoriteButton({ nannyId, initialIsFavorite }: { nannyId: string; initialIsFavorite: boolean }) {
  const t = useTranslations("familySearch.favorite");
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setIsFavorite((prev) => !prev);
    startTransition(async () => {
      const result = await toggleFavoriteAction(nannyId);
      if (result.ok) setIsFavorite(result.data.isFavorite);
    });
  }

  return (
    <Button type="button" variant={isFavorite ? "default" : "outline"} onClick={handleClick} disabled={isPending}>
      <Heart className={isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
      {isFavorite ? t("remove") : t("add")}
    </Button>
  );
}
