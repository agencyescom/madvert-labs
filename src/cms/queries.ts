const image = `{ "url": asset->url, "alt": coalesce(alt, ""), "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;
const seo = `seo{ title, description }`;

export const caseStudyFields = `
  "slug": slug.current, title, "client": client->name, industry, market, categories, services,
  summary, problem, diagnosis, move, strategy, execution, creative, system, result, learned,
  metrics[]{ label, value, context },
  "testimonial": testimonial->{ "id": _id, quote, name, role, company, videoUrl },
  videoUrl, "featuredImage": featuredImage${image}, "gallery": gallery[]${image},
  publishedAt, ${seo}
`;

export const queries = {
  caseStudies: `*[_type == "caseStudy" && defined(slug.current)] | order(publishedAt desc){ ${caseStudyFields} }`,
  caseStudy: `*[_type == "caseStudy" && slug.current == $slug][0]{ ${caseStudyFields} }`,
  resources: `*[_type == "resource" && defined(slug.current)] | order(featured desc, title asc){
    "slug": slug.current, title, kind, category, description, outline, gating,
    "fileUrl": file.asset->url, externalUrl, "relatedService": relatedService->route, featured,
    "cover": cover${image}, ${seo}
  }`,
  testimonials: `*[_type == "testimonial" && permission == true] | order(order asc){ "id": _id, quote, name, role, company, videoUrl }`,
  team: `*[_type == "teamMember"] | order(order asc){ name, role, bio, "photo": photo${image} }`,
  faqs: `*[_type == "faq" && $scope in scopes] | order(order asc){ "q": question, "a": answer }`,
  portfolio: `*[_type == "portfolioProject"] | order(order asc){ "slug": slug.current, title, format, "client": client->name, videoUrl, "poster": poster${image} }`,
  settings: `*[_type == "siteSettings"][0]{
    "founderPhoto": founderPhoto${image}, "heroImage": heroImage${image},
    showreelUrl, "showreelPoster": showreelPoster${image},
    "clientLogos": *[_type == "client" && showLogo == true] | order(order asc){ name, "logo": logo${image} },
    "certifications": certifications[]{ name, "image": image${image} }
  }`,
  proof: `*[_type == "proofItem"] | order(order asc){ kind, label, caption, "image": image${image} }`,
};
