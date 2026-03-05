import { useEffect, useLayoutEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';

// Extend Window interface for chat widgets
declare global {
  interface Window {
    $crisp?: any[];
    CRISP_WEBSITE_ID?: string;
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
    Intercom?: any;
  }
}

interface TenantHeadProps {
  title?: string;
  description?: string;
}

export const TenantHead = ({ title, description }: TenantHeadProps) => {
  const { panel } = useTenant();
  const customBranding = panel?.custom_branding as any;
  const panelSettings = panel?.settings as any;
  const integrationsInjectedRef = useRef(false);
  
  // Favicon URLs - prioritize .ico for Google compatibility, then custom, then defaults
  const faviconIcoUrl = customBranding?.faviconIcoUrl || '/default-tenant-favicon.ico';
  const faviconPngUrl = customBranding?.faviconUrl || '/default-panel-favicon.png';
  const appleTouchIconUrl = customBranding?.appleTouchIconUrl || '/default-panel-apple-touch-icon.png';
  const ogImage = customBranding?.ogImageUrl || panel?.logo_url;
  
  // Generate proper SEO title/description from panel settings (set during onboarding)
  const panelName = panel?.name || 'Panel';
  
  // Priority: 1. Page-specific props, 2. Panel SEO settings, 3. Auto-generated
  const seoTitle = panelSettings?.seo_title || `${panelName} - Social Media Marketing Services`;
  const seoDescription = panelSettings?.seo_description || `Professional social media marketing services from ${panelName}. Buy followers, likes, and views.`;
  const seoKeywords = panelSettings?.seo_keywords || `${panelName}, social media marketing, smm services, instagram followers, youtube views`;
  
  // Final values (page-specific title/description overrides panel defaults)
  const pageTitle = title || seoTitle;
  const pageDescription = description || seoDescription;
  
  // Canonical URL based on actual domain
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // CRITICAL: Set document title immediately using useLayoutEffect
  // This runs synchronously before paint, preventing "HOME OF SMM" flash
  useLayoutEffect(() => {
    if (panel?.name) {
      document.title = pageTitle;
    }
  }, [panel?.name, pageTitle]);
  
  // Force favicon update via DOM manipulation (overrides index.html)
  // Prioritize .ico format for Google crawler compatibility
  useEffect(() => {
    // Remove all existing favicon links
    document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    
    // Add primary .ico favicon (best for Google)
    const faviconIco = document.createElement('link');
    faviconIco.rel = 'icon';
    faviconIco.type = 'image/x-icon';
    faviconIco.href = faviconIcoUrl;
    document.head.appendChild(faviconIco);
    
    // Add shortcut icon (legacy browser support)
    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.type = 'image/x-icon';
    shortcutIcon.href = faviconIcoUrl;
    document.head.appendChild(shortcutIcon);
    
    // Add PNG favicon for other sizes
    const faviconPng32 = document.createElement('link');
    faviconPng32.rel = 'icon';
    faviconPng32.type = 'image/png';
    faviconPng32.sizes = '32x32';
    faviconPng32.href = faviconPngUrl;
    document.head.appendChild(faviconPng32);
    
    // Add apple touch icon
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.sizes = '180x180';
    appleIcon.href = appleTouchIconUrl;
    document.head.appendChild(appleIcon);
  }, [faviconIcoUrl, faviconPngUrl, appleTouchIconUrl]);
  
  // Inject enabled service integrations (GA, GTM, Crisp, etc.)
  useEffect(() => {
    if (!panel?.id || integrationsInjectedRef.current) return;
    
    const injectIntegrations = async () => {
      try {
        const { data } = await (supabase as any)
          .from('panel_settings_public')
          .select('integrations')
          .eq('panel_id', panel.id)
          .maybeSingle();
        
        if (!data?.integrations) return;
        integrationsInjectedRef.current = true;
        
        const integrations = data.integrations as Record<string, any>;
        
        // Google Analytics - inject gtag script
        if (integrations.google_analytics?.enabled && integrations.google_analytics?.code) {
          try {
            const code = integrations.google_analytics.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.head.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject Google Analytics:', e);
          }
        }
        
        // Google Tag Manager - inject GTM script
        if (integrations.google_tag_manager?.enabled && integrations.google_tag_manager?.code) {
          try {
            const code = integrations.google_tag_manager.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.head.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject GTM:', e);
          }
        }
        
        // Google Tag Manager - inject via container_id if no raw code
        if (integrations.google_tag_manager?.enabled && !integrations.google_tag_manager?.code && integrations.google_tag_manager?.container_id) {
          try {
            const gtmId = integrations.google_tag_manager.container_id;
            const script = document.createElement('script');
            script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
            document.head.appendChild(script);
            const noscript = document.createElement('noscript');
            noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
            document.body.insertBefore(noscript, document.body.firstChild);
          } catch (e) {
            console.error('Failed to inject GTM via container_id:', e);
          }
        }
        
        // Yandex.Metrika - inject counter code or counter_id
        if (integrations.yandex_metrika?.enabled) {
          try {
            if (integrations.yandex_metrika.code) {
              const code = integrations.yandex_metrika.code;
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.head.appendChild(fragment);
            } else if (integrations.yandex_metrika.counter_id) {
              const counterId = integrations.yandex_metrika.counter_id;
              const script = document.createElement('script');
              script.innerHTML = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${counterId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`;
              document.head.appendChild(script);
            }
          } catch (e) {
            console.error('Failed to inject Yandex.Metrika:', e);
          }
        }
        
        // Facebook Pixel - inject pixel code or pixel_id
        if (integrations.facebook_pixel?.enabled) {
          try {
            if (integrations.facebook_pixel.code) {
              const code = integrations.facebook_pixel.code;
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.head.appendChild(fragment);
            } else if (integrations.facebook_pixel.pixel_id) {
              const pixelId = integrations.facebook_pixel.pixel_id;
              const script = document.createElement('script');
              script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
              document.head.appendChild(script);
            }
          } catch (e) {
            console.error('Failed to inject Facebook Pixel:', e);
          }
        }
        
        // Hotjar - inject tracking code or site_id
        if (integrations.hotjar?.enabled) {
          try {
            if (integrations.hotjar.code) {
              const code = integrations.hotjar.code;
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.head.appendChild(fragment);
            } else if (integrations.hotjar.site_id) {
              const siteId = integrations.hotjar.site_id;
              const script = document.createElement('script');
              script.innerHTML = `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${siteId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;
              document.head.appendChild(script);
            }
          } catch (e) {
            console.error('Failed to inject Hotjar:', e);
          }
        }
        
        // Microsoft Clarity - inject tracking code or project_id
        if (integrations.clarity?.enabled) {
          try {
            if (integrations.clarity.code) {
              const code = integrations.clarity.code;
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.head.appendChild(fragment);
            } else if (integrations.clarity.project_id) {
              const projectId = integrations.clarity.project_id;
              const script = document.createElement('script');
              script.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${projectId}");`;
              document.head.appendChild(script);
            }
          } catch (e) {
            console.error('Failed to inject Clarity:', e);
          }
        }
        
        // WhatsApp floating button
        if (integrations.whatsapp?.enabled && integrations.whatsapp?.phone) {
          try {
            const phone = integrations.whatsapp.phone.replace(/[^0-9+]/g, '');
            const message = encodeURIComponent(integrations.whatsapp.message || 'Hello!');
            const waDiv = document.createElement('div');
            waDiv.id = 'wa-float-btn';
            waDiv.innerHTML = `<a href="https://wa.me/${phone}?text=${message}" target="_blank" rel="noopener noreferrer" style="position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.395 5.608L.054 23.88l6.447-1.29A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.883 0-3.651-.508-5.168-1.39l-.37-.22-3.834.767.812-3.72-.24-.382A9.56 9.56 0 012.4 12c0-5.302 4.298-9.6 9.6-9.6 5.302 0 9.6 4.298 9.6 9.6 0 5.302-4.298 9.6-9.6 9.6z"/></svg></a>`;
            document.body.appendChild(waDiv);
          } catch (e) {
            console.error('Failed to inject WhatsApp button:', e);
          }
        }
        
        // Crisp Chat - inject with website_id
        if (integrations.crisp?.enabled && integrations.crisp?.website_id) {
          window.$crisp = [];
          window.CRISP_WEBSITE_ID = integrations.crisp.website_id;
          const script = document.createElement('script');
          script.src = 'https://client.crisp.chat/l.js';
          script.async = true;
          document.head.appendChild(script);
        }
        
        // Tidio - inject tidio code/script
        if (integrations.tidio?.enabled && integrations.tidio?.code) {
          try {
            const code = integrations.tidio.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.body.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject Tidio:', e);
          }
        }
        
        // Zendesk - inject widget code
        if (integrations.zendesk?.enabled && integrations.zendesk?.code) {
          try {
            const code = integrations.zendesk.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.body.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject Zendesk:', e);
          }
        }
        
        // Smartsupp - inject code
        if (integrations.smartsupp?.enabled && integrations.smartsupp?.code) {
          try {
            const code = integrations.smartsupp.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.body.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject Smartsupp:', e);
          }
        }
        
        // JivoChat - inject widget
        if (integrations.jivochat?.enabled && integrations.jivochat?.code) {
          try {
            const code = integrations.jivochat.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.body.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject JivoChat:', e);
          }
        }
        
        // GetButton - inject multi-button widget
        if (integrations.getbutton?.enabled && integrations.getbutton?.code) {
          try {
            const code = integrations.getbutton.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.body.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject GetButton:', e);
          }
        }
        
        // Beamer - inject notification widget
        if (integrations.beamer?.enabled && integrations.beamer?.product_id) {
          const script = document.createElement('script');
          script.src = 'https://app.getbeamer.com/js/beamer-embed.js';
          script.defer = true;
          script.setAttribute('data-beamer-product-id', integrations.beamer.product_id);
          document.head.appendChild(script);
        }
        
        // GetSiteControl - inject popup/form widget
        if (integrations.getsitecontrol?.enabled && integrations.getsitecontrol?.code) {
          try {
            const code = integrations.getsitecontrol.code;
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.body.appendChild(fragment);
          } catch (e) {
            console.error('Failed to inject GetSiteControl:', e);
          }
        }
        
        // OneSignal - push notifications
        if (integrations.onesignal?.enabled && integrations.onesignal?.app_id) {
          const script = document.createElement('script');
          script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
          script.async = true;
          script.onload = () => {
            (window as any).OneSignal = (window as any).OneSignal || [];
            (window as any).OneSignal.push(['init', {
              appId: integrations.onesignal.app_id,
            }]);
          };
          document.head.appendChild(script);
        }
        
        // Facebook Chat Plugin - inject messenger widget
        if (integrations.facebook_chat?.enabled && integrations.facebook_chat?.code) {
          try {
            const code = integrations.facebook_chat.code;
            const div = document.createElement('div');
            div.id = 'fb-root';
            document.body.appendChild(div);
            
            const range = document.createRange();
            const fragment = range.createContextualFragment(code);
            document.body.appendChild(fragment);
            
            // Load Facebook SDK if not loaded
            if (!(window as any).FB) {
              const fbScript = document.createElement('script');
              fbScript.async = true;
              fbScript.defer = true;
              fbScript.crossOrigin = 'anonymous';
              fbScript.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
              document.body.appendChild(fbScript);
            }
          } catch (e) {
            console.error('Failed to inject Facebook Chat:', e);
          }
        }
        
        // Intercom - inject messenger widget
        if (integrations.intercom?.enabled) {
          try {
            if (integrations.intercom.code) {
              // Use custom code if provided
              const code = integrations.intercom.code;
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.body.appendChild(fragment);
            } else if (integrations.intercom.app_id) {
              // Use app_id to load Intercom SDK
              (window as any).intercomSettings = {
                api_base: "https://api-iam.intercom.io",
                app_id: integrations.intercom.app_id,
              };
              const script = document.createElement('script');
              script.innerHTML = `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${integrations.intercom.app_id}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`;
              document.body.appendChild(script);
            }
          } catch (e) {
            console.error('Failed to inject Intercom:', e);
          }
        }
        
        // LiveChat - inject chat widget
        if (integrations.livechat?.enabled) {
          try {
            if (integrations.livechat.code) {
              // Use custom code if provided
              const code = integrations.livechat.code;
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.body.appendChild(fragment);
            } else if (integrations.livechat.license) {
              // Use license to load LiveChat SDK
              const script = document.createElement('script');
              script.innerHTML = `window.__lc = window.__lc || {};window.__lc.license = ${integrations.livechat.license};(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice));`;
              document.body.appendChild(script);
            }
          } catch (e) {
            console.error('Failed to inject LiveChat:', e);
          }
        }
        
        // Tawk.to - inject chat widget
        if (integrations.tawkto?.enabled) {
          try {
            if (integrations.tawkto.code) {
              // Use custom code if provided
              const code = integrations.tawkto.code;
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.body.appendChild(fragment);
            } else if (integrations.tawkto.property_id) {
              // Use property_id and widget_id to load Tawk.to SDK
              const widgetId = integrations.tawkto.widget_id || 'default';
              window.Tawk_API = window.Tawk_API || {};
              window.Tawk_LoadStart = new Date();
              const script = document.createElement('script');
              script.async = true;
              script.src = `https://embed.tawk.to/${integrations.tawkto.property_id}/${widgetId}`;
              script.charset = 'UTF-8';
              script.setAttribute('crossorigin', '*');
              document.head.appendChild(script);
            }
          } catch (e) {
            console.error('Failed to inject Tawk.to:', e);
          }
        }
        
        // Custom Head Code - inject raw HTML/scripts (sanitized)
        // Skip injection on auth pages to prevent custom HTML from polluting login/signup
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/auth') || currentPath.includes('/login') || currentPath.includes('/signup');
        
        if (!isAuthPage && integrations.custom_head_code?.enabled && integrations.custom_head_code?.code) {
          try {
            let code = integrations.custom_head_code.code;
            
            // Sanitize: Remove full HTML document structure if present
            // Extract only the content that should be injected
            if (code.includes('<!DOCTYPE') || code.includes('<html')) {
              // Extract style tags
              const styleMatches = code.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
              const styles = styleMatches.join('\n');
              
              // Extract body content
              const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              const bodyContent = bodyMatch ? bodyMatch[1] : '';
              
              // For head injection, only inject styles
              if (styles) {
                const styleRange = document.createRange();
                const styleFragment = styleRange.createContextualFragment(styles);
                document.head.appendChild(styleFragment);
              }
              
              // For body content, inject into body
              if (bodyContent.trim()) {
                const bodyRange = document.createRange();
                const bodyFragment = bodyRange.createContextualFragment(bodyContent);
                document.body.appendChild(bodyFragment);
              }
            } else {
              // Normal code injection
              const range = document.createRange();
              const fragment = range.createContextualFragment(code);
              document.head.appendChild(fragment);
            }
          } catch (e) {
            console.error('Failed to inject custom head code:', e);
          }
        }
        
      } catch (error) {
        console.error('Failed to load panel integrations:', error);
      }
    };
    
    injectIntegrations();
  }, [panel?.id]);
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={panelName} />
      
      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={panelName} />
      
      {/* Robots and Crawling */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl.split('?')[0]} />
      
      {/* Robots.txt */}
      <link rel="robots" href={`${canonicalUrl}/robots.txt`} />
      
      {/* Sitemap */}
      <link rel="sitemap" type="application/xml" href={`${canonicalUrl}/sitemap.xml`} />
      
      {/* Favicon and Icons - .ico format for Google compatibility */}
      <link rel="icon" type="image/x-icon" href={faviconIcoUrl} />
      <link rel="shortcut icon" type="image/x-icon" href={faviconIcoUrl} />
      <link rel="icon" type="image/png" sizes="32x32" href={faviconPngUrl} />
      <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIconUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={panelName} />
      <meta property="og:locale" content="en_US" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={`${panelName} logo`} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Theme Color */}
      <meta name="theme-color" content={customBranding?.primaryColor || '#6366F1'} />
      <meta name="msapplication-TileColor" content={customBranding?.primaryColor || '#6366F1'} />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* JSON-LD Structured Data for Organization/WebSite */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": panelName,
          "url": canonicalUrl,
          "description": pageDescription,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${canonicalUrl}/services?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": panelName,
          "url": canonicalUrl,
          ...(ogImage ? { "logo": ogImage } : {}),
          "sameAs": []
        })}
      </script>
      {/* Local Business schema for SMM Panel services */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": panelName,
          "url": canonicalUrl,
          "description": pageDescription,
          ...(ogImage ? { "image": ogImage } : {}),
          "priceRange": "$$",
          "openingHours": "Mo-Su 00:00-24:00",
          "@id": canonicalUrl
        })}
      </script>
    </Helmet>
  );
};
