# Functional Requirements Research for a Mahallu Mosque SaaS/ERP Web Application

## Product context and design goals

A Mahallu-focused system is less like a generic “accounting app” and more like a community operating system: it has to handle family membership, recurring contributions, donations and collections, documents (receipts/certificates), and the day-to-day “front desk” of the mosque committee—often with volunteers doing administrative work in between prayer times and real life. In many communities, fee and donation administration still happens through a mix of paper forms, spreadsheets, manual follow-ups, and handwritten receipts that get lost (which later becomes “receipt archaeology”). citeturn7view2

Your product’s most important north star is **trust + transparency with low admin burden**. Multiple sources emphasize that faith/nonprofit organizations need clear processes, accurate records, and internal controls to protect funds and preserve public confidence. The UK Charity Commission’s internal financial controls guidance explicitly links controls to protecting assets, maintaining good accounting records, and preserving public trust and confidence—points that map directly to mosque committee realities. citeturn4view4

Modern mosque management products position themselves around exactly these pressures: consolidating donations, membership, programs/classes, fundraising campaigns, communications, and community engagement into one operational hub. citeturn4view1turn7view1turn4view2 From the education side (relevant to Madrasas), parent self-service portals are positioned as a way to reduce staff phone calls while giving families real-time visibility into attendance and fee balances—again aligning with your “committee workload reduction” goal. citeturn4view6turn6view2

**Design goals to bake into functional requirements (product + business logic):**
- **One source of truth** for households, members, and students—so finance, administration, and the Madrasa never drift into separate “versions of reality.” citeturn4view1turn6view0  
- **Strong financial governance** by default (approvals, separation of duties, auditability), because cash handling and donation processing are inherently high-risk. citeturn4view4turn8view1turn8view4turn11view0  
- **Self-service for families** (ledger visibility, receipts, Madrasa status) to reduce chasing, disputes, and “please check and call back” loops. citeturn4view6turn6view2turn7view2  
- **Community communications that respect messaging rules and consent**, especially when using WhatsApp-style notifications and templates outside response windows. citeturn4view5turn1search6  

## Users, roles, and permissions

A Mahallu ERP becomes dramatically easier to operate when permissions are modeled around **real committee responsibilities** and **financial internal controls**, not just generic “admin/user” labels. Nonprofit guidance commonly stresses segregation of duties (the person receiving cash/issuing receipts should not be the same person posting entries, reconciling bank statements, or approving payments), plus independent oversight—even when the organization is volunteer-run. citeturn8view1turn8view4turn11view0turn11view1

### Recommended role set (committee + madrasa + families)

**Platform-level (SaaS)**
- **Tenant Owner / Mahallu Super Admin**: sets up the Mahallu instance, assigns committee roles, configures financial year and fund structure, controls global settings and data exports for audits.  
- **Read-only Auditor** (internal or external): can view ledgers, vouchers, receipt registers, approvals, and change history, but cannot edit transactions.

**Committee operational roles**
- **Secretary / Office Admin**: household registry, membership requests, certificate workflow handling, announcements drafting, document templates.
- **Treasurer / Finance Officer**: receipts, payment vouchers, daily transactions, fund allocations, reconciliations, financial statements and closing activities.
- **President / Chair / Trustee Oversight**: approval authority, dashboards, exception handling, high-value expense approvals, review of monthly reports. (Trustee oversight is emphasized in charity controls guidance.) citeturn4view4turn11view0  
- **Collections Counter** (Friday/donation box): can create “collection sessions,” record counts, print provisional slips, but cannot post final ledger entries without finance approval (supports segregation of duties). citeturn8view4turn11view1  
- **Communications Admin**: prepares recipient lists, manages opt-ins/preferences, sends announcements and reminders (with approval gates if needed). Messaging policies matter here. citeturn4view5turn1search6  
- **Facilities & Assets Admin** (optional): rentals, assets register, inventory, maintenance logs (commonly present in mosque/mahallu products). citeturn10view3turn5view3  

