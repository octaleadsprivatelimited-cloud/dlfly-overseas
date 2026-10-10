export const studyDestinations = [
  { code: "gb", name: "United Kingdom" },
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "nz", name: "New Zealand" },
  { code: "sk", name: "Slovakia" },
  { code: "ie", name: "Ireland" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "it", name: "Italy" },
  { code: "nl", name: "Netherlands" },
  { code: "at", name: "Austria" },
  { code: "ch", name: "Switzerland" },
  { code: "mt", name: "Malta" },
] as const;

export function destinationEnquiryLink(country: string) {
  const message = `Hi DLFLY Overseas, I would like guidance on studying in ${country}. Please help me explore courses and application steps.`;
  return `https://wa.me/916304636998?text=${encodeURIComponent(message)}`;
}
