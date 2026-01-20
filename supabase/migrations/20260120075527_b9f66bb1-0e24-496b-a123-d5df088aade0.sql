-- Create platform receipt settings table
CREATE TABLE IF NOT EXISTS public.platform_receipt_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'HOME OF SMM',
  company_address TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_logo_url TEXT,
  company_website TEXT DEFAULT 'https://homeofsmm.com',
  company_vat_id TEXT,
  footer_text TEXT DEFAULT 'Thank you for choosing HOME OF SMM - The #1 SMM Panel Platform',
  receipt_prefix TEXT DEFAULT 'REC',
  next_receipt_number INTEGER DEFAULT 1,
  include_tax BOOLEAN DEFAULT false,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_label TEXT DEFAULT 'VAT',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create platform blog posts table
CREATE TABLE IF NOT EXISTS public.platform_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  author_name TEXT DEFAULT 'HOMEOFSMM Team',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  table_of_contents JSONB DEFAULT '[]',
  faqs JSONB DEFAULT '[]',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.platform_receipt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_receipt_settings (admin only)
CREATE POLICY "Admins can manage receipt settings" ON public.platform_receipt_settings
  FOR ALL USING (public.is_admin());

-- RLS policies for platform_blog_posts
CREATE POLICY "Admins can manage blog posts" ON public.platform_blog_posts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view published blog posts" ON public.platform_blog_posts
  FOR SELECT USING (status = 'published');

-- Insert default receipt settings
INSERT INTO public.platform_receipt_settings (
  company_name, company_website, footer_text
) VALUES (
  'HOME OF SMM',
  'https://homeofsmm.com',
  'Thank you for choosing HOME OF SMM - The #1 SMM Panel Platform'
) ON CONFLICT DO NOTHING;