**Madrasa roles**
- **Madrasa Principal / Coordinator**: admissions, class assignment, fee plans, attendance oversight, teacher roster.
- **Teacher**: attendance marking, class notes/announcements to parents, student performance notes (optional), leave requests.
- **Madrasa Cashier** (optional separation): records fee receipts; finance confirms posting and reconciliation.

**Family portal roles**
- **Household Account Owner (Head of Family)**: sees household ledger, pays dues, views/downloads receipts, manages linked member profiles, sees children’s Madrasa status.
- **Delegated Family Member**: view-only or limited actions (e.g., can pay but cannot change household data).
- **Student (optional)**: limited access to attendance and notices, depending on community preference.

### Permission model requirements

To support auditability and internal controls, define these permission “axes” (each independently configurable per role):
- **Create vs Approve vs Post**: especially for receipts, expenses, and corrections. citeturn8view1turn8view4  
- **Cash handling permissions**: collection entry, receipt issuance, voucher printing, cancellation rights. Best-practice controls include pre-numbered receipts and prompt deposits. citeturn11view0  
- **Data-change permissions**: edits to household demographics, member identity fields, and fund settings require logged change reasons and approvals for sensitive fields.
- **Audit log visibility**: “who did what, where, and when” must be visible to authorized roles, with access restricted by role. citeturn9view0turn9view2  

## Core records and identity

Your data model is the foundation of both portals. Existing Mahallu apps and mosque systems consistently start with **house/family registration + member registration**, then layer on subscriptions, receipts, reports, and certificates. citeturn5view3turn10view3turn6view0

### Household (Family) master record

**Required fields (core):** family/household ID, house name (where culturally relevant), address, locality/zone, primary contact(s), head of family, membership status, subscription plan, and communication preferences. Household-first structure is a known pattern in Mahallu administration products. citeturn5view3turn10view0

**Key functional requirements:**
- Household can contain multiple members with relationship types (spouse, child, dependent, guardian, etc.). Family memberships with synchronized renewals/expirations are a documented pattern in membership software. citeturn6view1  
- Support categories like resident/non-member/dependent where the Mahallu differentiates community status (seen in Mahallu-focused systems). citeturn10view3  
- Custom fields per Mahallu (e.g., zone/ward, profession, blood group, emergency contacts) with configurable visibility to families vs committee. Customizable forms/fields are commonly offered in membership platforms. citeturn6view1turn6view0  

### Member (Individual) master record

Include identity, demographics, contact methods, household linkage, and lifecycle status.
- Status types commonly needed: active, moved out, deceased, transferred to another Mahallu, temporarily away.
- Link members to roles: committee positions, Madrasa teacher, volunteer, etc.

Mahallu products also commonly track **life events** (birth/marriage/divorce/death) and **NOC/certificate** issuance as part of community administration—treat these as optional modules if your target Mahallu expects them. citeturn5view3turn10view3

### Madrasa records

Model Madrasa as an “institution/program” under the Mahallu with:
- Student profile (often linked to a household), admission status, class/grade, fee plan, attendance ledger, teacher assignment.
- Teacher/staff profiles and payroll/allowances if applicable (some mosque/mahallu solutions include HR/payroll). citeturn10view3turn6view3  

### Privacy and data governance requirements (business logic)

Because you’re handling sensitive personal and family data, bake in privacy-by-design features:
- **Purpose limitation and data minimization**: collect only what you need for defined purposes; allow configured field requirements (required/optional/hidden). citeturn8view5turn11view2  
- **Storage limitation + retention**: configurable retention for old transactions, ID proofs, certificates, and member records, aligned to local legal/committee policy. citeturn8view5turn4view4  
- **Access logging**: access and edits to sensitive records should be tracked for accountability. citeturn9view0turn9view2  

## Admin and committee portal modules and operational workflows

This section translates your “core areas” into a comprehensive ERP-style module set, plus the workflows that make them usable day-to-day.

### Family and member management module

