import type { GuideIllustration, GuideStep } from "../types";

/**
 * Default step guides. Admins can edit every step and upload a current screenshot in
 * Madvert Operations → Guides; an uploaded screenshot replaces the built-in illustration.
 *
 * The built-in visuals are original, simplified diagrams of each platform's settings screens
 * (not copies of platform screenshots). Steps and labels follow the official help pages linked
 * on each step. `lastReviewedAt` is set only where the official page was checked.
 *
 * Placeholders resolved at render time from Settings → Company → Integrations:
 * {{metaPartnerId}} {{googleAccessEmail}} {{googleAdsManagerId}} {{websiteAccessEmail}}
 * {{dnsAccessEmail}} {{crmAccessEmail}} {{shopifyCode}}
 */

const REVIEWED = "2026-10-15";

type Def = Omit<GuideStep, "id" | "platform" | "stepNumber">;
const steps = (platform: string, defs: Def[]): GuideStep[] => defs.map((d, i) => ({ ...d, id: `${platform}:${i + 1}`, platform, stepNumber: i + 1 }));
const ill = (x: GuideIllustration) => x;

const META_HELP = "https://www.facebook.com/business/help/1717412048538897";
const metaNav = ["Home", "Users", "  People", "  Partners", "  System users", "Accounts", "  Pages", "  Ad accounts", "Data sources", "  Datasets", "  Catalogs"];

export const GUIDE_PLATFORMS: Record<string, { label: string; officialSource: string }> = {
  meta: { label: "Meta · Partner access", officialSource: "Meta Business Help Center" },
  meta_create: { label: "Meta · Create a Business Portfolio", officialSource: "Meta Business Help Center" },
  google_ads: { label: "Google Ads", officialSource: "Google Ads Help" },
  ga4: { label: "Google Analytics 4", officialSource: "Google Analytics Help" },
  gtm: { label: "Google Tag Manager", officialSource: "Tag Manager Help" },
  search_console: { label: "Google Search Console", officialSource: "Search Console Help" },
  gbp: { label: "Google Business Profile", officialSource: "Google Business Profile Help" },
  youtube: { label: "YouTube", officialSource: "YouTube Help" },
  merchant_center: { label: "Google Merchant Center", officialSource: "Merchant Center Help" },
  wordpress: { label: "Website · WordPress", officialSource: "WordPress documentation" },
  shopify: { label: "Website · Shopify", officialSource: "Shopify Help Center" },
  webflow: { label: "Website · Webflow", officialSource: "Webflow Help Center" },
  wix: { label: "Website · Wix", officialSource: "Wix Help Center" },
  squarespace: { label: "Website · Squarespace", officialSource: "Squarespace Help Center" },
  website_custom: { label: "Website · Custom / Next.js", officialSource: "Madvert Labs" },
  cloudflare: { label: "DNS · Cloudflare", officialSource: "Cloudflare documentation" },
  godaddy: { label: "DNS · GoDaddy", officialSource: "GoDaddy Help" },
  namecheap: { label: "DNS · Namecheap", officialSource: "Namecheap Knowledgebase" },
  google_domains: { label: "DNS · Google Domains (now Squarespace Domains)", officialSource: "Squarespace Help Center" },
  hostinger: { label: "DNS · Hostinger", officialSource: "Hostinger Help Center" },
  gohighlevel: { label: "CRM · GoHighLevel", officialSource: "HighLevel Help" },
  hubspot: { label: "CRM · HubSpot", officialSource: "HubSpot Knowledge Base" },
  crm_generic: { label: "CRM · Other", officialSource: "Madvert Labs" },
  whatsapp: { label: "WhatsApp Business", officialSource: "WhatsApp Business" },
};

