import { useEffect } from 'react';

/**
 * Custom hook to dynamically set page title, meta description, canonical URL,
 * and inject BreadcrumbList JSON-LD for Google Sitelinks.
 * @param {string} title - The page title
 * @param {string} description - The meta description
 * @param {string} [canonical] - Optional canonical URL path (e.g. '/about')
 * @param {Array} [breadcrumbs] - Optional breadcrumb array [{name, url}]
 */
export default function useSEO({ title, description, canonical, breadcrumbs }) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', description);

    // OG title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    // OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // OG url
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://flasho.services${canonical || ''}`);

    // Twitter title
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);

    // Twitter description
    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);

    // Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', `https://flasho.services${canonical || ''}`);

    // BreadcrumbList structured data for Sitelinks
    const breadcrumbList = breadcrumbs || [
      { name: 'Home', url: 'https://flasho.services/' },
      ...(canonical && canonical !== '/' ? [{ name: title.split('—')[0].trim(), url: `https://flasho.services${canonical}` }] : [])
    ];

    const existingScript = document.getElementById('breadcrumb-schema');
    if (existingScript) existingScript.remove();

    if (breadcrumbList.length > 1) {
      const script = document.createElement('script');
      script.id = 'breadcrumb-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbList.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name,
          'item': item.url
        }))
      });
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById('breadcrumb-schema');
      if (s) s.remove();
    };
  }, [title, description, canonical]);
}