**Primary screens and features**
- **Household directory**: fast search by family name, house name, phone, member name, zone/ward.
- **Household 360° profile**: members list, subscription plan, arrears summary, receipts timeline, Madrasa-linked children, documents issued (NOCs/certificates), communication history.
- **Bulk onboarding tools**: import households/members; assign membership/plans; initial balance opening (if migrating from manual books).
- **Membership categories and renewals**: family plans, individual plans, concessions/exemptions, and synchronized renewal/expiry for household membership packages. citeturn6view1turn6view0  
- **Voting eligibility list builder (optional but realistic)**: auto-generate voter lists based on membership rules (some membership products explicitly support automated voter lists). citeturn6view1  

**Operational workflow: new household onboarding**
1. Create household record → assign unique household ID and plan → add members and relationships.
2. Collect consent/preferences for messaging; verify primary phone number ownership (important if you’ll send payment reminders). citeturn1search6turn4view5  
3. Generate family portal credentials and deliver welcome message/letter (digital + printable).

### Financial management module (subscriptions, donations, collections, daily accounts)

Mosque and Mahallu finances typically include recurring membership fees, general donations, Friday collections, fundraising, and daily expenses—exactly the mix described in mosque fee management write-ups. citeturn7view2 A “comprehensive” financial module needs both **finance operations** (receipts, vouchers, ledgers) and **governance controls** (approvals, audit trails, restricted funds).

**Fund structure and accounting logic**
- **Fund accounting / restricted vs unrestricted tracking**: nonprofits are expected to organize money into separate funds aligned to donor intent and show that expenses align with restrictions. citeturn8view0turn8view2turn8view3  
  - Practical implementation requirement: every income item (donation/collection) must be tagged to a fund (e.g., Operating, Building, Zakat/Welfare, Madrasa, Special Appeal).
  - Every expense must be tagged to (a) an expense category and (b) a funding source/fund (where appropriate), with validation that restricted funds are spent only on allowed purposes. citeturn8view2turn8view3  

**Receipts and vouchers**
- **Digital receipts**: generate receipts for subscriptions, donations, Madrasa fees; include receipt number series and issuer identity.
- **Receipt numbering discipline**: support pre-numbered sequences and immutable receipt registers (good practice for internal control). citeturn11view0turn11view1  
- **Corrections and cancellations**: allow cancellation with mandatory reason + approval, because real life happens (wrong amount, duplicate entry). Mahallu tooling explicitly includes receipt/voucher cancellation as a feature. citeturn10view0  
- **Payment vouchers / expense vouchers**: record expense payments with attachments (invoice photo/scan), beneficiary/payee, and approval history.
- **Multiple cash books / petty cash**: support separate cash ledgers where the Mahallu uses multiple cash points (e.g., office cash + Madrasa cash). Some Mahallu products explicitly support multiple cash books and full accounts statements. citeturn10view3  

**Subscriptions (monthly/yearly dues)**
- Define subscription plans: amount, frequency, effective date, late-fee rules (optional), concessions/exemptions, and per-household special charges.
- **Household subscription ledger**: auto-generate monthly dues postings; show paid vs pending; support partial payments and carry-forward.
- **Defaulter/arrears management**: aging buckets, follow-up status, and bulk reminders.

**Donations and Friday collections**
- **Donation entry**: donor (member or guest), fund designation, receipt delivery method, anonymous option, pledge tracking (optional). Fundraising campaigns + reporting are standard in mosque management offerings. citeturn4view1turn7view0  
- **Friday collection session workflow** (recommended for governance):
  1. Open a “collection session” (date/time, location/box ID).
  2. Dual count entry: record count by two counters (or counter + reviewer).
  3. Lock provisional total; generate count slip.
  4. Treasurer confirms deposit recording and posts to ledger/fund allocation.
  5. Reconciliation: match expected deposit to bank statement line. (Monthly reconciliation and oversight are repeatedly emphasized in nonprofit control guidance.) citeturn8view4turn11view0turn11view1  

**Approvals and internal controls (must-have)**
Internal control guidance for charities/nonprofits consistently stresses written procedures, approvals, segregation of duties, and oversight—especially for cash, bank access, and spending authority. citeturn4view4turn8view1turn8view4turn11view1  
Functional requirements that implement this in-product:
- **Expense approval workflows** (by threshold and by category)
- **Dual approval for high-value transactions**
- **Role-based separation**: receipt issuance vs ledger posting vs reconciliation
- **Monthly bank reconciliation workflow** with reviewer sign-off
- **Board/committee monthly pack** generation (management accounts, budget vs actual), because trustees are expected to review clear, up-to-date financial information. citeturn4view4turn11view0  

