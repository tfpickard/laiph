# Deployment Guide

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Static Hosting

The application is a fully static site and can be deployed to any static hosting service:

### GitHub Pages

```bash
# Build the application
npm run build

# Deploy dist folder to gh-pages branch
# (Install gh-pages: npm install -g gh-pages)
gh-pages -d dist
```

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Build settings:
- Build Command: `npm run build`
- Output Directory: `dist`

### Cloudflare Pages

1. Connect repository to Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Deploy!

## Testing Locally

After building, test the production build:

```bash
npm run preview
```

This serves the `dist` folder locally for testing.

## Browser Compatibility Notes

The application requires WebGPU support. Ensure your deployment platform supports:

- Modern browsers (Chrome 120+, Edge 120+, Firefox 130+, Safari 18+)
- HTTPS (required for WebGPU)
- No Content Security Policy restrictions on WebGPU

## Performance Considerations

- The initial bundle is ~540KB (138KB gzipped)
- WebGPU requires hardware GPU support
- Optimal performance on devices with dedicated GPUs
- Mobile devices may have limited performance

## Environment Variables

No environment variables required. The application runs entirely client-side.

## HTTPS Requirement

WebGPU requires a secure context (HTTPS). Ensure your hosting platform provides:
- HTTPS by default (most modern hosts do)
- Valid SSL certificate
- No mixed content warnings

## CDN Recommendations

For optimal performance, enable:
- Gzip/Brotli compression (automatically handled by most CDNs)
- Cache-Control headers for static assets
- Edge caching for global distribution
