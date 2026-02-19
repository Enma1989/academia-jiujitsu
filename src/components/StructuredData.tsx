import { SITE_CONFIG } from "@/lib/constants";

export function StructuredData() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        url: SITE_CONFIG.url,
        telephone: SITE_CONFIG.contact.phoneDisplay, // Display format usually fine, but E.164 is safer. Let's use E164 for machine reading if strict, but schema usually accepts strings. Let's use E.164.
        email: SITE_CONFIG.contact.email,
        address: {
            "@type": "PostalAddress",
            streetAddress: `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.number}`,
            addressLocality: SITE_CONFIG.address.city,
            addressRegion: SITE_CONFIG.address.state,
            postalCode: SITE_CONFIG.address.postalCode,
            addressCountry: SITE_CONFIG.address.country,
        },
        image: [`${SITE_CONFIG.url}/caio-matuto-logo.png`], // Assuming logo is main image for now
        sameAs: [
            SITE_CONFIG.social.instagram,
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
