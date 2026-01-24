export const stageChecklist: Record<string, { title: string; description?: string }[]> = {
  PROSPECT_IDENTIFIED: [
    { title: "Confirm ICP fit", description: "Validate industry and urgency signals" }
  ],
  ENRICHED: [{ title: "Verify contact info", description: "Confirm email + LinkedIn" }],
  OUTREACH_SENT: [{ title: "Log outreach sequence", description: "Email + LinkedIn touch" }],
  DISCOVERY_SCHEDULED: [{ title: "Prepare discovery agenda" }],
  DISCOVERY_COMPLETED: [{ title: "Summarize discovery notes" }],
  OFFER_PRESENTED: [{ title: "Share offer recap" }],
  PROPOSAL_SENT: [{ title: "Schedule proposal review" }],
  CLOSED_WON: [{ title: "Kickoff delivery" }],
  CLOSED_LOST: [{ title: "Log loss reason" }],
  DELIVERY_IN_PROGRESS: [{ title: "Share milestone updates" }],
  DELIVERY_COMPLETE: [{ title: "Request testimonial + referral" }]
};

export function getChecklistForStage(stage: keyof typeof stageChecklist) {
  return stageChecklist[stage] ?? [];
}
