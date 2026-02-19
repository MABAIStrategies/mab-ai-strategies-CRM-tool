import { notFound } from "next/navigation";
import { prisma } from "../../../../../src/lib/db";
import { ContactForm } from "../../components/contact-form";

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const contact = await prisma.contact.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Edit contact</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Refine relationship intelligence</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Keep every stakeholder profile updated for precision outreach and compliance.
        </p>
      </header>
      <ContactForm
        initialData={{
          id: contact.id,
          companyId: contact.companyId,
          name: contact.name,
          title: contact.title ?? "",
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          linkedinUrl: contact.linkedinUrl ?? "",
          relationshipStrength: String(contact.relationshipStrength)
        }}
      />
    </div>
  );
}