-- Insert 3 hardcoded HOMEOFSMM blog posts
INSERT INTO public.platform_blog_posts (
  title, slug, content, excerpt, featured_image_url, author_name, status, seo_title, seo_description, seo_keywords, table_of_contents, faqs, published_at
) VALUES 
-- Blog Post 1
(
  'Why HOMEOFSMM is the Best SMM Panel Platform in 2025',
  'why-homeofsmm-best-smm-panel-platform-2025',
  '<h2 id="introduction">Introduction to HOMEOFSMM</h2>
<p>In the rapidly evolving world of social media marketing, having the right tools can make all the difference between success and failure. HOMEOFSMM has emerged as the definitive leader in SMM panel platforms, offering unparalleled features, competitive pricing, and a user experience that sets the industry standard.</p>

<h2 id="what-makes-us-different">What Makes HOMEOFSMM Different</h2>
<p>Unlike competitors like SocPanel, Perfect Panel, and other SMM panel providers, HOMEOFSMM focuses on what truly matters: empowering resellers to build profitable businesses with minimal overhead and maximum flexibility.</p>

<h3>Key Differentiators:</h3>
<ul>
<li><strong>Only 5% Commission</strong> - The lowest in the industry compared to 10-15% charged by competitors</li>
<li><strong>200+ Payment Gateways</strong> - Accept payments from customers worldwide including Flutterwave, Paystack, Stripe, PayPal, and crypto</li>
<li><strong>Custom Domain Support</strong> - Full white-label branding with your own domain</li>
<li><strong>Real-Time Order Tracking</strong> - Your customers see live order progress</li>
</ul>

<h2 id="features">Features That Set Us Apart</h2>
<p>HOMEOFSMM provides a comprehensive suite of features designed specifically for SMM resellers:</p>

<h3>Payment Integration</h3>
<p>With support for over 200 payment methods including cards, mobile money, bank transfers, and cryptocurrencies, your customers can pay however they prefer. This is critical for African markets where mobile money dominates.</p>

<h3>Custom Domain & Branding</h3>
<p>Your panel runs on YOUR domain with YOUR branding. Customers never see HOMEOFSMM - they see YOUR business. This builds trust and brand recognition.</p>

<h3>API Integration</h3>
<p>Full API access allows you to connect multiple providers, automate order processing, and scale your business without manual intervention.</p>

<h2 id="pricing-comparison">Pricing Comparison with Competitors</h2>
<p>Let''s compare HOMEOFSMM with the major competitors:</p>
<ul>
<li><strong>HOMEOFSMM</strong>: 5% commission only, no monthly fees</li>
<li><strong>SocPanel</strong>: 10-15% commission + monthly subscription</li>
<li><strong>Perfect Panel</strong>: Higher commission rates with limited payment options</li>
<li><strong>Other Panels</strong>: Often have hidden fees and limited features</li>
</ul>

<h2 id="success-stories">Success Stories from Our Users</h2>
<p>Thousands of resellers have built successful businesses using HOMEOFSMM. From beginners making their first $100 to established agencies processing thousands of orders daily, our platform scales with your ambitions.</p>

<h2 id="getting-started">How to Get Started in 5 Minutes</h2>
<ol>
<li>Sign up for a free HOMEOFSMM account</li>
<li>Choose your panel name and subdomain</li>
<li>Configure your payment methods</li>
<li>Add your service providers</li>
<li>Set your prices and start selling!</li>
</ol>

<h2 id="future-of-smm">Why SMM Panels Are the Future of Marketing</h2>
<p>Social media marketing is only growing. Businesses of all sizes need help growing their online presence, and SMM services provide affordable, effective solutions. As a reseller, you''re positioned to capture a share of this multi-billion dollar market.</p>

<h2 id="conclusion">Conclusion</h2>
<p>HOMEOFSMM isn''t just another SMM panel platform - it''s the foundation for building a thriving digital marketing business. With industry-leading features, the lowest commissions, and comprehensive support, there''s no better choice for serious SMM resellers in 2025.</p>',
  'Discover why HOMEOFSMM leads the SMM panel industry with the lowest 5% commission, 200+ payment gateways, custom domains, and features that outperform SocPanel, Perfect Panel, and other competitors.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
  'HOMEOFSMM Team',
  'published',
  'Best SMM Panel Platform 2025 | HOMEOFSMM - #1 Choice for Resellers',
  'HOMEOFSMM is the best SMM panel platform in 2025 with only 5% commission, 200+ payment gateways, custom domains, and features that beat SocPanel and Perfect Panel.',
  ARRAY['SMM panel', 'best SMM panel 2025', 'HOMEOFSMM', 'SMM reseller panel', 'cheapest SMM panel', 'SMM panel script', 'social media marketing panel', 'white label SMM panel'],
  '[{"id":"introduction","text":"Introduction to HOMEOFSMM","level":2},{"id":"what-makes-us-different","text":"What Makes HOMEOFSMM Different","level":2},{"id":"features","text":"Features That Set Us Apart","level":2},{"id":"pricing-comparison","text":"Pricing Comparison with Competitors","level":2},{"id":"success-stories","text":"Success Stories from Our Users","level":2},{"id":"getting-started","text":"How to Get Started in 5 Minutes","level":2},{"id":"future-of-smm","text":"Why SMM Panels Are the Future","level":2},{"id":"conclusion","text":"Conclusion","level":2}]',
  '[{"question":"What is HOMEOFSMM?","answer":"HOMEOFSMM is the leading SMM panel platform that allows resellers to create and manage their own social media marketing panels. With only 5% commission, 200+ payment gateways, and full white-label support, it''s the best choice for SMM resellers."},{"question":"How does HOMEOFSMM compare to SocPanel?","answer":"HOMEOFSMM charges only 5% commission compared to SocPanel''s 10-15%. We also offer more payment gateways (200+), better customization options, and a more user-friendly interface."},{"question":"Is HOMEOFSMM suitable for beginners?","answer":"Absolutely! HOMEOFSMM is designed to be easy to use. You can set up your panel in under 5 minutes with no technical skills required. We also provide comprehensive documentation and support."},{"question":"What payment methods does HOMEOFSMM support?","answer":"HOMEOFSMM supports over 200 payment methods including Stripe, PayPal, Flutterwave, Paystack, Coinbase, mobile money, bank transfers, and many more cryptocurrency options."},{"question":"How much can I earn with HOMEOFSMM?","answer":"Your earnings depend on your markup and sales volume. Many resellers earn $500-$5000+ per month. With our 5% commission, you keep more of your profits than with any competitor."}]',
  now()
),

