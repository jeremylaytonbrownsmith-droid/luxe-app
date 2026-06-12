// Brand assets for Local Luxe Concierge.
// The logo (transparent PNG) is vendored at public/brand/logo.png, so it works
// offline and is bundled with the PWA. Base-aware for local + GitHub Pages.
export const BRAND_LOGO = `${import.meta.env.BASE_URL}brand/logo.png`

// Brand palette pulled from the logo (navy + sage green) and the website.
export const BRAND = {
  navy: '#2f5167',
  sage: '#8faa9b',
  sageDeep: '#5d8071',
  gold: '#b5a808',
}
