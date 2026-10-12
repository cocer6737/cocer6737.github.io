# Website languages

The existing Chinese static export remains at `/`. English pages are under `/en/`, and Traditional Cantonese pages under `/yue/`. Each version contains Home, Services, About, Inner Capital and Contact. Assets and external links are shared.

## Update workflow

1. Update the Chinese export and the reviewed translation catalogue in `copy.mjs`.
2. Run `node localization/build.mjs` from the repository root.
3. Run `node localization/check.mjs`.
4. Check the three versions in a browser before publishing. Include service tabs, language switching with a service hash, carousel titles, form validation and mobile wrapping.

The repository contains a Next.js static export, not the original application source. The build script synchronises rendered HTML, React flight records and the content-bearing client modules so translated text remains consistent after hydration. Locale navigation loads complete static documents rather than sending locale-prefixed paths to the original unprefixed client router. It does not add a translation API or any external dependency.

The selector is present on every page. Native links work without JavaScript; the small enhancement preserves the current hash and query string. Brand colours are warm paper `#f7f4ee`, brown `#302720` and burnt orange `#a8330e`. The selected-state text contrast is 6.43:1 and touch targets are at least 44px high.

English uses Singapore/British business English. Cantonese uses Traditional Chinese, retaining formal terminology for legal and financial matters. Chinese proper names are retained alongside working romanisations where no approved English name was supplied. Biographical claims are translated from the existing site, not independently re-certified.

Text inside supplied posters, original articles and videos is not translated. The contact form remains a demonstration: it checks entries locally and does not submit them. Existing unconfirmed dates and contact details remain explicitly unconfirmed.
