import Script from "next/script";
import { analyticsIds } from "@/lib/site";

/**
 * GTM is the tag management layer (loaded once). GA4 is loaded directly through gtag unless
 * NEXT_PUBLIC_GA4_VIA_GTM=true, in which case GA4 must be configured inside the GTM container.
 * Either way GA4 is loaded exactly once. SPA navigations are measured by GA4 enhanced measurement
 * ("page changes based on browser history events"), so no manual page_view is sent (no duplicates).
 * Every custom event is also pushed to dataLayer for GTM triggers.
 */
export function AnalyticsScripts() {
  const { gtm, ga4, ga4ViaGtm } = analyticsIds;
  const ads = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID;
  const directGa4 = ga4 && !ga4ViaGtm ? ga4 : undefined;
  const gtagId = directGa4 ?? ads;

  return (
    <>
      <Script id="dl-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.__ga4ViaGtm=${ga4ViaGtm ? "true" : "false"};`}
      </Script>
      {gtm ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){if(w.__gtmLoaded)return;w.__gtmLoaded=true;w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
      {gtagId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${directGa4 ? `gtag('config','${directGa4}');` : ""}${ads ? `gtag('config','${ads}',{allow_enhanced_conversions:true});` : ""}`}
          </Script>
        </>
      ) : null}
      {pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
      {clarity ? (
        <Script id="clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      ) : null}
    </>
  );
}