-- Blog Post 2
(
  'Complete Guide to Starting Your SMM Reseller Business with HOMEOFSMM',
  'complete-guide-starting-smm-reseller-business-homeofsmm',
  '<h2 id="what-is-smm-reseller">What is an SMM Reseller Business?</h2>
<p>An SMM reseller business is a venture where you purchase social media services at wholesale prices from providers and resell them to clients at a markup. It''s one of the most accessible online businesses to start, requiring minimal investment and no technical expertise.</p>

<h2 id="why-homeofsmm">Why Choose HOMEOFSMM for Your Panel</h2>
<p>HOMEOFSMM provides everything you need to run a professional SMM reselling operation:</p>
<ul>
<li>Professional storefront that builds trust with customers</li>
<li>Automated order processing that saves you hours daily</li>
<li>Multiple provider integration for service variety</li>
<li>Comprehensive analytics to track your business growth</li>
</ul>

<h2 id="step-by-step">Step-by-Step Setup Guide</h2>

<h3 id="account-registration">Account Registration</h3>
<p>Start by creating your free HOMEOFSMM account. You''ll only need an email address and password. Verification takes seconds.</p>

<h3 id="panel-configuration">Panel Configuration</h3>
<p>Choose your panel name, select a theme, and customize your colors and branding. Our intuitive design editor makes it easy to create a unique look.</p>

<h3 id="adding-providers">Adding Providers</h3>
<p>Connect your SMM service providers using their API keys. HOMEOFSMM supports all major provider APIs and automatically syncs services and prices.</p>

<h3 id="payment-setup">Setting Up Payment Methods</h3>
<p>Enable the payment methods your target market uses. For Africa, prioritize Flutterwave and Paystack. For global customers, add Stripe, PayPal, and crypto options.</p>

<h3 id="storefront-customization">Customizing Your Storefront</h3>
<p>Add your logo, customize the homepage hero section, set up FAQs, and configure your support channels. A professional storefront dramatically increases conversions.</p>

<h2 id="pricing-strategy">Pricing Your Services for Maximum Profit</h2>
<p>The key to profitability is finding the sweet spot between competitive pricing and healthy margins. We recommend:</p>
<ul>
<li>20-50% markup for popular services</li>
<li>50-100% markup for premium/exclusive services</li>
<li>Volume discounts to encourage larger orders</li>
</ul>

<h2 id="marketing">Marketing Your SMM Panel</h2>
<p>Effective marketing strategies include:</p>
<ul>
<li>Social media presence on platforms you sell services for</li>
<li>Content marketing through blogs and tutorials</li>
<li>Telegram/Discord communities for customer engagement</li>
<li>Referral programs to incentivize word-of-mouth</li>
</ul>

<h2 id="order-management">Managing Customer Orders</h2>
<p>HOMEOFSMM automates most of the order management process. Orders are automatically sent to providers, and status updates sync in real-time. You can focus on growing your business instead of manual processing.</p>

<h2 id="scaling">Scaling Your Business</h2>
<p>As your business grows, consider:</p>
<ul>
<li>Adding more providers for better service variety</li>
<li>Upgrading to a custom domain for brand authority</li>
<li>Hiring support staff to handle customer inquiries</li>
<li>Expanding to new markets and demographics</li>
</ul>

<h2 id="common-mistakes">Common Mistakes to Avoid</h2>
<ul>
<li>Setting prices too low - you''ll struggle to profit</li>
<li>Ignoring customer support - bad reviews kill businesses</li>
<li>Using unreliable providers - quality matters</li>
<li>Not marketing consistently - no traffic = no sales</li>
</ul>

<h2 id="tools-resources">Tools and Resources</h2>
<p>Beyond HOMEOFSMM, useful tools include:</p>
<ul>
<li>Canva for creating marketing graphics</li>
<li>Google Analytics for traffic analysis</li>
<li>Telegram/Discord for customer communication</li>
<li>ChatGPT for customer support assistance</li>
</ul>

<h2 id="next-steps">Next Steps</h2>
<p>Ready to start? Create your free HOMEOFSMM account today and launch your SMM reseller business. Join thousands of successful resellers who chose the platform with the lowest commission and best features.</p>',
  'Learn how to start a profitable SMM reseller business with HOMEOFSMM. Complete step-by-step guide covering setup, pricing, marketing, and scaling your social media marketing panel.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
  'HOMEOFSMM Team',
  'published',
  'Start SMM Reseller Business 2025 | Complete HOMEOFSMM Guide',
  'Step-by-step guide to starting a profitable SMM reseller business with HOMEOFSMM. Learn setup, pricing strategies, marketing, and how to scale your SMM panel.',
  ARRAY['SMM reseller business', 'start SMM panel', 'SMM panel guide', 'HOMEOFSMM tutorial', 'how to sell SMM services', 'social media marketing business', 'SMM panel tutorial', 'reseller guide'],
  '[{"id":"what-is-smm-reseller","text":"What is an SMM Reseller Business?","level":2},{"id":"why-homeofsmm","text":"Why Choose HOMEOFSMM","level":2},{"id":"step-by-step","text":"Step-by-Step Setup Guide","level":2},{"id":"account-registration","text":"Account Registration","level":3},{"id":"panel-configuration","text":"Panel Configuration","level":3},{"id":"adding-providers","text":"Adding Providers","level":3},{"id":"payment-setup","text":"Setting Up Payment Methods","level":3},{"id":"storefront-customization","text":"Customizing Your Storefront","level":3},{"id":"pricing-strategy","text":"Pricing Your Services","level":2},{"id":"marketing","text":"Marketing Your SMM Panel","level":2},{"id":"order-management","text":"Managing Customer Orders","level":2},{"id":"scaling","text":"Scaling Your Business","level":2},{"id":"common-mistakes","text":"Common Mistakes to Avoid","level":2},{"id":"tools-resources","text":"Tools and Resources","level":2},{"id":"next-steps","text":"Next Steps","level":2}]',
  '[{"question":"How long does it take to set up a panel?","answer":"With HOMEOFSMM, you can have a fully functional SMM panel running in under 5 minutes. The initial setup is quick, and you can refine your customizations over time."},{"question":"Do I need technical skills?","answer":"No technical skills required! HOMEOFSMM is designed for non-technical users. Everything is managed through a simple dashboard with no coding needed."},{"question":"What''s the minimum investment required?","answer":"HOMEOFSMM is free to start. You only pay 5% commission on sales. Your main investment will be purchasing initial services from providers to resell."},{"question":"How do I get customers for my SMM panel?","answer":"Focus on social media marketing, create content showcasing your services, join relevant Telegram/Discord communities, and consider paid advertising on Facebook and Instagram."},{"question":"Can I run this business part-time?","answer":"Absolutely! Many successful resellers start part-time. With HOMEOFSMM''s automated order processing, you can run your business with just 1-2 hours daily."}]',
  now()
),