export const DEFAULT_GUIDES: GuideStep[] = [
  ...steps("meta", [
    {
      title: "Open Business Settings",
      instruction: "Go to business.facebook.com, choose your business portfolio and open Settings (the gear icon at the bottom left).",
      illustration: ill({ chrome: "Meta Business Suite", nav: ["Home", "Notifications", "Ads", "Content", "Inbox", "Insights", "Settings"], active: "Settings", title: "Business settings", rows: ["Business info", "Users", "Accounts", "Data sources"] }),
      externalHelpUrl: META_HELP,
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Select Partners",
      instruction: "Under Users, click Partners. If you cannot see Partners, you probably do not have full control of the portfolio: ask the person who does, or send this task to them.",
      illustration: ill({ chrome: "Business settings", nav: metaNav, active: "  Partners", title: "Partners", rows: ["No partners yet"] }),
      externalHelpUrl: META_HELP,
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Click Add",
      instruction: "Click Add, then choose “Give a partner access to your assets”.",
      illustration: ill({ chrome: "Business settings", nav: metaNav, active: "  Partners", title: "Partners", button: "Add", rows: ["Give a partner access to your assets", "Ask a partner to share their assets"] }),
      externalHelpUrl: META_HELP,
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Enter the Madvert Partner Business ID",
      instruction: "Paste the Madvert Labs partner business ID {{metaPartnerId}} and click Next.",
      illustration: ill({ chrome: "Business settings", nav: metaNav, active: "  Partners", title: "Give a partner access", field: { label: "Partner business ID", value: "{{metaPartnerId}}" }, button: "Next" }),
      externalHelpUrl: META_HELP,
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Select assets",
      instruction: "Choose each asset type on the left and tick the assets we work on: Facebook Page, Instagram account, Ad account, Pixel / Dataset and Catalog (if you sell products).",
      illustration: ill({ chrome: "Business settings", nav: ["Pages", "Ad accounts", "Instagram accounts", "Datasets", "Catalogs"], active: "Ad accounts", title: "Select assets", checks: ["Facebook Page", "Instagram account", "Ad account", "Pixel / Dataset", "Catalog"] }),
      externalHelpUrl: META_HELP,
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Assign permissions and confirm",
      instruction: "Give full control, or partial access that includes managing ads, content, messages and insights. Click Assign assets. If someone else with full control must approve, ask them to confirm.",
      illustration: ill({ chrome: "Business settings", nav: ["Pages", "Ad accounts", "Instagram accounts", "Datasets", "Catalogs"], active: "Ad accounts", title: "Partial access", checks: ["Manage campaigns", "View performance", "Manage creative hub mockups"], button: "Assign assets" }),
      externalHelpUrl: META_HELP,
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("meta_create", [
    {
      title: "Start at Meta Business Suite",
      instruction: "Go to business.facebook.com/overview and click Create an account. Use your own Facebook profile; Meta uses it only to confirm who you are.",
      illustration: ill({ chrome: "Meta Business Suite", nav: ["Overview"], title: "Create a business portfolio", button: "Create an account" }),
      externalHelpUrl: "https://www.facebook.com/business/help/1710077379203657",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Enter your business details",
      instruction: "Add your business name, your name and a business email address, then click Submit and confirm the email Meta sends you.",
      illustration: ill({ chrome: "Meta Business Suite", nav: ["Overview"], title: "Business details", field: { label: "Business portfolio name", value: "Your Business" }, button: "Submit" }),
      externalHelpUrl: "https://www.facebook.com/business/help/1710077379203657",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Add your Page and Instagram",
      instruction: "In Settings → Accounts, add your Facebook Page and connect Instagram. Then return here and follow the partner access steps.",
      illustration: ill({ chrome: "Business settings", nav: metaNav, active: "  Pages", title: "Pages", button: "Add" }),
      externalHelpUrl: "https://www.facebook.com/business/help/1710077379203657",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("google_ads", [
    {
      title: "Send us your Customer ID",
      instruction: "Sign in to Google Ads. Your 10 digit Customer ID is at the top right (e.g. 123-456-7890). Enter it below so we can send a link request from the Madvert manager account {{googleAdsManagerId}}.",
      illustration: ill({ chrome: "Google Ads", nav: ["Overview", "Campaigns", "Goals", "Tools", "Billing", "Admin"], title: "Account", field: { label: "Customer ID", value: "123-456-7890" } }),
      externalHelpUrl: "https://support.google.com/google-ads/answer/7459601",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Open Admin → Access and security",
      instruction: "Click Admin, then Access and security, and open the Managers tab.",
      illustration: ill({ chrome: "Google Ads", nav: ["Overview", "Campaigns", "Goals", "Tools", "Billing", "Admin"], active: "Admin", title: "Access and security", rows: ["Users", "Managers", "Security"] }),
      externalHelpUrl: "https://support.google.com/google-ads/answer/7459601",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Accept the Madvert Labs request",
      instruction: "Find the request from Madvert Labs ({{googleAdsManagerId}}) and click Accept. Only an Admin on the account can accept. Billing stays with you.",
      illustration: ill({ chrome: "Google Ads", nav: ["Overview", "Campaigns", "Goals", "Tools", "Billing", "Admin"], active: "Admin", title: "Managers", rows: ["Madvert Labs · {{googleAdsManagerId}} · Pending"], button: "Accept" }),
      externalHelpUrl: "https://support.google.com/google-ads/answer/7459601",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("ga4", [
    {
      title: "Open Admin → Access Management",
      instruction: "In Google Analytics, click Admin (bottom left). Under Account or Property, click Access Management. You need the Administrator role.",
      illustration: ill({ chrome: "Google Analytics", nav: ["Home", "Reports", "Explore", "Advertising", "Admin"], active: "Admin", title: "Admin", rows: ["Account settings", "Account access management", "Property settings", "Property access management"] }),
      externalHelpUrl: "https://support.google.com/analytics/answer/9305788",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Add the Madvert access email",
      instruction: "Click + then Add users. Enter {{googleAccessEmail}}, choose the Editor role (Administrator if we are managing tracking end to end) and click Add.",
      illustration: ill({ chrome: "Google Analytics", nav: ["Home", "Reports", "Explore", "Advertising", "Admin"], active: "Admin", title: "Add roles and data restrictions", field: { label: "Email address", value: "{{googleAccessEmail}}" }, checks: ["Editor"], button: "Add" }),
      externalHelpUrl: "https://support.google.com/analytics/answer/9305788",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("gtm", [
    {
      title: "Open Admin → User Management",
      instruction: "In Tag Manager, open your container, click Admin, then User Management in the Container column.",
      illustration: ill({ chrome: "Tag Manager", nav: ["Workspace", "Versions", "Admin"], active: "Admin", title: "Container", rows: ["Container settings", "User Management", "Import container"] }),
      externalHelpUrl: "https://support.google.com/tagmanager/answer/6107011",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Invite Madvert as Publish user",
      instruction: "Click Add (+), enter {{googleAccessEmail}}, set container permission to Publish and send the invitation.",
      illustration: ill({ chrome: "Tag Manager", nav: ["Workspace", "Versions", "Admin"], active: "Admin", title: "Add users", field: { label: "Email address", value: "{{googleAccessEmail}}" }, checks: ["Publish"], button: "Invite" }),
      externalHelpUrl: "https://support.google.com/tagmanager/answer/6107011",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("search_console", [
    {
      title: "Open Settings → Users and permissions",
      instruction: "In Search Console select your property, then Settings → Users and permissions. This page is only visible to property owners.",
      illustration: ill({ chrome: "Search Console", nav: ["Overview", "Performance", "URL inspection", "Pages", "Sitemaps", "Settings"], active: "Settings", title: "Settings", rows: ["Ownership verification", "Users and permissions", "Associations"] }),
      externalHelpUrl: "https://support.google.com/webmasters/answer/7687615",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Add user with Full permission",
      instruction: "Click Add user, enter {{googleAccessEmail}}, choose Full and click Add.",
      illustration: ill({ chrome: "Search Console", nav: ["Overview", "Performance", "URL inspection", "Pages", "Sitemaps", "Settings"], active: "Settings", title: "Add user", field: { label: "Email address", value: "{{googleAccessEmail}}" }, checks: ["Full"], button: "Add" }),
      externalHelpUrl: "https://support.google.com/webmasters/answer/7687615",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("gbp", [
    {
      title: "Open Business Profile settings",
      instruction: "Search for your business name on Google while signed in, open the menu (⋮) and choose Business Profile settings → People and access.",
      illustration: ill({ chrome: "Your business on Google", nav: ["Edit profile", "Read reviews", "Performance", "Settings"], active: "Settings", title: "Business Profile settings", rows: ["People and access", "Business Profile ID", "Advanced settings"] }),
      externalHelpUrl: "https://support.google.com/business/answer/3403100",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Add Madvert as Manager",
      instruction: "Click Add, enter {{googleAccessEmail}}, choose Manager and click Invite. Only owners can add users.",
      illustration: ill({ chrome: "Your business on Google", nav: ["Edit profile", "Read reviews", "Performance", "Settings"], active: "Settings", title: "Add new user", field: { label: "Name or email", value: "{{googleAccessEmail}}" }, checks: ["Manager"], button: "Invite" }),
      externalHelpUrl: "https://support.google.com/business/answer/3403100",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("youtube", [
    {
      title: "Open Studio → Settings → Permissions",
      instruction: "Go to studio.youtube.com, click Settings, then Permissions.",
      illustration: ill({ chrome: "YouTube Studio", nav: ["Dashboard", "Content", "Analytics", "Comments", "Settings"], active: "Settings", title: "Settings", rows: ["General", "Channel", "Upload defaults", "Permissions"] }),
      externalHelpUrl: "https://support.google.com/youtube/answer/9481328",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Invite Madvert as Manager or Editor",
      instruction: "Click Invite, enter {{googleAccessEmail}}, choose Manager (or Editor for uploads only) and click Save. Invitations expire after 30 days.",
      illustration: ill({ chrome: "YouTube Studio", nav: ["Dashboard", "Content", "Analytics", "Comments", "Settings"], active: "Settings", title: "Invite", field: { label: "Email", value: "{{googleAccessEmail}}" }, checks: ["Manager"], button: "Done" }),
      externalHelpUrl: "https://support.google.com/youtube/answer/9481328",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("merchant_center", [
    {
      title: "Open Settings → People and access",
      instruction: "In Merchant Center, click the gear icon, then People and access.",
      illustration: ill({ chrome: "Merchant Center", nav: ["Overview", "Products", "Marketing", "Performance", "Settings"], active: "Settings", title: "Access and services", rows: ["People and access", "Apps and services", "Business info"] }),
      externalHelpUrl: "https://support.google.com/merchants/answer/12160472",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Add Madvert as Standard user",
      instruction: "Click Add person, enter {{googleAccessEmail}}, choose Standard access and save.",
      illustration: ill({ chrome: "Merchant Center", nav: ["Overview", "Products", "Marketing", "Performance", "Settings"], active: "Settings", title: "Add person", field: { label: "Email", value: "{{googleAccessEmail}}" }, checks: ["Standard"], button: "Add person" }),
      externalHelpUrl: "https://support.google.com/merchants/answer/12160472",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("wordpress", [
    {
      title: "Open Users → Add New User",
      instruction: "Log in to your WordPress dashboard (yoursite.com/wp-admin) and go to Users → Add New User.",
      illustration: ill({ chrome: "WordPress", nav: ["Dashboard", "Posts", "Media", "Pages", "Appearance", "Plugins", "Users", "Settings"], active: "Users", title: "Users", button: "Add New User" }),
      externalHelpUrl: "https://wordpress.org/documentation/article/users-add-new-screen/",
    },
    {
      title: "Create an Administrator for Madvert",
      instruction: "Username: madvert. Email: {{websiteAccessEmail}}. Role: Administrator. Tick “Send the new user an email” so we set our own password. You never need to share yours.",
      illustration: ill({ chrome: "WordPress", nav: ["Dashboard", "Posts", "Media", "Pages", "Appearance", "Plugins", "Users", "Settings"], active: "Users", title: "Add New User", field: { label: "Email", value: "{{websiteAccessEmail}}" }, checks: ["Role: Administrator", "Send the new user an email"], button: "Add New User" }),
      externalHelpUrl: "https://wordpress.org/documentation/article/users-add-new-screen/",
    },
  ]),
  ...steps("shopify", [
    {
      title: "Share your store address",
      instruction: "Enter your myshopify.com address below. Madvert sends a collaborator request from our Shopify Partner account, so we never need your password.",
      illustration: ill({ chrome: "Shopify admin", nav: ["Home", "Orders", "Products", "Customers", "Content", "Analytics", "Marketing", "Online Store", "Settings"], active: "Settings", title: "Store details", field: { label: "Store address", value: "your-store.myshopify.com" } }),
      externalHelpUrl: "https://help.shopify.com/en/manual/your-account/staff-accounts/collaborator-accounts",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Collaborator request code (if set)",
      instruction: "If your store uses a collaborator request code (Settings → Users → Security), enter it below.",
      illustration: ill({ chrome: "Shopify admin", nav: ["Home", "Orders", "Products", "Customers", "Settings"], active: "Settings", title: "Users → Security", rows: ["Collaborators", "Anyone can send a collaborator request", "Only people with a collaborator request code"] }),
      externalHelpUrl: "https://help.shopify.com/en/manual/your-account/staff-accounts/collaborator-accounts",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Approve the request",
      instruction: "You will get an email and a notification on Shopify Home. Review the requested permissions and click Accept.",
      illustration: ill({ chrome: "Shopify admin", nav: ["Home", "Orders", "Products", "Customers", "Settings"], active: "Home", title: "Collaborator request", rows: ["Madvert Labs wants to access your store"], button: "Accept request" }),
      externalHelpUrl: "https://help.shopify.com/en/manual/your-account/staff-accounts/collaborator-accounts",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("webflow", [
    {
      title: "Invite Madvert to your Workspace or site",
      instruction: "In the Webflow dashboard open your Workspace settings → Members (or the site's Settings → Members on Site plans) and invite {{websiteAccessEmail}} as a Designer / guest.",
      illustration: ill({ chrome: "Webflow", nav: ["Sites", "Workspace settings", "Members", "Billing"], active: "Members", title: "Invite members", field: { label: "Email", value: "{{websiteAccessEmail}}" }, button: "Send invite" }),
      externalHelpUrl: "https://help.webflow.com/",
    },
  ]),
  ...steps("wix", [
    {
      title: "Invite a collaborator",
      instruction: "In your Wix dashboard go to Settings → Roles & Permissions, click Invite People, enter {{websiteAccessEmail}} and choose Admin (Co-Owner not required).",
      illustration: ill({ chrome: "Wix dashboard", nav: ["Home", "Sales", "Apps", "Site & Mobile App", "Settings"], active: "Settings", title: "Roles & Permissions", field: { label: "Email", value: "{{websiteAccessEmail}}" }, button: "Send invite" }),
      externalHelpUrl: "https://support.wix.com/en/article/inviting-people-to-contribute-to-your-site",
    },
  ]),
  ...steps("squarespace", [
    {
      title: "Invite a contributor",
      instruction: "Open Settings → Permissions & ownership, click Invite contributor, enter {{websiteAccessEmail}} and give Administrator (or Website Editor) permission.",
      illustration: ill({ chrome: "Squarespace", nav: ["Website", "Selling", "Marketing", "Analytics", "Settings"], active: "Settings", title: "Permissions & ownership", field: { label: "Email", value: "{{websiteAccessEmail}}" }, button: "Invite" }),
      externalHelpUrl: "https://support.squarespace.com/hc/en-us/articles/206537167",
    },
  ]),
  ...steps("website_custom", [
    {
      title: "Tell us who built it",
      instruction: "For custom and Next.js websites we need developer or admin access: repository (GitHub, GitLab, Bitbucket), hosting (e.g. Vercel, Netlify, AWS) and the CMS if there is one. If a developer manages it, send this task to them.",
      illustration: ill({ chrome: "Hosting dashboard", nav: ["Projects", "Deployments", "Domains", "Team", "Settings"], active: "Team", title: "Invite member", field: { label: "Email", value: "{{websiteAccessEmail}}" }, button: "Invite" }),
    },
  ]),
  ...steps("cloudflare", [
    {
      title: "Open Manage Account → Members",
      instruction: "In the Cloudflare dashboard, go to Manage Account → Members. You need the Super Administrator role.",
      illustration: ill({ chrome: "Cloudflare", nav: ["Account home", "Websites", "Analytics", "Manage Account", "  Members", "  Audit log"], active: "  Members", title: "Members", button: "Invite" }),
      externalHelpUrl: "https://developers.cloudflare.com/fundamentals/manage-members/manage/",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Invite Madvert with DNS permissions",
      instruction: "Click Invite, enter {{dnsAccessEmail}}, scope it to your domain, choose the DNS role (or Administrator) and confirm.",
      illustration: ill({ chrome: "Cloudflare", nav: ["Account home", "Websites", "Analytics", "Manage Account", "  Members"], active: "  Members", title: "Invite members", field: { label: "Email", value: "{{dnsAccessEmail}}" }, checks: ["DNS"], button: "Continue to summary" }),
      externalHelpUrl: "https://developers.cloudflare.com/fundamentals/manage-members/manage/",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("godaddy", [
    {
      title: "Open Delegate Access",
      instruction: "Sign in to GoDaddy, open your name (top right) → Account Settings → Delegate Access.",
      illustration: ill({ chrome: "GoDaddy", nav: ["My Products", "Domains", "Account Settings", "  Delegate Access"], active: "  Delegate Access", title: "People who can access my account", button: "Invite to Access" }),
      externalHelpUrl: "https://www.godaddy.com/help/invite-a-delegate-to-access-my-godaddy-account-12376",
      lastReviewedAt: REVIEWED,
    },
    {
      title: "Invite Madvert as Domains Only",
      instruction: "Click Invite to Access, enter Madvert Labs and {{dnsAccessEmail}}, choose “Products & Domains” (or “Domains Only”) and send. Delegates never see your payment methods or password.",
      illustration: ill({ chrome: "GoDaddy", nav: ["My Products", "Domains", "Account Settings", "  Delegate Access"], active: "  Delegate Access", title: "Invite to Access", field: { label: "Email", value: "{{dnsAccessEmail}}" }, checks: ["Products & Domains"], button: "Invite" }),
      externalHelpUrl: "https://www.godaddy.com/help/invite-a-delegate-to-access-my-godaddy-account-12376",
      lastReviewedAt: REVIEWED,
    },
  ]),
  ...steps("namecheap", [
    {
      title: "Share access to the domain",
      instruction: "In Namecheap open Domain List, click Manage next to your domain, then Sharing & Transfer → Share Access. Invite {{dnsAccessEmail}} with DNS management permissions.",
      illustration: ill({ chrome: "Namecheap", nav: ["Dashboard", "Domain List", "Hosting List", "Profile"], active: "Domain List", title: "Sharing & Transfer", field: { label: "Username or email", value: "{{dnsAccessEmail}}" }, button: "Share" }),
      externalHelpUrl: "https://www.namecheap.com/support/knowledgebase/",
    },
  ]),
  ...steps("google_domains", [
    {
      title: "Google Domains moved to Squarespace",
      instruction: "Google Domains registrations are now managed in Squarespace Domains. Sign in at domains.squarespace.com with the same Google account, open the domain → Permissions and invite {{dnsAccessEmail}}.",
      illustration: ill({ chrome: "Squarespace Domains", nav: ["Domains", "DNS", "Permissions", "Billing"], active: "Permissions", title: "Domain permissions", field: { label: "Email", value: "{{dnsAccessEmail}}" }, button: "Invite" }),
      externalHelpUrl: "https://support.squarespace.com/hc/en-us",
    },
  ]),
  ...steps("hostinger", [
    {
      title: "Grant access in hPanel",
      instruction: "In Hostinger hPanel open your profile → Account sharing, click Grant access, enter {{dnsAccessEmail}} and give access to Domains / DNS.",
      illustration: ill({ chrome: "Hostinger hPanel", nav: ["Home", "Websites", "Domains", "Emails", "Account sharing"], active: "Account sharing", title: "Grant access", field: { label: "Email", value: "{{dnsAccessEmail}}" }, button: "Grant access" }),
      externalHelpUrl: "https://support.hostinger.com/",
    },
  ]),
  ...steps("gohighlevel", [
    {
      title: "Add Madvert as a user",
      instruction: "In your HighLevel sub-account, go to Settings → My Staff (Team) → Add Employee. Enter {{crmAccessEmail}}, set role to Admin and save.",
      illustration: ill({ chrome: "HighLevel", nav: ["Dashboard", "Conversations", "Contacts", "Opportunities", "Automation", "Settings"], active: "Settings", title: "My Staff", field: { label: "Email", value: "{{crmAccessEmail}}" }, checks: ["Admin"], button: "Save" }),
      externalHelpUrl: "https://help.gohighlevel.com/",
    },
  ]),
  ...steps("hubspot", [
    {
      title: "Invite Madvert as a user",
      instruction: "In HubSpot click the settings icon → Users & Teams → Create user. Enter {{crmAccessEmail}} and give Super Admin or the permissions your plan requires.",
      illustration: ill({ chrome: "HubSpot", nav: ["Contacts", "Marketing", "Sales", "Automations", "Settings"], active: "Settings", title: "Users & Teams", field: { label: "Email", value: "{{crmAccessEmail}}" }, button: "Create user" }),
      externalHelpUrl: "https://knowledge.hubspot.com/user-management/add-and-remove-users",
    },
  ]),
  ...steps("crm_generic", [
    {
      title: "Invite Madvert as an admin user",
      instruction: "Most CRMs have a Users or Team area in settings. Invite {{crmAccessEmail}} as an admin. If that is not possible, tell us below and we will sort it out during kickoff.",
      illustration: ill({ chrome: "CRM settings", nav: ["Contacts", "Deals", "Reports", "Settings", "  Users"], active: "  Users", title: "Invite user", field: { label: "Email", value: "{{crmAccessEmail}}" }, button: "Invite" }),
    },
  ]),
  ...steps("whatsapp", [
    {
      title: "Use a dedicated number",
      instruction: "Choose a number that is only used for the business (a new SIM or virtual number). Do not use a personal number you also use on regular WhatsApp.",
      illustration: ill({ chrome: "WhatsApp Business", nav: ["Chats", "Updates", "Tools", "Settings"], active: "Settings", title: "Business profile", field: { label: "Business number", value: "+971 ••• ••• ••••" } }),
      externalHelpUrl: "https://business.whatsapp.com/",
    },
    {
      title: "Install WhatsApp Business and verify",
      instruction: "Install the WhatsApp Business app, register the number and complete your business profile (name, category, hours, website). If we connect it to the WhatsApp Business Platform later, we will guide you during kickoff.",
      illustration: ill({ chrome: "WhatsApp Business", nav: ["Chats", "Updates", "Tools", "Settings"], active: "Tools", title: "Business tools", rows: ["Business profile", "Catalog", "Greeting message", "Away message", "Labels"] }),
      externalHelpUrl: "https://business.whatsapp.com/",
    },
  ]),
];

export function guidePlatformFor(accessKey: string, details: Record<string, unknown> = {}): string | null {
  switch (accessKey) {
    case "meta":
      return details.has_portfolio === "No" ? "meta_create" : "meta";
    case "website": {
      const p = String(details.platform ?? "");
      return (
        ({ WordPress: "wordpress", Shopify: "shopify", Webflow: "webflow", Wix: "wix", Squarespace: "squarespace", Custom: "website_custom", "Next.js": "website_custom" } as Record<string, string>)[p] ?? null
      );
    }
    case "domain": {
      const r = String(details.registrar ?? "");
      return ({ Cloudflare: "cloudflare", GoDaddy: "godaddy", Namecheap: "namecheap", Google: "google_domains", Hostinger: "hostinger" } as Record<string, string>)[r] ?? null;
    }
    case "crm": {
      const c = String(details.crm ?? "");
      if (c === "GoHighLevel") return "gohighlevel";
      if (c === "HubSpot") return "hubspot";
      if (["Salesforce", "Zoho", "Pipedrive", "Custom CRM"].includes(c)) return "crm_generic";
      return null;
    }
    case "whatsapp":
      return details.has_number === "No" ? "whatsapp" : null;
    case "google_ads":
    case "ga4":
    case "gtm":
    case "search_console":
    case "gbp":
    case "youtube":
    case "merchant_center":
      return accessKey;
    default:
      return null;
  }
}
