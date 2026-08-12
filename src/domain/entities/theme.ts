export interface ThemeColorTokens {
  primary: Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', string>;
  secondary: Record<'100' | '300' | '500' | '700', string>;
  whimsy: Record<'pink' | 'yellow' | 'sky' | 'mint', string>;
  background: string;
  surface: string;
  ink: string;
  inkSoft: string;
  accentForeground: string;
}

export interface Theme {
  id: string;
  slug: string;
  name: string;
  colorTokens: ThemeColorTokens;
  defaultIllustrationUrl: string | null;
}
