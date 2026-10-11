# Self-hosted web fonts

Loaded by `src/app/layout.tsx` through `next/font/local`, so the build never contacts Google.
All four are SIL Open Font License 1.1; each folder carries the `OFL.txt` from
https://github.com/google/fonts (`ofl/<family>/`). Latin subsets only, exactly what the
`next/font/google` loaders requested before 2026-10-11.

| folder | file | weights | fetched from (2026-10-11) |
|---|---|---|---|
| `vt323` | `VT323-Regular-latin.woff2` | 400 | fonts.gstatic.com/s/vt323/v18/ |
| `share-tech-mono` | `ShareTechMono-Regular-latin.woff2` | 400 | fonts.gstatic.com/s/sharetechmono/v16/ |
| `oswald` | `Oswald-Variable-latin.woff2` | 500–700 (variable) | fonts.gstatic.com/s/oswald/v57/ |
| `roboto-condensed` | `RobotoCondensed-Variable-latin.woff2` | 400–700 (variable) | fonts.gstatic.com/s/robotocondensed/v31/ |

To add a weight or subset: fetch the `/* latin */` block of
`https://fonts.googleapis.com/css2?family=<Family>:wght@<range>` with a current Chrome
user agent (older agents get TTF/woff), save the `.woff2` here and widen `weight` in the layout.