**Audit trail requirements**
You need tamper-resistant traceability: audit logs should capture who did what, where, and when; and financial audit trails should connect receipts/invoices to ledger entries and approvals. citeturn9view0turn9view1turn9view2  
Product requirements:
- Immutable log of changes to transactions, master data, permissions, and document templates.
- Version history for edited/cancelled receipts and vouchers.

### Madrasa management module (students, fees, attendance, teachers)

Mosque systems frequently include program registration and attendance tracking for educational programs. citeturn4view1 School/parent portal patterns also emphasize attendance visibility, fee balances, digital notices, and messaging across school–teacher–parent relationships. citeturn4view6turn6view3turn6view2

**Student admissions**
- Admission application (committee-entered or parent-submitted) → review → class placement → fee plan assignment → portal activation for parents.
- Waitlist and seat capacity per class (optional).

**Fee management**
- Fee structures per class/grade/program; discounts/scholarships; installment plans; late fee rules.
- Fee ledger per student linked to household portal; receipts downloadable by parents (a standard “fee management system” feature set). citeturn6view2turn4view6  

**Attendance**
- Daily/weekly attendance marking by teacher.
- Attendance views:
  - Student detail ledger
  - Class attendance summary
  - Monthly attendance percentage report
- Parent visibility is a known benefit proposition for education portals. citeturn4view6turn6view3  

**Teacher management**
- Teacher roster and assignments (classes/subjects).
- Schedules/timetables (optional but useful as Madrasas expand), aligning with school system scheduling requirements. citeturn6view3  
- Payroll/allowances module if the Mahallu pays teachers (some Mahallu solutions include payroll). citeturn10view3turn6view3  

### Administrative tools module (documents, certificates, communications)

**Document generation**
Mahallu/mosque products frequently include NOC issue and other certificate workflows (marriage certificates, NOC letters, divorce certificates, etc.), plus committee minutes tracking. citeturn5view3turn10view3turn10view1  
Core requirements:
- Configurable templates for:
  - NOCs/certificates (residency, marriage-related documents, etc.)
  - Donation receipts (tax-language configurable)
  - Fee receipts
- Serial numbering per document type + approval stamps + QR/verification code (innovative option; see later).
- Delivery: print, portal inbox, and messaging attachment.

**Meeting governance (optional but high-value)**
- Minutes of meeting register + searchable archive (seen in Mahallu tools). citeturn5view3turn10view3  
- Action items with owners and due dates (turn minutes into ops).

**Bulk communications**
- Audience builder: by zone, arrears status, Madrasa class, donors to a fund, etc.
- Announcement workflows: draft → approve → publish → send.
- Message history per household (what they received, when).

**Messaging policy fit**
If WhatsApp-style messaging is a key channel, business rules must reflect that:
- Outside the 24-hour customer service window, business-initiated messages may require approved message templates; replies within the window can use free-form responses. citeturn4view5  
- Opt-in/consent collection for notifications is required by platform policy guidance for WhatsApp Business Platform use cases; your product should store consent status and proof metadata. citeturn1search6turn4view5  

## Family and user portal experience

The family portal should feel like a **digital passbook + service desk**: minimal clicks, high clarity, and “everything important on one screen.” Education portal patterns highlight that self-service dashboards can reduce staff calls and speed up fee collection when parents can see attendance and balances themselves. citeturn4view6turn6view2

### Authentication and household access

Functional requirements:
- Each household has a unique account (as you specified).
- The household owner can add delegated users with controlled permissions (view-only vs pay vs profile edits).
- Secure recovery flows (phone verification, committee-assisted recovery), considering real-world device changes.

### Home dashboard (family)

