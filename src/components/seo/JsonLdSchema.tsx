import { Helmet } from 'react-helmet-async';

// JSON-LD Schema Types
interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface WebSiteSchemaProps {
  name: string;
  url: string;
  searchUrl?: string;
}

interface FAQSchemaProps {
  faqs: Array<{ question: string; answer: string }>;
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  lowPrice?: string;
  highPrice?: string;
  priceCurrency?: string;
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

interface SoftwareApplicationSchemaProps {
  name: string;
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: string;
    ratingCount: string;
  };
}

interface LocalBusinessSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  priceRange?: string;
}

// Organization Schema Component
export const OrganizationSchema = ({ name, url, logo, description, sameAs = [] }: OrganizationSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// WebSite Schema with SearchAction
export const WebSiteSchema = ({ name, url, searchUrl }: WebSiteSchemaProps) => {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  };

  if (searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// FAQPage Schema Component
export const FAQPageSchema = ({ faqs }: FAQSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Article Schema Component
export const ArticleSchema = ({ headline, description, image, author, datePublished, dateModified, url }: ArticleSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished,
    ...(dateModified && { dateModified }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Product Schema Component
export const ProductSchema = ({ name, description, image, lowPrice = '0.01', highPrice = '100', priceCurrency = 'USD' }: ProductSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    ...(image && { image }),
    offers: {
      '@type': 'AggregateOffer',
      lowPrice,
      highPrice,
      priceCurrency,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Breadcrumb Schema Component
export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// SoftwareApplication Schema Component
export const SoftwareApplicationSchema = ({ name, description, applicationCategory = 'BusinessApplication', operatingSystem = 'Web', offers, aggregateRating }: SoftwareApplicationSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    ...(offers && { offers: { '@type': 'Offer', ...offers } }),
    ...(aggregateRating && { aggregateRating: { '@type': 'AggregateRating', ...aggregateRating } }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// LocalBusiness Schema Component
export const LocalBusinessSchema = ({ name, url, logo, description, priceRange }: LocalBusinessSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(priceRange && { priceRange }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Combined Schema for Main Homepage
export const MainHomepageSchemas = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://homeofsmm.com';
  
  return (
    <>
      <OrganizationSchema
        name="HOME OF SMM"
        url={baseUrl}
        logo={`${baseUrl}/og-image.png`}
        description="Launch your own SMM panel with Home of SMM. Get custom branding, automated orders, multiple payment gateways, and real-time analytics to grow your revenue"
        sameAs={[
          'https://twitter.com/homeofsmm',
          'https://facebook.com/homeofsmm',
          'https://instagram.com/homeofsmm',
        ]}
      />
      <WebSiteSchema
        name="HOME OF SMM"
        url={baseUrl}
        searchUrl={`${baseUrl}/services`}
      />
      <SoftwareApplicationSchema
        name="HOME OF SMM Panel"
        description="Launch your own SMM panel with Home of SMM. Get custom branding, automated orders, multiple payment gateways, and real-time analytics to grow your revenue"
        applicationCategory="BusinessApplication"
        offers={{
          price: '0',
          priceCurrency: 'USD',
        }}
        aggregateRating={{
          ratingValue: '4.9',
          ratingCount: '10000',
        }}
      />
    </>
  );
};

// Combined Schema for Buyer Homepage (tenant storefronts)
export const BuyerHomepageSchemas = ({ 
  panelName, 
  panelUrl, 
  logoUrl, 
  description 
}: { 
  panelName: string; 
  panelUrl: string; 
  logoUrl?: string; 
  description?: string;
}) => {
  return (
    <>
      <LocalBusinessSchema
        name={panelName}
        url={panelUrl}
        logo={logoUrl}
        description={description || `${panelName} - Premium social media marketing services at the best prices.`}
        priceRange="$"
      />
      <ProductSchema
        name="SMM Services"
        description="Social media marketing services including followers, likes, views, and comments for Instagram, YouTube, TikTok, Twitter, and more."
      />
    </>
  );
};
