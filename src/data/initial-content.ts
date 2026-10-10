import type { Article, GalleryImage } from "@/lib/content";

export const initialArticles: Article[] = [
  {
    id: "plan-your-study-abroad-application",
    slug: "plan-your-study-abroad-application",
    title: "How to plan your study abroad application",
    category: "Study abroad",
    excerpt:
      "Turn your ambitions into an organised application plan, from course research and document preparation to funding and departure.",
    coverUrl: "/images/dlfly-study.jpg",
    published: true,
    body: "## Start with your goals\nThink about the subject you enjoy, the skills you want to develop, and how an international qualification fits your longer-term plans. Share your academic background, preferred destinations and budget with your advisor.\n\n## Build a focused shortlist\nCompare course modules, entry requirements, tuition, living costs and application deadlines using each institution’s official information. A useful shortlist includes options that fit both your profile and your finances.\n\n## Organise your application documents\nPrepare your academic records, passport, a statement of purpose, references and any language test evidence requested by the institution. Requirements differ by course, so work from the university’s own checklist.\n\n## Plan funding alongside admissions\nEstimate tuition, accommodation, travel and day-to-day expenses. If you are considering an education loan, start gathering lender documents while your admissions applications are underway.\n\n## Prepare for the next stage\nOnce you receive an offer, review its conditions and payment deadlines. Your destination’s official immigration website is the source for current student visa requirements. Arrange accommodation, travel and essential arrival documents only after checking what applies to you.\n\n## Speak with DLFLY Overseas\nOur team can help you organise the sequence, identify questions to ask institutions and build a practical preparation checklist. Call +91 6304636998 to discuss your plans.",
  },
  {
    id: "organise-your-visa-documents",
    slug: "organise-your-visa-documents",
    title: "A practical way to organise your visa documents",
    category: "Visa guidance",
    excerpt:
      "Build a destination-specific checklist, keep your information consistent, and prepare carefully for the stages of your application.",
    coverUrl: "/images/dlfly-visa.jpg",
    published: true,
    body: "## Identify the right application route\nYour purpose of travel determines the visa route you need to research. Start with the destination’s official immigration website and confirm that the information applies to your circumstances.\n\n## Create one checklist\nList the forms, identity documents, financial records and supporting evidence requested for your route. Note which documents need translation or certification and how recent they must be.\n\n## Check consistency\nReview names, dates, passport details and the information in your application against the supporting documents. Explain genuine differences using the approach required by the relevant authority.\n\n## Plan appointments and timelines\nCheck the official process for fees, biometrics, interviews and submission. Processing times can vary, so keep a realistic timeline and avoid treating an estimate as a confirmed decision date.\n\n## Prepare for an interview if required\nBe ready to explain your plans clearly and truthfully. Bring the requested documents and understand the information you have submitted.\n\n## Get organised with our team\nDLFLY Overseas supports document organisation and preparation. Decisions remain with the relevant authorities; no advisor can guarantee a visa outcome.",
  },
  {
    id: "plan-your-overseas-study-budget",
    slug: "plan-your-overseas-study-budget",
    title: "Planning an overseas study budget before applying for a loan",
    category: "Education loans",
    excerpt:
      "Understand your expected costs and compare lender terms carefully before committing to education finance.",
    coverUrl: "/images/dlfly-finance.jpg",
    published: true,
    body: "## Look beyond tuition\nBuild an estimate that includes course fees, accommodation, living expenses, travel, insurance and any institution-specific charges. Use the university’s official cost information as your starting point.\n\n## Identify your funding sources\nConsider family contributions, available savings, eligible scholarships and any loan amount you may need. Check scholarship terms directly with the awarding institution.\n\n## Prepare the documents a lender requests\nLenders may ask for academic records, an admission offer, identity and address evidence, and financial information from an applicant or co-applicant. Obtain the lender’s own checklist because requirements differ.\n\n## Compare the complete terms\nAsk each lender about the interest structure, fees, security requirements, repayment schedule and disbursement conditions. Request written terms and clarify anything you do not understand before signing.\n\n## Coordinate the timelines\nKeep university deposit deadlines, loan processing and visa preparation in one plan. A loan decision and its terms are determined by the lender.\n\n## Discuss your checklist\nOur team can help organise your study cost estimate and the questions you need to ask lenders. Contact DLFLY Overseas on +91 6304636998.",
  },
];

export const initialGallery: GalleryImage[] = [
  {
    id: "study-planning",
    title: "Explore international education",
    imageUrl: "/images/dlfly-study.jpg",
    alt: "Students walking together through a university campus",
    caption: "Explore courses, campuses and the preparation behind an international study plan.",
    published: true,
  },
  {
    id: "visa-planning",
    title: "Prepare your next step",
    imageUrl: "/images/dlfly-visa.jpg",
    alt: "An advisor and student reviewing application documents",
    caption: "A clear checklist helps bring your application preparation into focus.",
    published: true,
  },
  {
    id: "education-finance",
    title: "Plan education finance",
    imageUrl: "/images/dlfly-finance.jpg",
    alt: "A family reviewing an overseas education budget",
    caption: "Connect your study goals with a practical plan for the costs ahead.",
    published: true,
  },
];