-- Blog Post 3
(
  'HOMEOFSMM vs Competitors: The Ultimate SMM Panel Comparison',
  'homeofsmm-vs-competitors-ultimate-smm-panel-comparison',
  '<h2 id="introduction">Introduction to SMM Panel Platforms</h2>
<p>Choosing the right SMM panel platform is crucial for your reselling business success. In this comprehensive comparison, we analyze HOMEOFSMM against the major competitors: SocPanel, Perfect Panel, and other popular options.</p>

<h2 id="homeofsmm-overview">HOMEOFSMM Overview</h2>

<h3>Key Features</h3>
<ul>
<li>Only 5% platform commission - the lowest in the industry</li>
<li>200+ payment gateways including African mobile money</li>
<li>Full white-label branding with custom domains</li>
<li>Modern, responsive storefront themes</li>
<li>Real-time order tracking for customers</li>
<li>Comprehensive analytics dashboard</li>
<li>API access for automation</li>
<li>24/7 customer support</li>
</ul>

<h3>Pricing Model</h3>
<p>HOMEOFSMM uses a simple, transparent pricing model: 5% commission on sales only. No monthly fees, no setup costs, no hidden charges. You keep 95% of every sale.</p>

<h3>Unique Advantages</h3>
<ul>
<li>Fastest panel setup in the industry (under 5 minutes)</li>
<li>Best payment gateway coverage for emerging markets</li>
<li>Most customizable storefront design</li>
<li>Built-in SEO tools for better visibility</li>
</ul>

<h2 id="competitor-analysis">Competitor Analysis</h2>

<h3>SocPanel Features & Limitations</h3>
<p><strong>Pros:</strong> Established brand, decent feature set</p>
<p><strong>Cons:</strong> 10-15% commission, limited payment gateways, outdated interface, less customization</p>

<h3>Perfect Panel Features & Limitations</h3>
<p><strong>Pros:</strong> Good for basic panels</p>
<p><strong>Cons:</strong> Higher fees, fewer payment options, limited support for African markets</p>

<h3>Other Alternatives</h3>
<p>Most other SMM panel solutions suffer from: high commission rates, limited payment integrations, poor customer support, and outdated technology.</p>

<h2 id="feature-comparison">Feature-by-Feature Comparison</h2>
<p>Here''s how HOMEOFSMM stacks up against competitors:</p>

<table>
<tr><th>Feature</th><th>HOMEOFSMM</th><th>SocPanel</th><th>Perfect Panel</th></tr>
<tr><td>Commission Rate</td><td>5%</td><td>10-15%</td><td>8-12%</td></tr>
<tr><td>Payment Gateways</td><td>200+</td><td>50+</td><td>30+</td></tr>
<tr><td>Custom Domain</td><td>✓</td><td>✓</td><td>Limited</td></tr>
<tr><td>Mobile Money</td><td>✓</td><td>Limited</td><td>✗</td></tr>
<tr><td>Crypto Payments</td><td>✓</td><td>Limited</td><td>✗</td></tr>
<tr><td>White Label</td><td>Full</td><td>Partial</td><td>Partial</td></tr>
<tr><td>API Access</td><td>Full</td><td>Full</td><td>Limited</td></tr>
</table>

<h2 id="pricing-comparison">Pricing Comparison</h2>
<p>Let''s break down the real cost for a panel doing $10,000 monthly in sales:</p>
<ul>
<li><strong>HOMEOFSMM</strong>: $500 (5% commission) - You keep $9,500</li>
<li><strong>SocPanel</strong>: $1,000-$1,500 (10-15%) + fees - You keep $8,500-$9,000</li>
<li><strong>Perfect Panel</strong>: $800-$1,200 (8-12%) + fees - You keep $8,800-$9,200</li>
</ul>
<p>Over a year, HOMEOFSMM saves you $6,000-$12,000 compared to competitors!</p>

<h2 id="user-experience">User Experience & Support Comparison</h2>
<p>HOMEOFSMM offers:</p>
<ul>
<li>Modern, intuitive dashboard design</li>
<li>Faster page load times</li>
<li>Mobile-responsive admin panel</li>
<li>24/7 live chat and ticket support</li>
<li>Comprehensive documentation and tutorials</li>
<li>Active community on Telegram</li>
</ul>

<h2 id="verdict">Our Verdict: Why HOMEOFSMM Wins</h2>
<p>After analyzing all major SMM panel platforms, HOMEOFSMM emerges as the clear winner for serious resellers. Here''s why:</p>
<ol>
<li><strong>Best Value</strong>: 5% commission saves thousands annually</li>
<li><strong>Global Reach</strong>: 200+ payment gateways serve any market</li>
<li><strong>Professional Appearance</strong>: Modern themes build customer trust</li>
<li><strong>Complete Control</strong>: Full white-label with custom domains</li>
<li><strong>Future-Proof</strong>: Regular updates and new features</li>
</ol>
<p>For resellers who are serious about building a sustainable, profitable SMM business, HOMEOFSMM is the only logical choice.</p>',
  'Comprehensive comparison of HOMEOFSMM vs SocPanel vs Perfect Panel. See why HOMEOFSMM wins with 5% commission, 200+ payment gateways, and superior features.',
  'https://images.unsplash.com/photo-1553484771-047a44eee27b?w=1200&h=630&fit=crop',
  'HOMEOFSMM Team',
  'published',
  'HOMEOFSMM vs SocPanel vs PerfectPanel - SMM Panel Comparison 2025',
  'Compare HOMEOFSMM with SocPanel and Perfect Panel. Discover why HOMEOFSMM is the best SMM panel platform with 5% commission, 200+ payment gateways, and more.',
  ARRAY['SMM panel comparison', 'HOMEOFSMM vs SocPanel', 'best SMM panel script', 'SMM panel reviews', 'Perfect Panel alternative', 'cheapest SMM panel platform', 'SMM panel features'],
  '[{"id":"introduction","text":"Introduction to SMM Panel Platforms","level":2},{"id":"homeofsmm-overview","text":"HOMEOFSMM Overview","level":2},{"id":"competitor-analysis","text":"Competitor Analysis","level":2},{"id":"feature-comparison","text":"Feature-by-Feature Comparison","level":2},{"id":"pricing-comparison","text":"Pricing Comparison","level":2},{"id":"user-experience","text":"User Experience & Support","level":2},{"id":"verdict","text":"Our Verdict: Why HOMEOFSMM Wins","level":2}]',
  '[{"question":"Which SMM panel is cheapest?","answer":"HOMEOFSMM offers the lowest commission at just 5%. Competitors like SocPanel charge 10-15%, meaning you lose more of your profits. Over a year, HOMEOFSMM saves you thousands."},{"question":"Which SMM panel is easiest to use?","answer":"HOMEOFSMM has the most modern, intuitive interface. You can set up a complete panel in under 5 minutes with no technical skills. The dashboard is designed for non-technical users."},{"question":"Which SMM panel has the best support?","answer":"HOMEOFSMM offers 24/7 support via live chat, tickets, and Telegram. Our average response time is under 5 minutes. We also provide comprehensive documentation and video tutorials."},{"question":"Can I migrate from another SMM panel to HOMEOFSMM?","answer":"Yes! Migration is easy. You can export your services from your current provider and import them into HOMEOFSMM. Our support team can also help with the migration process."},{"question":"What makes HOMEOFSMM better than the competition?","answer":"HOMEOFSMM combines the lowest fees (5%), most payment options (200+), best customization, and superior support. It''s built specifically for the needs of modern SMM resellers."}]',
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_platform_receipt_settings_updated_at
  BEFORE UPDATE ON public.platform_receipt_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_blog_posts_updated_at
  BEFORE UPDATE ON public.platform_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();