Include at-a-glance cards:
- **Current dues**: next due date, last payment date, outstanding balance, and “Pay Now” action.
- **Payment history timeline**: receipts downloadable.
- **Fund contributions summary**: optionally show where donations were designated (Operating vs Building vs Madrasa), reinforcing transparency expectations. citeturn8view2turn4view4  
- **Madrasa snapshot** (for families with students): fee status + attendance highlights, with drill-down.

This mirrors common parent portal patterns where fee balances, due dates, and attendance are visible 24/7. citeturn4view6turn6view2

### Financial self-service

Core functions:
- View subscription ledger (monthly/yearly) with paid/pending indicators.
- View/download receipts and statements (PDF-like outputs).
- Make payments (online/offline instructions and confirmation flow). Online payment portals are cited as a modern way mosques reduce paperwork and cash handling. citeturn7view2  
- Dispute/clarification button per transaction (creates a ticket/request to committee, reducing WhatsApp back-and-forth).

### Family and Madrasa detail views

- Household members directory (profiles visible per configured privacy rules).
- Student detail pages (attendance ledger, fee plan, receipts, notices).
- Optional: request edits (e.g., phone number change) routed to committee review (reduces erroneous edits to core identity data).

### Mahallu updates and digital inbox

- Announcements and notices feed (committee-published).
- Download center: receipts, certificates issued, letters.
- Targeted updates (e.g., “Madrasa parents only,” “arrears reminders,” “event notices”).

If you later expand to mobile/screen ecosystems, note that modern mosque platforms emphasize pushing updates across multiple channels from one admin update—your product can replicate the same “update once, reflect everywhere” expectation. citeturn7view1turn4view2  

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["mosque management software admin dashboard","parent portal attendance fee balance dashboard","nonprofit finance dashboard budget vs actual","donation kiosk mosque interface"],"num_per_query":1}

## Reporting, dashboards, and analytics

Reporting is where your product becomes “committee-grade,” not just “data entry software.” Charity/nonprofit guidance stresses that trustees need clear, accurate, up-to-date financial information (management accounts, budget comparisons, cash flow, bank balances) and that financial controls include record keeping and timely reporting. citeturn4view4turn11view0

### Admin dashboards (recommended)

**Committee executive dashboard**
- Total households, active memberships, new registrations.
- Collections this month vs last month (subscriptions, Friday collections, donations).
- Outstanding arrears totals + count of defaulter households.
- Upcoming certificate requests and pending approvals queue.

**Finance dashboard**
- Cash vs bank position; daily closing summary.
- Fund balances (restricted/unrestricted style) and trend.
- Budget vs actual by category (monthly and YTD).
- Reconciliation status tracker (last reconciled date per account). citeturn11view0turn8view4  

**Madrasa dashboard**
- Student count, new admissions, fee collection rate, pending fees.
- Attendance summary: daily absentee list + monthly attendance trend.
- Teacher workload allocation and attendance marking completion.

**Communications dashboard**
- Announcement reach: sent counts, delivery status (where available), opt-in coverage.
- Reminder outcomes: “paid after reminder” proxy metrics (helpful for tuning).

### Core financial reports (committee)

A strong baseline set:
- **Income & Expenditure statement** (monthly, quarterly, yearly)
- **Receipts & payments register** (chronological)
- **Trial balance / balance sheet-style outputs** (if you choose full accounting depth; some Mahallu systems explicitly include these reports). citeturn10view3turn5view3  
- **Subscription arrears aging report** (0–30 / 31–60 / 61–90 / 90+)
- **Friday collection session report** (session totals, counters, deposit linkage)
- **Fund balance report** (beginning balance, receipts, expenses, ending balance) supporting restricted fund accountability. citeturn8view2turn8view3  
- **Bank reconciliation report** with reviewer sign-off trail (monthly cadence recommended in multiple nonprofit control sources). citeturn11view0turn8view4turn11view1  
- **Audit log export / change history report** (for investigations and audit readiness). citeturn9view0turn9view2  

### Family-facing reports (portal)

Keep these simple and confidence-building:
- Household statement (selected period): dues posted, payments made, balance.
- Receipts library (filter by type: subscription, donation, Madrasa).
- Student fee ledger + attendance summary.

