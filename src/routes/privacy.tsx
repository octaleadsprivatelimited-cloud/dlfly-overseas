import { createFileRoute } from "@tanstack/react-router";
import { PageBanner, SiteLayout } from "@/components/dlfly-site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead(
      "Website Privacy | DLFLY Overseas",
      "Learn how DLFLY Overseas uses website analytics, contact links and embedded media.",
      "/privacy",
    ),
  component: PrivacyPage,
});
function PrivacyPage() {
  return (
    <SiteLayout>
      <PageBanner
        eyebrow="Website privacy"
        title="Your choices matter."
        description="Understand the services used by this website and how to manage your analytics preferences."
      />
      <section>
        <div className="article-content mx-auto max-w-4xl px-5 py-14 sm:px-6">
          <h2>Contacting our team</h2>
          <p>
            Calling, emailing or opening WhatsApp takes you to the relevant service. Information you
            choose to share through those services is used to respond to your enquiry. This website
            does not ask you to upload passport, financial or application documents.
          </p>
          <h2>Website enquiry form</h2>
          <p>
            The enquiry form asks for your name, email, phone number, service interest, preferred
            destination and message. With your agreement, we store these details in Google Firebase
            to respond to your enquiry. Submissions and follow-up notes are accessible only through
            the company’s restricted admin account. Please leave out sensitive documents and
            identification or financial details. Contact our team if you want your enquiry removed.
          </p>
          <p>
            Form fields are masked for Microsoft Clarity. If you allow analytics, a successful
            submission sends a completion event and the public page path. Your name, contact
            details, destination and message are not included in this analytics event.
          </p>
          <h2>Optional website analytics</h2>
          <p>
            When configured, Google Analytics 4 and Microsoft Clarity help us understand how
            visitors use public pages. These scripts load only after you allow analytics. Admin
            pages do not initialise analytics. Public page views and contact-button clicks help us
            understand which guidance visitors use. Page-view URLs omit query strings and fragments.
            Use “Cookie preferences” in the footer to change your choice.
          </p>
          <h2>Maps and videos</h2>
          <p>
            The contact page includes Google Maps. The video library loads YouTube’s
            privacy-enhanced player when you choose to play a video. These external services may
            receive technical information such as your IP address and apply their own privacy
            policies.
          </p>
          <h2>Admin sign-in</h2>
          <p>
            Website administration uses Google sign-in through Firebase. Access to content
            management is restricted to the company’s designated verified Google account. Session
            data is used to maintain that sign-in.
          </p>
          <h2>Questions or requests</h2>
          <p>
            Contact <a href="mailto:dlflyoverseas@gmail.com">dlflyoverseas@gmail.com</a> with
            questions about information shared with our team or this website.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
