import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "madvert-labs",
  title: "Madvert Labs",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem().title("Site Settings").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.listItem().title("Calendar Settings").id("calendarSettings").child(S.document().schemaType("calendarSettings").documentId("calendarSettings")),
            S.listItem().title("Navigation").id("navigation").child(S.document().schemaType("navigation").documentId("navigation")),
            S.listItem().title("Footer").id("footer").child(S.document().schemaType("footer").documentId("footer")),
            S.divider(),
            ...S.documentTypeListItems().filter((i) => !["siteSettings", "calendarSettings", "navigation", "footer"].includes(i.getId() ?? "")),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
