export type ComplianceMode = {
  enabled: boolean;
};

export function canSendOutbound(mode: ComplianceMode) {
  return !mode.enabled;
}
