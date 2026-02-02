import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const westbridge = await prisma.company.create({
    data: {
      name: "Westbridge Capital",
      domain: "westbridgecap.com",
      industry: "Financial Services",
      region: "North America",
      icpTags: ["Compliance", "Enterprise"],
      riskFlags: ["Data residency"],
      notesSummary: "Priority prospect focused on compliance automation"
    }
  });

  const brightline = await prisma.company.create({
    data: {
      name: "Brightline Logistics",
      domain: "brightlinelogistics.com",
      industry: "Logistics",
      region: "North America",
      icpTags: ["Automation", "Operations"],
      riskFlags: [],
      notesSummary: "Looking for AI-driven reporting"
    }
  });

  const margo = await prisma.contact.create({
    data: {
      companyId: westbridge.id,
      name: "Margo Lee",
      title: "VP Operations",
      email: "margo@westbridgecap.com",
      relationshipStrength: 78
    }
  });

  const liam = await prisma.contact.create({
    data: {
      companyId: brightline.id,
      name: "Liam Chen",
      title: "Director of Ops",
      email: "liam@brightlinelogistics.com",
      relationshipStrength: 64
    }
  });

  const deal1 = await prisma.deal.create({
    data: {
      companyId: westbridge.id,
      primaryContactId: margo.id,
      stage: "DISCOVERY_COMPLETED",
      offerType: "IMPLEMENTATION",
      probability: 62,
      momentumScore: 92
    }
  });

  await prisma.deal.create({
    data: {
      companyId: brightline.id,
      primaryContactId: liam.id,
      stage: "DISCOVERY_SCHEDULED",
      offerType: "BLUEPRINT",
      probability: 48,
      momentumScore: 76
    }
  });

  await prisma.note.create({
    data: {
      companyId: westbridge.id,
      dealId: deal1.id,
      rawText: "Discovery call recap: compliance automation urgency, CFO wants ROI model.",
      tags: ["discovery", "compliance"]
    }
  });

  await prisma.asset.create({
    data: {
      type: "ONE_PAGER",
      title: "Compliance Automation One-Pager",
      description: "Executive summary of compliance automation benefits",
      tags: ["Compliance", "ROI"],
      version: "2.1",
      status: "APPROVED",
      storageUri: "/assets/compliance-one-pager.pdf"
    }
  });

  await prisma.template.create({
    data: {
      name: "Proposal Outline",
      description: "Standard proposal outline",
      variablesSchema: { sections: ["Context", "ROI", "Scope"] },
      prompt: "Generate a proposal outline for {{company}}",
      outputType: "PROPOSAL"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
