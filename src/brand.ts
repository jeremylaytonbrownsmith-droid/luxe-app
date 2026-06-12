// Brand assets for Local Luxe Concierge.
//
// The logo is currently referenced from the live Wix CDN so it shows up
// immediately. For full offline/PWA support you can vendor the file later:
//   1. Download the logo from Wix as a PNG (ideally transparent background)
//   2. Save it to: public/brand/logo.png
//   3. Change BRAND_LOGO below to: `${import.meta.env.BASE_URL}brand/logo.png`
export const BRAND_LOGO =
  'https://static.wixstatic.com/media/6096ed_b4f2c1dfba034e959ad5a8cd4a0619c5~mv2.jpg'

// Brand palette pulled from the logo (navy + sage green) and the website.
export const BRAND = {
  navy: '#2f5167',
  sage: '#8faa9b',
  sageDeep: '#5d8071',
  gold: '#b5a808',
}