Education portal patterns explicitly market visibility into attendance and outstanding fee balances/payment history, so these reports should be one-click and mobile-friendly. citeturn4view6turn6view2

## Differentiating and innovative options

These are optional features that can make your product feel “built for Mahallu life,” not a generic ERP. Many are validated by what existing mosque/mahallu tooling is already shipping, but you can implement them in a more integrated, committee + family portal way.

### Donation and registration kiosks

Some mosque donation platforms offer self-service, contactless kiosks that can accept donations, run campaigns/pledges, and even display program/class information so members can register/pay without admin involvement. citeturn7view0turn4view2  
How to translate that into functional requirements:
- Kiosk mode (simplified UI) for:
  - Quick donate to selected funds/campaigns
  - Subscription payments
  - Madrasa fee payments
- Instant receipt delivery to the family portal inbox (and optionally print).

### Multi-channel community updates

Some mosque platforms emphasize syncing announcements/events/prayer time updates across apps, web, and screens from a single admin update. citeturn7view1  
Product requirement spin:
- “Publish once” announcements with multiple destinations:
  - Family portal feed
  - Push/SMS/WhatsApp reminders (as permitted)
  - Optional display-mode feed for mosque screens

### Digital identity artifacts for households

Mahallu apps in the wild already include committee multi-admin access, year-wise reporting, and even ID card/token printing updates. citeturn10view0turn10view3  
Differentiator features:
- Household ID cards (printable) with QR for quick lookup at office.
- Token/queue slips for office services (certificate pickup, payments).
- Member attendance QR (optional) for Madrasa or events.

### Rentals, assets, and inventory as revenue/operations modules

Several Mahallu/mosque tools include building rental, utensil rental, fixed asset registers, and assets reports—these are “hidden” operational realities in many communities. citeturn10view3turn10view1turn5view3  
Functional requirements:
- Rental catalog (hall/rooms/utensils) + booking requests + due report/follow-up.
- Asset register: acquisition, condition, depreciation fields (optional), maintenance logs.
- Inventory/issue-return for utensils (simple stock movements).

### Life-event administration (enable per Mahallu policy)

Mahallu administration products list birth/marriage/divorce/death registrations, marriage certificates, and NOC letters as core features in some contexts. citeturn5view3turn10view3turn10view1  
If relevant to your market:
- Structured forms for events + document issuance workflows.
- Privacy controls (who can view, who can request, retention settings).

### Governance, elections, and member eligibility

Membership platforms explicitly support “voting eligibility” and automated voter list generation from member databases. citeturn6view1turn6view0  
Possible Mahallu feature set:
- Election cycle setup: eligibility criteria, cut-off dates.
- Auto-generated voter roll + objection window workflow.
- Meeting minutes + decisions archive integrated with governance.

### Transparency-by-design reporting to build community trust

Restricted fund guidance emphasizes not just tracking but also producing transparent reports that show how designated money was used. citeturn8view2turn8view3 Charity guidance also highlights that weak financial management damages reputation and public trust. citeturn4view4  
A strong differentiator is a configurable **“community transparency view”**:
- Publish a monthly summary (not raw ledger) to family portal:
  - Collections totals by category
  - Top-level spending categories
  - Project fund balances (where appropriate)
- Use anonymization/aggregation and strict permissions, consistent with data protection principles and minimization. citeturn8view5turn11view2  

### Messaging compliance and preference intelligence

Since WhatsApp-style channels have policy rules (template requirements outside a service window; escalation paths), you can differentiate by building “compliance-aware messaging” into the workflow. citeturn4view5turn1search6  
Functional requirements:
- Consent registry (who opted in, when, channel, wording reference).
- Message templates library (committee-approved standard notices).
- Audience segmentation by consent + relevance (avoid blasting people who did not opt in).

If you implement the above as a coherent system (not a pile of features), you land on the real product promise that established mosque platforms advertise—**simple for members, powerful for admins, and integrated for donations/memberships/programs**—while tailoring it tightly to Mahallu workflows and trust requirements. citeturn4view2turn4view1turn7view2