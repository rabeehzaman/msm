# Mahallu Management System: complete product feature specification

**A comprehensive SaaS/ERP platform to digitize every operational dimension of local mosque communities (Mahallu) — from family registration through financial management, Madrasa education, lifecycle events, and community welfare — serving Kerala/India and Saudi Arabia contexts.** This specification draws on analysis of 18+ existing mosque management products (MOHID, Masajid Manager, ConnectMazjid, Masjid Solutions, MahalluApp, MAS, MinarSoft, and others), community membership SaaS best practices, Islamic school management systems (Ilmify, Muntazim, MadrasaSIMS, Dugsi), and Indian regulatory frameworks (FCRA, 80G, 12AB, Waqf Act). The market has **47 mosque management startups globally** but none offers end-to-end coverage across all the modules below — the single biggest gap is a unified system that combines Kerala's Mahallu administrative workflows with comprehensive Madrasa management, Islamic financial compliance, and lifecycle event tracking.

---

## Module 1: Family and member management

The foundational module stores every household and individual in the Mahallu's jurisdiction, organized by geographic wards. **Kerala's Mahallu system uniquely structures communities by household** rather than individual membership, making the family unit the primary organizational entity.

### 1.1 Household registration and profiles

Each household record includes: house number (Mahallu-assigned), family name, ward/area assignment, physical address with GPS coordinates, property ownership status, ration card number, and registration date. The head of family serves as the primary contact with full name, date of birth, Aadhaar number, mobile number, email, occupation, employer, monthly income range, educational qualification, blood group, passport details (critical for Kerala's Gulf diaspora), and photograph. **Every family member** gets an individual profile with the same demographic fields plus relationship to head, marital status, and a unique member ID. The system should support family tree visualization showing multi-generational relationships within and across households.

### 1.2 Member categorization and lifecycle tracking

Members carry status labels: Active, Inactive, Transferred Out, Transferred In, Deceased, NRI (Non-Resident), and Banned/Suspended. Special categorization flags include: orphan, widow, differently-abled, below poverty line (BPL), senior citizen, and new convert (Muallaf). The system tracks lifecycle events per member — birth registration, Madrasa enrollment, graduation, marriage, Hajj completion, death — creating a cradle-to-grave community record. **Duplicate detection** via Aadhaar/phone matching prevents redundant entries during data migration.

### 1.3 NRI member tracking (Kerala-critical)

Kerala has approximately **1.77 million emigrants in GCC countries**, with Malappuram district alone accounting for 377,000+ emigrants. NRI profiles capture: current country, city, employer, visa type and expiry, passport expiry date, emergency contact abroad, family contact in Kerala, and preferred communication timezone. NRI-specific features include separate subscription tiers (Gulf-based members typically contribute higher amounts), multi-currency donation acceptance (INR, SAR, AED, USD, KWD, QAR, BHD, OMR), and remittance tracking for community contributions. The Gulf Returnee Welfare sub-module registers returning NRIs with needs assessment, facilitates NORKA ROOTS government scheme enrollment (Santhwana, Pravasi Tanal, Karunya), and tracks reintegration support including skill assessment, job placement referrals, financial rehabilitation, and psychological support.

### 1.4 Ward and area management

The Mahallu territory divides into wards/areas, each with an assigned ward leader. Ward records include geographic boundaries, household count, member count, and assigned committee representative. This enables ward-wise reporting, targeted communication, and door-to-door collection tracking. House numbering follows a systematic scheme linked to the ward structure.

### 1.5 Community census and survey

A built-in survey module enables periodic demographic data collection across all households — income levels, educational attainment, employment status, health conditions, government scheme enrollment, property details, and welfare needs. Survey results feed into dashboards showing community demographics and identifying families needing support. Data export in formats compatible with government reporting requirements.

### 1.6 Member self-service portal

Each family receives a unique login credential (mobile number + OTP or username/password). Through the portal, family heads can view and update their household profile, see all family members' details, check payment history and pending dues, make online payments, track children's Madrasa progress, view community announcements, download digital receipts and certificates, submit welfare applications, and request certificates/NOCs.

---

## Module 2: Financial management

Mosque finances involve **multiple segregated fund types**, each with distinct Islamic jurisprudential rules governing collection and distribution. The financial module must enforce strict fund separation while providing consolidated visibility.

### 2.1 Fund management with strict segregation

The system maintains independent ledgers for each fund type:

| Fund | Purpose | Rules |
|------|---------|-------|
| **General/Operational Fund** | Day-to-day mosque operations | Unrestricted use for mosque needs |
| **Zakat Fund** | Obligatory alms (2.5% on wealth above Nisab) | Must distribute to 8 Quranic categories ONLY; cannot fund mosque construction/operations |
| **Sadaqah Fund** | Voluntary charity | Flexible use; can support any halal purpose |
| **Sadaqah al-Fitr/Fitrah Fund** | End-of-Ramadan per-person charity | Must distribute before Eid prayer; primarily to poor/needy |
| **Waqf Fund** | Endowment income | Governed by Waqf Act 1995; property cannot be sold |
| **Building/Construction Fund** | Capital projects | Project-specific collection and spending |
| **Madrasa Fund** | Education institution operations | Teacher salaries, supplies, student welfare |
| **Marriage Assistance Fund** | Community marriage support | For economically weak families |
| **Death/Janazah Fund** | Burial expenses | Emergency disbursement for kafan, grave, funeral |
| **Qard Hasan Fund** | Interest-free loans | Zero interest; principal-only repayment |
| **Scholarship/Education Fund** | Higher education support | Merit and need-based |
| **Medical Emergency Fund** | Health crisis support | Urgent approval workflow |
| **Ramadan Special Fund** | Iftar/Sehri sponsorship | Day-wise sponsorship booking |
| **Bait-ul-Maal** | Community treasury/general welfare | Multi-purpose with committee approval |

Each fund has its own income register, expense register, and balance tracking. **Cross-fund transfers require explicit committee approval** with audit trail documentation.

### 2.2 Income tracking and collection

Income sources span: monthly/quarterly/annual member subscriptions (the most predictable revenue stream), Friday Jumu'ah box collections (weekly cash counting with dual-counter reconciliation), general donations, Zakat collections (seasonal peak during Ramadan), Fitrah collections, Eid collections, Ramadan special donations, Waqf property rental income, hall/venue booking fees, Madrasa student fees, utensil/equipment rental income (common in Kerala mosques where cooking vessels are rented for community events), investment returns from Shariah-compliant instruments, and NRI contributions via international wire transfer.

For each income entry: date, amount, fund allocation, donor/member details, payment method (cash, bank transfer, UPI, QR code, online gateway, cheque, demand draft, standing instruction), receipt number, and collector name. The system auto-generates receipts per transaction. **India-specific payment integration** should support UPI (Google Pay, PhonePe, Paytm), Razorpay/CCAvenue gateways, NEFT/RTGS/IMPS bank transfers, and dynamic QR codes. Saudi Arabia context adds SADAD bill payment, mada debit cards, STC Pay, and Apple Pay.

### 2.3 Expense management

Expense categories include: staff salaries (Imam, Muezzin, teachers, cleaners, security, accountant), utility bills (electricity, water, internet, telephone), building maintenance and repairs, construction projects, Madrasa operational costs, welfare disbursements, Zakat distribution (tracked by recipient category), Fitrah distribution, event expenses, administrative costs (stationery, printing, software, postage), Qard Hasan loan disbursements, cemetery/Qabristan maintenance, food programs (Iftar, community meals), insurance premiums, debt service, and external donations to other causes.

Each expense records: date, amount, fund debited, category, payee, payment method, approver name, supporting document uploads (bills, invoices, vouchers), and budget line reference. **Dual authorization** is mandatory — no person can both initiate and approve the same expense.

### 2.4 Subscription and dues management

The subscription module is the financial backbone for most Kerala Mahallus. Features include: configurable subscription plans (monthly, quarterly, half-yearly, annual) with different tiers based on member category (local resident, NRI, senior citizen, BPL family), automated due date calculation, proforma receipt generation, ward-wise collection assignment to volunteers, door-to-door collection tracking with collector login, bulk SMS/WhatsApp reminders at configurable intervals before and after due dates, penalty-free grace periods, demand reports showing total expected versus collected, defaulter lists with aging analysis, and family-wise payment history accessible through the self-service portal.

### 2.5 Zakat management sub-module

Given the strict Islamic jurisprudential requirements for Zakat, this deserves dedicated functionality. The module includes a **Nisab calculator** (configurable for gold standard at 87.48g or silver standard at 612g, with live market price integration), Zakat calculation assistance for donors (2.5% on net wealth above Nisab held for one lunar year), Zakat-specific receipt generation, and a **distribution tracking system** that records every disbursement against the 8 mandatory recipient categories (Fuqara, Masakin, Amil, Muallaf, Riqab, Gharimin, Fi Sabilillah, Ibn al-Sabil). The module enforces that Zakat funds cannot be redirected to mosque construction or operational expenses. A beneficiary registry maintains profiles of verified Zakat-eligible community members with needs documentation and periodic eligibility re-verification.

### 2.6 Accounting and compliance

Full double-entry accounting with receipt vouchers, payment vouchers, journal entries, and bank reconciliation. **Auto-locking of financial entries** after a defined period prevents unauthorized retroactive changes (a feature proven valuable in JamiaSoft's deployment). The system generates all compliance-required outputs:

- **80G tax receipts** containing: trust name, PAN, 80G registration number and validity period, donor PAN, amount, date, payment mode (cash receipts only valid for amounts ≤₹2,000)
- **Form 10BD data** (Annual Statement of Donations) due May 31
- **FCRA reporting data** for Form FC-4, flagging all foreign contributions and routing them to the designated SBI FCRA account
- **Waqf Board annual account statement** due May 1, with property-wise income/expense
- **Form 10B/10BB audit report data** (10B for gross receipts >₹5 crore or foreign contributions; 10BB for all others)
- **ITR-7 preparation data** due October 31
- **TDS return data** (quarterly Forms 24Q, 26Q) for salary and contractor payments
- **GST compliance data** where applicable (registration required if taxable supply turnover exceeds ₹20 lakhs)

An automated compliance calendar alerts administrators to upcoming filing deadlines.

### 2.7 Budget planning and variance tracking

Annual budget preparation by the Treasurer with departmental inputs from sub-committees. Budget approval workflow through committee vote. Monthly/quarterly budget-vs-actual variance reports with drill-down by fund and category. Mid-year budget revision workflow. Visual dashboards showing spending trends against budget lines.

---

## Module 3: Madrasa management

Madrasa education management is the **largest feature gap in existing mosque software** globally — only Masjid Solutions (IQRA module) offers it among US-focused products, and Kerala's Mahallu apps treat it minimally. Kerala alone has approximately **11,000 madrasas under the Samastha Kerala SKIMVB board** serving over 1 million students, making this module commercially critical.

### 3.1 Student management

**Admissions workflow**: Online application form (parent-initiated via mobile) capturing child's personal details, date of birth, family ID linkage, previous education, health information, and photograph. Document upload support for birth certificate and previous records. Application review by Madrasa Principal with eligibility check (age, available seats). Assessment scheduling if required. Admission approval/rejection with automated parent notification. Waitlist management with automatic slot offers when seats open. Enrolled students are assigned a class, section, and teacher.

**Student profiles**: Comprehensive individual records linked to the family module, including student photo, QR-coded ID card generation, class/level assignment, academic history, behavioral records, health information, and special needs notation. Student status tracking covers: active, inactive, withdrawn, transferred, graduated, and dropout — with dropout reasons captured for community intervention planning.

**Promotion and graduation**: Level-based progression (Darjaat system) driven by examination results and teacher assessment. Automated promotion workflows at academic year end. Alumni management moves graduated students to a searchable alumni database with continued communication capability. Transfer certificate and NOC generation for students moving between Mahallus.

### 3.2 Quran memorization (Hifz) tracking

This is the **most specialized and high-value feature** for Islamic education software. Purpose-built Hifz tracking goes far beyond generic gradebooks:

- **Sabak (New Lesson)**: Daily recording of newly memorized verses — Surah name, Ayah range, quality rating (1-5 scale), and teacher notes
- **Sabaq Para (Recent Revision)**: Tracking consolidation of recently memorized portions with quality assessment
- **Dhor (Older Revision)**: Monitoring retention of previously memorized sections over time
- **Juz/Para progress visualization**: Color-coded dashboard showing completion status across all 30 Juz — memorized, under revision, pending
- **Surah-level milestone tracking**: Start date, completion date, and quality per Surah
- **Hifz heatmaps**: Visual analytics highlighting strong versus weak Surahs for targeted revision
- **Consistency streaks**: Daily/weekly memorization consistency monitoring with gamification elements
- **Parent-facing progress reports**: Real-time visibility for parents through the family portal
- **Hifz completion certificate**: Auto-generated upon completion of all 30 Juz with formal community recognition

### 3.3 Curriculum and academic management

Structured curriculum management supporting organization-specific syllabi (Samastha SKIMVB, AP Sunni, Mujahid, Jamaat-e-Islami each have distinct curricula in Kerala). Subject categories include: Quran recitation, Tajweed, Hifz, Arabic language, Hadith, Fiqh, Aqeedah, Islamic history, Seerah, and Dua/Supplication. Features cover: lesson plan creation per class/subject, homework assignment posting with submission tracking, multiple exam types (monthly tests, term exams, oral recitation exams, written exams), configurable grading systems (percentage, letter grades, pass/fail, descriptive), auto-generated results with subject-wise and cumulative analysis, and customizable report card templates combining academic, Quranic, and behavioral assessments.

### 3.4 Teacher (Ustadh/Ustadha) management

Teacher profiles capturing: personal information, Islamic qualifications (Alim, Hafiz, Qari certifications), subject specializations, experience, and documents. Class-subject assignment with workload balancing. Daily attendance tracking with leave application/approval workflow. Salary and compensation management integrated with the financial module. Substitute teacher assignment for absences. Teacher portal providing class-specific views where each teacher sees only their assigned students.

### 3.5 Attendance tracking

Mobile-optimized attendance marking (under 15 seconds per class, following Dugsi's proven UX pattern). Multiple status options: Present, Absent, Late, Excused. Class-wise and subject-wise attendance registers. Real-time notifications to parents on absence via SMS/push notification. Leave application submission by parents through the family portal. Attendance analytics with daily, weekly, monthly, and term-wise reports. Low-attendance alerts for both students and teachers.

### 3.6 Fee management

Configurable fee types per class: tuition, admission fees, exam fees, books/materials. Sibling discount rules. Installment plan support. Fee waiver and scholarship management with Zakat fund allocation for deserving students. Automated payment reminders. Integration with the main financial module for consolidated accounting. Payment acceptance through all supported methods including parent portal online payment.

### 3.7 Timetable and scheduling

Class timetable creation supporting Kerala's Madrasa models: before-school morning sessions (typical: 6:30-8:00 AM), after-school evening sessions, and weekend programs. Room/facility allocation with conflict detection. Integration of Islamic calendar events for holiday management (Ramadan schedule changes, Eid holidays, Friday adjustments). Academic calendar with exam periods, parent-teacher meeting dates, and events.

---

## Module 4: Nikah and marriage management

Marriage administration is a **core Mahallu function in Kerala**, with the Marriage NOC workflow being among the most frequently used features in existing MahalluApp and MAS deployments.

### 4.1 Marriage registration

Comprehensive data capture: bride details (name, father's name, mother's name, DOB, address, ID proof, photo, previous marital status, community/Mahallu affiliation), groom details (same fields plus employment/income), Wali (guardian) details (name, ID, relationship, consent documentation), Mehr specification (immediate amount, deferred amount, type — cash/gold/property), witness information (minimum 2 adult Muslim male witnesses with ID), and Qazi/officiant details (name, authorization, organization).

Auto-generated Nikah certificate from the database with Quranic verses, all party details, and digital signatures. Nikah register form with all signatures recorded. Mehr payment tracking showing immediate payment status and deferred schedule. Civil registration reminder alerting families to complete government marriage registration (Islamic Nikah alone is not legally sufficient in India). Community marriage statistics and annual registry reports.

### 4.2 Marriage NOC workflow

When a member marries outside the Mahallu, an NOC process applies: applicant submits request → Secretary verifies membership standing and dues clearance → Committee approval → Outgoing NOC issued with member details and clearance confirmation → Receiving Mahallu records incoming NOC. The reverse workflow handles NOC receipt from other Mahallus. Both issuance and receipt are tracked in a dedicated register.

### 4.3 Pre-marital counseling tracking

Session scheduling with assigned counselor, attendance tracking, topics covered (Islamic marriage rights/obligations, financial planning, family communication), completion certificate, and referral to external services when needed.

---

## Module 5: Death and Janazah management

### 5.1 Death registration

Deceased details: name, member ID, date of birth, date and time of death, cause of death, place of death, informer details, attending physician, and supporting documents. Categorization as member, non-member, dependent, or outsider. Auto-generation of community death certificate. Automatic member status update to "Deceased" across all linked modules (subscription cancellation, Madrasa student withdrawal if applicable).

### 5.2 Funeral coordination workflow

Triggered upon death registration: **Ghusl (washing) coordination** assigns trained volunteers (gender-appropriate teams) with scheduling and facility booking. **Kafan (shroud) arrangement** draws from inventory tracking with procurement logging. **Janazah prayer** scheduling sets time and location, assigns Imam, and triggers mass community notification via SMS, WhatsApp, and push notifications. **Burial coordination** interfaces with the Cemetery module for plot allocation, grave preparation team assignment, and transport arrangement. **Condolence notification** dispatches to the full community with gathering schedule details.

### 5.3 Post-death follow-up

Iddah period tracking for widows (4 months, 10 days) and divorced women (3 menstrual cycles) with calendar reminders. **Automatic welfare activation**: system flags the household for widow pension enrollment, orphan scholarship eligibility for children, and emergency financial assistance. Basic Islamic inheritance share reference (Faraid) for family guidance with referral to qualified scholars. Death fund expense tracking per funeral for financial reporting.

---

## Module 6: Cemetery (Qabristan) management

### 6.1 Plot management

Interactive digital map of the cemetery with color-coded status: available (green), occupied (red), reserved (yellow), under maintenance (grey). Systematic numbering hierarchy: Section → Row → Plot with unique IDs. GPS coordinates stored per grave for mobile navigation by visiting families. Plot reservation system allowing families to pre-reserve with date and payment tracking. Capacity dashboard showing total plots, occupied, available, and projected fill rate for expansion planning.

### 6.2 Burial records

Each burial records: deceased name, date of burial, exact plot location, cross-reference to death registration module, burial permit documentation, and photograph of headstone/marker. Searchable database for families and visitors to locate graves. Document storage for any associated legal papers.

### 6.3 Maintenance scheduling

Periodic maintenance task management: grass cutting, cleaning, boundary wall repairs, pathway maintenance, water supply, and signage. Work order creation with volunteer/contractor assignment. Cost tracking per maintenance activity. Seasonal planning for monsoon preparation and festival/visiting season readiness.

---

## Module 7: Qard Hasan (interest-free loan) management

No major existing mosque software offers a complete Qard Hasan module — this represents a **significant market differentiator**.

### 7.1 Loan lifecycle

**Application**: Borrower submits request with: loan amount, purpose (medical, education, marriage, business startup, emergency, housing repair), income/employment information, proposed repayment period, and supporting documents. **Guarantor registration**: 1-2 guarantors with identity verification and basic financial capacity check. **Approval workflow**: Secretary initial review → Finance sub-committee needs assessment → Committee recommendation (amount, terms, conditions) → President final approval. **Disbursement**: Direct bank transfer to borrower or directly to institution (hospital, school) with formal loan agreement signed by borrower, guarantor, and committee representative.

### 7.2 Repayment management

Configurable installment schedules (monthly/quarterly) with total duration typically 6-50 months. Automated reminders via SMS/WhatsApp before each due date. Repayment recording with running balance display. **Critical Shariah compliance**: the system must enforce zero interest — no interest calculation, no late payment penalties. If a borrower faces hardship, the system supports extension approval workflows and partial/full waiver (with committee approval, in accordance with the Quranic principle of extending time or forgiving debt). Borrower's voluntary excess payment is recorded separately as hibah (gift), never as interest.

### 7.3 Portfolio reporting

Active loan count and total outstanding, disbursement summary by purpose, repayment rate percentage, default/overdue aging analysis, fund balance and replenishment tracking from repayments, and per-borrower history accessible by authorized financial officers.

---

## Module 8: Community welfare schemes

### 8.1 Scheme types

| Scheme | Eligibility | Typical Structure |
|--------|------------|-------------------|
| Medical Aid | Serious illness/hospitalization; community member | Case-by-case; hospital bill verification |
| Education Scholarship | Merit + need-based; school/college/professional students | Annual disbursement |
| Marriage Assistance | Economically weak families; bride/groom from community | Per-event grant |
| Orphan Sponsorship | Children who lost father/both parents | Monthly stipend |
| Widow Pension | Widows without adequate income | Monthly stipend |
| Housing Support | BPL families, disaster victims | Project-based grant/loan |
| Livelihood Support | Unemployed/underemployed members | Training + one-time capital |
| Gulf Returnee Welfare | Returned NRIs facing financial distress | Case-by-case assessment |
| Emergency Relief | Natural disaster, fire, accident victims | Immediate disbursement |

### 8.2 Application and approval workflow

Applicant submits request through portal or committee member with supporting documents (income proof, medical certificates, ID, photographs). Secretary reviews for completeness and membership standing. Welfare sub-committee conducts needs assessment (home visit, income verification, recommendation). Committee votes on approval and amount. Treasurer processes disbursement (bank transfer preferred for audit trail). Post-disbursement follow-up tracking measures outcomes (student grades, health recovery, employment status). Annual welfare impact report aggregates all scheme data.

---

## Module 9: Hajj, Umrah, and pilgrimage tracking

Community-level pilgrimage records store: member name, pilgrimage type (Hajj/Umrah), year, travel dates, group details, and travel agent. Document assistance tracking covers passport status, visa application progress, vaccination records, and Saudi Nusuk platform registration. Pre-Hajj orientation management schedules training sessions with attendance tracking, provides checklist completion monitoring, and distributes orientation materials. Group coordination features include group leader assignment, member lists, shared itinerary, accommodation details, and emergency contacts. Post-Hajj community acknowledgment and experience-sharing event scheduling. For mosques operating Hajj savings schemes, installment payment tracking and fund management integrate with the financial module.

---

## Module 10: Event and program management

### 10.1 Islamic calendar integration

Dual Hijri-Gregorian calendar displaying all significant Islamic dates: Ramadan start/end, Laylatul Qadr, Eid al-Fitr, Eid al-Adha, Islamic New Year, Mawlid al-Nabi, Isra and Mi'raj, Shab-e-Barat, Day of Arafah, and Ashura. Automatic event creation for recurring community programs on these dates.

### 10.2 Ramadan program management

Day-by-day Iftar sponsorship booking (sponsor name, menu type, guest count per day), Taraweeh schedule with Imam rotation, I'tikaf registration with ID verification and space management, Quran Khatm (completion) tracking across prayer sessions, last 10 nights special programs, and Sahoor/Sehri arrangements. Fitrah collection integration with the financial module.

### 10.3 General event management

Event creation with details (type, date, venue, budget estimate, description, target audience). Calendar conflict detection. Registration management with headcount tracking. Venue/hall booking with availability checking, approval workflow, and payment collection. Speaker/lecturer management with profiles, scheduling, and honorarium tracking. Post-event expense reconciliation against budget. Attendance recording and feedback collection. Photo/media gallery for archiving.

### 10.4 Regular programs

Weekly Dars (lecture series) scheduling, adult Islamic courses, Quran competition organization, youth programs, women's programs, sports/recreation events, community meals, and inter-Mahallu collaborative events.

---

## Module 11: Communication and notifications

### 11.1 Multi-channel delivery

The system supports: **push notifications** for prayer times, urgent alerts, and reminders; **SMS** for payment reminders, emergency alerts, and OTP verification (via MSG91 or similar Indian provider with DND compliance); **WhatsApp Business API** for community updates, receipts, and template messages; **email** for formal communications, reports, certificates; **in-app messaging** for detailed announcements, polls, forums; **digital display/TV signage** for mosque prayer times, announcements, and scrolling notices (supporting Android TV, Fire TV, Samsung/LG Smart TVs); and **IVR phone calls** for emergency alerts to elderly/non-smartphone users.

### 11.2 Prayer time integration

Auto-calculated prayer times using location coordinates via AlAdhan API (free, supports multiple calculation methods — Karachi, ISNA, MWL, Umm al-Qura, Egyptian — and Shafi/Hanafi school variations). Admin override for Iqamah time adjustments. Auto-sync across app, website, TV displays, and notification schedules. Jumu'ah schedule with multiple khutbah times if applicable. Ramadan-specific Imsak/Iftar/Taraweeh timing. Qibla direction compass using device GPS.

### 11.3 Announcement management

Announcement categories: prayer/worship updates, religious events, community news (births, deaths, marriages), financial updates (collection reminders, campaign progress), Madrasa updates (admissions, exams, results, holidays), welfare scheme availability, emergency alerts, and administrative notices (meetings, elections, policy changes). Each announcement can target: all members, specific ward, specific role, specific family, NRI members, or custom segments. Language selection per announcement (Malayalam, English, Arabic, Urdu). Scheduling for future delivery and recurrence rules.

### 11.4 Emergency alert system

Authorized users (President, Secretary, Imam) can trigger emergency broadcasts — natural disaster, medical emergency, security incident — dispatched simultaneously across all channels (push, SMS, WhatsApp, IVR, TV flash). Acknowledgment tracking shows who received and confirmed. Follow-up update capability with final all-clear notification.

### 11.5 User communication preferences

Per-member opt-in/opt-out settings by channel type and announcement category. Quiet hours configuration. Language preference. Frequency settings (immediate, daily digest, weekly digest). GDPR/data privacy compliance for communication consent.

---

## Module 12: Certificate and document management

### 12.1 Certificate types

All certificates auto-populate from the member database, export as PDF with configurable official seal/letterhead, and record issuance in a centralized register:

- **Marriage/Nikah Certificate** — Full ceremony details, parties, Mehr, witnesses
- **Death Certificate** — Deceased details, date, cause, informer
- **Community/Character Certificate** — Membership standing attestation
- **No Objection Certificate (NOC)** — For inter-Mahallu transfers and marriages
- **Property Certificate** — Property ownership attestation
- **Transfer Certificate** — For families moving to another Mahallu
- **Membership Certificate** — Confirmation of active membership
- **Madrasa Completion Certificate** — Class/program completion
- **Hifz Completion Certificate** — Quran memorization achievement
- **Clearance Certificate** — All dues cleared, no outstanding obligations
- **Divorce Certificate** — Talaq registration documentation

### 12.2 Issuance workflow

Applicant submits request (type, purpose, supporting documents) → Secretary reviews membership standing → Automated dues clearance check via Treasurer module → If clear: auto-generate certificate from templates → Secretary digital signature → President counter-signature (for specific types) → Digital copy delivered to applicant via portal + notification → Physical copy available for collection → Issuance logged in register with serial number.

### 12.3 Digital ID cards

Member ID cards generated with photo, QR code (linking to digital profile), Mahallu name, member ID, blood group, and emergency contact. Supports Apple Wallet and Google Wallet integration for digital carry.

---

## Module 13: Asset and property management

### 13.1 Mosque property records

Complete property register: land records, registration documents, survey numbers, ownership deeds, geo-tagging coordinates, property tax status, and digitized copies of all legal documents.

### 13.2 Waqf property compliance

India-specific Waqf property management with: mandatory registration tracking per Waqf Act 1995, Mutawalli assignment, UMEED portal integration for digital registration with geo-tagging, property-wise income/expense tracking, Waqf Board annual reporting (2-7% tax on net annual income), lease management, tenant records, and rent collection with arrears tracking.

### 13.3 Facility and inventory management

Mosque asset register (furniture, sound system, AC units, carpets, Quran copies, books, cleaning equipment) with depreciation tracking. **Utensil/equipment rental system** — a feature unique to Indian mosques where cooking vessels, tents, and chairs donated by members are rented for community events, generating income. Item master, issue/return tracking, damage reporting, and stock management. Building maintenance scheduling with preventive maintenance calendar, work orders, and contractor management. Utility bill tracking (electricity, water, internet) with monthly budget-vs-actual comparison.

---

## Module 14: Community directory services

### 14.1 Professional and skills directory

Searchable database of community members' professions, skills, and business offerings — enabling intra-community economic support. Fields: member name, profession/trade, specialization, business name (if applicable), location, contact, and availability.

### 14.2 Blood donor database

Members voluntarily register with: blood group, last donation date, health status, emergency availability flag, and contact number. During emergencies, the system can instantly filter and notify compatible donors.

### 14.3 Matrimonial services

Privacy-controlled profiles for marriage-seeking members: age, education, profession, family background, preferences, and photographs. Only accessible to registered community members with privacy settings controlling visibility. Facilitates matching within and across Kerala Mahallus and Gulf diaspora communities.

### 14.4 Volunteer registry

Skills inventory, availability windows, area of interest (education, welfare, events, maintenance, funeral services), hours contributed, and recognition tracking.

---

## Module 15: Governance and administration

### 15.1 Committee management

Committee formation: President (Sadr), Secretary, Joint Secretary, Treasurer (Khazin), and defined number of committee members. Sub-committee creation for specific domains (education, welfare, finance, construction, youth, women). Member assignment with term dates. Meeting scheduling with agenda creation, attendance tracking, and minutes recording. **Election management**: voter list generation from eligible members, ballot creation, voting (supporting in-person and digital), result tabulation, and archival — a feature offered only by Masjid Solutions among existing products.

### 15.2 Meeting management

Meeting types: General Body (annual/special), Executive Committee (monthly), Sub-Committee. For each: agenda preparation and distribution, attendance registration, minutes recording with action items, resolution tracking, and minutes approval workflow. PDF export of finalized minutes with digital signatures.

### 15.3 Document management

Centralized repository for: property deeds, registration certificates, government correspondence, audit reports, committee resolutions, policy documents, legal opinions, and historical records. Version control, access permissions by role, and search capability.

---

## Module 16: User roles and permission matrix

The system implements **role-based access control (RBAC)** with 15 distinct roles reflecting the Mahallu committee hierarchy. Each role has precisely scoped permissions preventing unauthorized access while enabling efficient workflows.

| Role | Key Permissions |
|------|----------------|
| **Super Admin** | Full system access; multi-tenant management; user CRUD; system configuration; data backup/restore; audit logs |
| **President (Sadr)** | Final approval authority for budgets and high-value disbursements; all reports/dashboards; committee override; cannot directly edit financial entries (separation of duties) |
| **Secretary** | Day-to-day administration; full member CRUD; certificate issuance; meeting management; workflow initiation; document management; approve within defined threshold |
| **Joint Secretary** | Deputy to Secretary in assigned domains; limited certificate issuance; event management; member query handling |
| **Treasurer (Khazin)** | Full financial management — income/expense recording, bank reconciliation, report generation, receipt issuance, budget preparation; cannot approve own expense requests (dual control) |
| **Imam/Khatib** | Prayer time management; religious event scheduling; Nikah officiation; Janazah coordination; religious certificate issuance; no financial access |
| **Muezzin** | Prayer time alerts; mosque facility status; basic attendance recording; view-only for schedules |
| **Madrasa Principal** | Full Madrasa management — student enrollment, curriculum, teacher management, exams, reports; budget requests to committee |
| **Madrasa Teacher** | Class management; student attendance entry; grade/mark entry; assignment management; view only assigned class data |
| **Committee Member** | View committee reports and financials (read-only); vote on proposals; participate in sub-committees |
| **Sub-Committee Head** | Full management within assigned domain; workflow initiation; domain-specific reporting; budget requests |
| **Auditor** | Read-only access to ALL financial records and transaction logs; audit report submission; flag discrepancies; absolutely no edit/delete permissions |
| **Volunteer** | Event participation; assigned task management; view assigned activities only |
| **Family Head** | Family dashboard; online payments; donation history; children's Madrasa tracking; certificate requests; welfare applications; profile updates |
| **Family Member** | View own profile; view announcements; view personal Madrasa progress; no payment or application capability |

---

## Module 17: Approval workflows

Every significant action flows through defined approval chains with full audit trails. **Ten core workflows** govern the system's operational integrity:

**Fund disbursement**: Requester submits with amount, purpose, payee, and documents → Treasurer verifies budget availability and documentation → amounts up to Threshold 1 approved by Treasurer → amounts between Threshold 1 and 2 require President approval → amounts above Threshold 2 require committee vote with quorum → post-approval Treasurer executes payment → receipt/voucher upload mandatory → Auditor auto-notified.

**New family registration**: Applicant submits family details and documents → Secretary reviews for completeness and duplicates → Imam or ward leader conducts physical verification → Committee designee approves → System assigns membership number and sends welcome notification with portal credentials.

**Certificate/NOC issuance**: Applicant requests via portal → Secretary reviews membership standing → automated dues clearance check → if clear, certificate auto-generates → Secretary signs → President counter-signs (for certain types) → digital copy delivered → register entry created.

**Donation acceptance**: Donor specifies fund type → system records transaction details → auto-generates appropriate receipt (with 80G fields if applicable) → Treasurer verifies in bank reconciliation → foreign contributions flagged for FCRA routing → year-end Form 10BD auto-generated for 80G donors.

**Madrasa admission**: Parent submits application → Principal reviews eligibility → assessment if needed → admission approved/waitlisted/rejected → class and teacher assigned → fee setup → attendance and progress tracking activated → parent notified with portal access.

**Welfare scheme application**: Applicant submits with documents → Secretary verifies membership and eligibility → Welfare sub-committee investigates (home visit, needs assessment) → recommendation with amount → Committee approval for amounts above threshold → Treasurer disburses → post-disbursement follow-up.

**Qard Hasan loan**: Application with guarantor → Secretary verifies standing → Finance sub-committee assesses → Committee recommends terms → President approves → agreement signed → Treasurer disburses → repayment tracking activates.

**Expense approval**: Initiator submits with budget line and supporting documents → automatic budget check → minor amounts: Secretary approves → Treasurer pays → larger amounts: President approval → over-budget: Committee approval → voucher/receipt upload → accounting entry.

**Budget approval**: Treasurer drafts with departmental inputs → committee discussion → amendments → committee vote → President sign-off → budget activated → quarterly variance reviews.

**Event approval**: Initiator submits event details and budget → Secretary checks calendar and resources → minor events: Secretary/President quick approval → major events: Committee discussion and vote → budget allocation → coordinator assignment → execution → post-event reconciliation.

---

## Module 18: Dashboards and reports

### 18.1 Admin committee dashboard

Real-time overview showing: total member families (with growth trend), financial summary (MTD/YTD income versus expense, bank balance, pending collections), subscription collection rate as percentage, donation breakdown by fund type with period comparison, Madrasa enrollment and attendance rates, pending approval count by workflow type, recent activity feed (latest transactions, applications, announcements), and compliance deadline countdown.

### 18.2 Financial dashboard

Income vs. expense trend charts (monthly/quarterly/yearly), budget vs. actuals by category with variance highlighting, donation source breakdown (cash, online, foreign), FCRA fund utilization tracker, cash flow projection, outstanding receivables aging (subscriptions, Qard Hasan loans), bank reconciliation status, Zakat collection and distribution summary by recipient category, and 80G donation total for compliance.

### 18.3 Madrasa dashboard

Enrollment statistics by class and academic year, attendance trend graphs, exam result summaries, Hifz progress aggregate, fee collection rate, teacher attendance, and upcoming academic calendar events.

### 18.4 Family head dashboard

Payment status widget (current dues, upcoming, overdue — with pay-now button), children's Madrasa progress cards (attendance, recent grades, Hifz milestones), announcements feed, upcoming events, application status tracker (welfare, certificates, Qard Hasan), donation history with downloadable 80G receipts, and family profile summary.

### 18.5 Comprehensive report catalog

The system generates **44 standard reports** across six categories:

**Financial reports** (13): Income and expenditure statement, balance sheet, receipts and payments account, budget vs. actuals, donation register with 80G details, Zakat collection and distribution, FCRA utilization, cash flow statement, bank reconciliation, outstanding dues/aging, Qard Hasan loan portfolio, expense category analysis, and fund-wise income/expenditure.

**Compliance reports** (7): Form 10BD data, audit report data (Form 10B/10BB), FCRA return data (FC-4), TDS quarterly summary, GST return data, Waqf Board annual statement, and 80G receipt register.

**Member reports** (5): Complete family register, new registration report, demographics breakdown, dues collection analysis, and member activity/engagement report.

**Madrasa reports** (6): Student enrollment register, attendance report (daily/monthly/term), exam results, individual student progress, teacher performance, and class-wise strength report.

**Operational reports** (8): Event summary, welfare scheme disbursement, certificate issuance register, committee meeting minutes, sub-committee activity, volunteer activity log, asset/property inventory, and maintenance schedule.

**Analytics reports** (5): Year-over-year comparison (financial, membership, Madrasa), collection efficiency trend, welfare impact assessment, community growth analysis, and donor retention analysis.

**Key performance indicators** tracked system-wide: subscription collection rate (target >90%), donation growth YoY, Madrasa enrollment rate (eligible children vs. enrolled), student attendance rate, welfare application fulfillment rate, Qard Hasan recovery rate, member engagement rate, budget adherence ratio, and compliance filing timeliness.

---

## Module 19: Regulatory compliance engine

### 19.1 India compliance

**FCRA 2010 (amended 2020, 2024 rules effective January 2025)**: System enforces that all foreign contributions route to designated SBI FCRA New Delhi account before utilization. Separate ledger for foreign versus domestic funds. Administrative expense tracking against 50% cap. Annual FC-4 return data generation. Sub-granting restrictions enforced. Registration renewal reminders 6 months before 5-year expiry.

**Income Tax**: Section 12AB registration tracking with renewal alerts. 85% application rule monitoring — system warns when charitable spending falls below threshold. Section 80G receipt generation with all mandatory fields (trust PAN, 80G registration number, donor PAN, mode restriction for cash >₹2,000). Form 10BD annual statement auto-generation. ITR-7 preparation data. Form 10 for income accumulation with 2-month-before-deadline alert.

**GST**: Automated assessment of whether taxable supply threshold (₹20 lakhs) is breached. Exemption tracking for pure charitable activities, worship services, and below-threshold rentals (rooms <₹1,000/day, halls <₹10,000/day, shops <₹10,000/month).

**TDS**: Automated TDS calculation on salary, contractor, and rent payments. Quarterly return data preparation (Forms 24Q, 26Q). TDS certificate generation.

**Waqf Board**: Property-wise annual account statement generation. 2-7% levy calculation on net annual income. Registration status tracking. Compliance with the 2025 Waqf Amendment Act requirements including enhanced transparency provisions.

### 19.2 Saudi Arabia context

In Saudi Arabia, mosques are **government-managed through the Ministry of Islamic Affairs**, with Imams and Muezzins as government employees. Independent financial management is minimal. The system's Saudi deployment would focus on: prayer time compliance with the Umm al-Qura calendar, regulated Adhan-to-Iqamah intervals (15 minutes for Isha/Fajr), maintenance and cleaning scheduling, inspection reporting, sermon logging, I'tikaf registration with ID verification and sponsor approval for non-Saudis, and utility/facility management. Cash donation collection inside mosques is banned; any financial features would route through official Saudi channels. Arabic-first UI with RTL support is mandatory.

### 19.3 Automated compliance calendar

A centralized calendar alerts administrators to every filing deadline with escalating reminders:

| Deadline | Filing | Reminder Schedule |
|----------|--------|-------------------|
| May 1 | Waqf Board Annual Statement | 60, 30, 15, 7 days |
| May 31 | Form 10BD (Donation Statement) | 60, 30, 15, 7 days |
| Jul 31/Oct 31 | Quarterly TDS Returns | 30, 15, 7 days |
| Sep 30 | Audit Report (10B/10BB) | 90, 60, 30, 15 days |
| Oct 31 | ITR-7 | 90, 60, 30, 15 days |
| Dec 31 | FCRA Return (FC-4) | 90, 60, 30, 15 days |

---

## Module 20: Digital services and integrations

### 20.1 Prayer time display system

Web-based digital signage compatible with Android TV, Fire TV, Samsung and LG Smart TVs — no special hardware required. Displays current prayer/Iqamah times, countdown to next prayer, Hijri date, announcements, and event notices. Admin-controlled remotely via dashboard.

### 20.2 Community mobile application

Native iOS and Android app (or progressive web app) providing: prayer times with Adhan alerts, Qibla compass, family dashboard, online payment, Madrasa progress, announcements, event calendar, digital membership card, certificate download, and welfare application submission. Offline mode support for areas with limited connectivity.

### 20.3 WhatsApp Business API integration

Template messages for: payment receipts, due reminders, event invitations, Janazah notifications, emergency alerts, and Madrasa attendance/grade notifications. Supports Malayalam, English, and Arabic templates.

### 20.4 Multi-language support

Primary languages: **Malayalam** (critical for Kerala), **English**, **Arabic** (for religious content and Saudi deployment), and **Urdu**. RTL (right-to-left) layout support for Arabic interface. Language preference per user with system-wide default per tenant.

### 20.5 Multi-tenancy

Each Mahallu operates as an independent tenant with isolated data, custom branding (logo, colors, Mahallu name), and independent configuration. A federation layer enables inter-Mahallu operations: NOC transfers, marriage NOC exchange, aggregate reporting for umbrella organizations (Samastha, AP Sunni, Mujahid district/state committees), and shared directories.

---

## What would set this product apart

Existing solutions are fragmented. **US-focused products** (MOHID, ConnectMazjid, Masajid Manager) excel at donation management and digital signage but completely lack marriage/death registration, family surveys, subscription collection, and certificates. **Kerala products** (MahalluApp, MAS, MinarSoft) handle administrative workflows well but lack Madrasa management, Hifz tracking, Qard Hasan, and modern communication features. **No product on the market** offers all of the following in a single platform: comprehensive Madrasa management with Hifz tracking, full Islamic financial compliance with 8-category Zakat distribution, lifecycle event management (birth to death), Qard Hasan loan management, cemetery plot mapping, NRI diaspora tracking, multi-currency support, Indian regulatory compliance (FCRA/80G/12AB/Waqf/TDS/GST), and Saudi Arabian operational compatibility.

The five strongest differentiators would be: a **full-lifecycle community record** from birth registration through Madrasa education, marriage, Hajj, death, and post-death welfare; the **Qard Hasan module** which no competitor offers; **cemetery GPS mapping** as an unserved niche; **deep NRI/Gulf diaspora features** critical for Kerala's economy; and an **integrated compliance engine** that auto-generates all Indian regulatory filings rather than requiring manual preparation.

---

## Conclusion

This specification defines **20 interconnected modules** spanning 200+ discrete features that would constitute the most comprehensive Mahallu management platform available. The product's architecture should prioritize three design principles above all others. First, **family-centric data modeling** — every feature traces back to the household unit that forms the Mahallu's organizational atom. Second, **fund integrity** — the system must make it structurally impossible to commingle Zakat with operational funds or misroute FCRA contributions. Third, **progressive adoption** — Mahallus should be able to start with just family management and subscriptions (the two most urgent pain points across Kerala's 11,000+ Mahallus) and gradually activate Madrasa, welfare, Qard Hasan, and lifecycle modules as digital maturity grows. The combination of Kerala's 1.77 million Gulf emigrants, India's complex religious institution compliance landscape, and the complete absence of an integrated competitor makes this an addressable market with clear product-market fit potential.