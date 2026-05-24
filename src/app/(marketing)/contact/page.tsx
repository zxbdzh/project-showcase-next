import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { ContactForm } from "./contact-form";
import { getSocialLinks } from "@/features/social-links/queries";

export const metadata: Metadata = {
  title: "联系",
  description: "与我取得联系,讨论合作、技术交流或工作机会。",
};

export default async function ContactPage() {
  const socialLinks = await getSocialLinks();

  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-[640px]">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">联系我</h1>
          <p className="text-muted-foreground mt-4 text-lg">
            有项目合作、技术交流或工作机会?欢迎留言或通过以下方式联系。
          </p>
        </FadeIn>

        {socialLinks.length > 0 && (
          <FadeIn delay={0.08}>
            <div className="mt-8 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/60 bg-card hover:border-brand/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.16}>
          <div className="border-border/60 mt-12 border-t pt-12">
            <h2 className="text-xl font-semibold tracking-tight">发送留言</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
