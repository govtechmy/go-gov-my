import z from "@/lib/zod";

export const DomainSchema = z.object({
  id: z.string().describe("The unique identifier of the domain."),
  slug: z
    .string()
    .describe("The domain name.")
    .openapi({ example: "acme.com" }),
  verified: z
    .boolean()
    .default(false)
    .describe("Whether the domain is verified."),
  primary: z
    .boolean()
    .default(false)
    .describe("Whether the domain is the primary domain for the workspace."),
  archived: z
    .boolean()
    .describe("Whether the domain is archived.")
    .default(false),
  placeholder: z
    .string()
    .describe(
      "Provide context to your teammates in the link creation modal by showing them an example of a link to be shortened.",
    )
    .default("https://dub.co/help/article/what-is-dub")
    .openapi({ example: "https://dub.co/help/article/what-is-dub" }),
  expiredUrl: z
    .string()
    .nullable()
    .describe(
      "The URL to redirect to when a link under this domain has expired.",
    )
    .openapi({ example: "https://acme.com/expired" }),
  target: z
    .string()
    .nullable()
    .describe(
      "The page your users will get redirected to when they visit your domain.",
    )
    .openapi({ example: "https://acme.com/landing" }),
  type: z
    .string()
    .describe("The type of redirect to use for this domain.")
    .openapi({ enum: ["redirect", "rewrite"] }),
  clicks: z.number().describe("The number of clicks on the domain.").default(0),
});
