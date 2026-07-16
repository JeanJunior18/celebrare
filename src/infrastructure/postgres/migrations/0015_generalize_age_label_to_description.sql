-- Generaliza a legenda da foto de um enum fixo de fases de bebê pra um
-- texto livre digitado pelo host — o enum não serve pra outros tipos de
-- evento (casamento, aniversário de adulto). Mapeia os valores antigos
-- pro texto que já era exibido publicamente, preservando a legenda das
-- fotos já cadastradas em vez de perdê-la ou trocar por um valor cru.
ALTER TABLE "gallery_photos" ALTER COLUMN "age_label" TYPE text USING (
  CASE age_label
    WHEN 'NEWBORN' THEN 'Recém-nascido'
    WHEN 'THREE_MONTHS' THEN '3 meses'
    WHEN 'SIX_MONTHS' THEN '6 meses'
    WHEN 'NINE_MONTHS' THEN '9 meses'
    WHEN 'ONE_YEAR' THEN '1 ano'
  END
);
--> statement-breakpoint

ALTER TABLE "gallery_photos" RENAME COLUMN "age_label" TO "description";
--> statement-breakpoint

DROP TYPE "baby_age_stage";
