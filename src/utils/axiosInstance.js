import axios from "axios";

// Helper to check if we should use mock
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const useMock = !isLocalhost || localStorage.getItem("connected_mode") !== "true";

// Default mock databases with 7 entries each
const initialMockData = {
  users: [
    { _id: "u1", name: "Director User", email: "director@ecomax.com", role: "director" },
    { _id: "u2", name: "Admin User", email: "admin@ecomax.com", role: "admin" },
    { _id: "u3", name: "Sales User", email: "sales@ecomax.com", role: "sales" },
    { _id: "u4", name: "Service User", email: "service@ecomax.com", role: "service" },
    { _id: "u5", name: "Vikram Malhotra", email: "vikram@ecomax.com", role: "sales" },
    { _id: "u6", name: "Rajesh Kumar", email: "rajesh@ecomax.com", role: "service" },
    { _id: "u7", name: "Swapnil Gaikwad", email: "swapnil@ecomax.com", role: "service" }
  ],
  presales: [
    { _id: "ps1", date: "2026-07-01", companyName: "Tata Motors Ltd", contactPerson: "Rajesh Sharma", phone: "+91 98765 43210", email: "rajesh.sharma@tatamotors.com", product: "ECOMax-HE", source: "Referral", stage: "Qualified", estimatedValue: 450000, nextFollowUp: "2026-07-20", remarks: "Highly interested in heat exchanger optimization." },
    { _id: "ps2", date: "2026-07-02", companyName: "Reliance Industries", contactPerson: "Vikram Mehta", phone: "+91 99887 76655", email: "v.mehta@ril.com", product: "ECOMax-CT", source: "Website", stage: "Negotiation", estimatedValue: 1200000, nextFollowUp: "2026-07-18", remarks: "Need detailed discount calculations on volume purchase." },
    { _id: "ps3", date: "2026-07-05", companyName: "Infosys Campus Pune", contactPerson: "Ananya Deshmukh", phone: "+91 91234 56789", email: "ananya.d@infosys.com", product: "ECOMax-HT", source: "LinkedIn", stage: "Proposal Sent", estimatedValue: 680000, nextFollowUp: "2026-07-22", remarks: "Awaiting green light from regional facilities head." },
    { _id: "ps4", date: "2026-07-06", companyName: "Wipro Technologies Ltd", contactPerson: "Karan Johar", phone: "+91 99999 88888", email: "karan.johar@wipro.com", product: "ECOMax-HE", source: "Exhibition", stage: "Qualified", estimatedValue: 540000, nextFollowUp: "2026-07-25", remarks: "Wants a complete HVAC integration audit report first." },
    { _id: "ps5", date: "2026-07-08", companyName: "HDFC Bank HQ", contactPerson: "Sanjay Dutta", phone: "+91 77777 66666", email: "sanjay.dutta@hdfc.com", product: "ECOMax-HT", source: "Cold Call", stage: "Proposal Sent", estimatedValue: 950000, nextFollowUp: "2026-07-28", remarks: "Shared initial retrofit chiller plan and timeline." },
    { _id: "ps6", date: "2026-07-10", companyName: "JSW Steel Plant", contactPerson: "Amit Patel", phone: "+91 88888 77777", email: "amit.patel@jsw.com", product: "ECOMax-CT", source: "Website", stage: "Negotiation", estimatedValue: 3200000, nextFollowUp: "2026-08-02", remarks: "Technical validation of water flow rates is in progress." },
    { _id: "ps7", date: "2026-07-12", companyName: "Mahindra & Mahindra", contactPerson: "Vijay Patil", phone: "+91 98900 12345", email: "patil.vijay@mahindra.com", product: "ECOMax-HE", source: "Referral", stage: "Lead", estimatedValue: 850000, nextFollowUp: "2026-07-31", remarks: "Requesting details on installation and tax break ups." }
  ],
  leads: [
    { _id: "l1", enquiryDate: "2026-06-15", companyName: "Adani Green Energy", contactPerson: "Amit Patel", designation: "Procurement Manager", email: "amit.patel@adani.com", phone: "+91 88888 77777", whatsapp: "+91 88888 77777", product: "ECOMax-HE", enquiryValue: 850000, source: "Exhibition", leadScore: 85, location: "Ahmedabad, Gujarat", status: "Proposal", notes: "Met at Solar Tech Expo. Very hot lead." },
    { _id: "l2", enquiryDate: "2026-06-18", companyName: "Larsen & Toubro (L&T)", contactPerson: "Sanjay Dutta", designation: "Technical Director", email: "sanjay.dutta@lntecc.com", phone: "+91 77777 66666", whatsapp: "+91 77777 66666", product: "ECOMax-SE", enquiryValue: 2400000, source: "Cold Call", leadScore: 60, location: "Mumbai, Maharashtra", status: "Lead", notes: "Initial discovery call completed. Scheduled technical demo." },
    { _id: "l3", enquiryDate: "2026-06-25", companyName: "Wipro Technologies", contactPerson: "Karan Johar", designation: "Facilities VP", email: "karan.johar@wipro.com", phone: "+91 99999 88888", whatsapp: "+91 99999 88888", product: "ECOMax-HT", enquiryValue: 540000, source: "Website", leadScore: 90, location: "Bangalore, Karnataka", status: "Won", notes: "Closed deal on energy efficient cooling solutions." },
    { _id: "l4", enquiryDate: "2026-06-28", companyName: "Tata Steel Ltd", contactPerson: "Rajesh Sharma", designation: "Plant Operations Head", email: "rajesh@tatasteel.com", phone: "+91 98765 43210", whatsapp: "+91 98765 43210", product: "ECOMax-HE", enquiryValue: 1500000, source: "Referral", leadScore: 80, location: "Jamshedpur, JH", status: "Proposal", notes: "Awaiting final quote approvals from finance team." },
    { _id: "l5", enquiryDate: "2026-07-02", companyName: "Godrej Consumer Products", contactPerson: "Nitin Paranjpe", designation: "GM Procurement", email: "nitin.p@godrej.com", phone: "+91 98200 45678", whatsapp: "+91 98200 45678", product: "ECOMax-HE", enquiryValue: 750000, source: "LinkedIn", leadScore: 70, location: "Mumbai, MH", status: "Lead", notes: "Shared presentation deck on gross energy savings." },
    { _id: "l6", enquiryDate: "2026-07-05", companyName: "ICICI Bank Data Center", contactPerson: "Ananya Deshmukh", designation: "Infrastructure VP", email: "ananya.d@icici.com", phone: "+91 91234 56789", whatsapp: "+91 91234 56789", product: "ECOMax-HT", enquiryValue: 480000, source: "Website", leadScore: 95, location: "Hyderabad, TS", status: "Won", notes: "Active contract signed and system ready for delivery." },
    { _id: "l7", enquiryDate: "2026-07-08", companyName: "ITC Hotels Group", contactPerson: "Debashish Roy", designation: "Chief Engineer", email: "d.roy@itc.in", phone: "+91 93300 54321", whatsapp: "+91 93300 54321", product: "ECOMax-CT", enquiryValue: 850000, source: "Exhibition", leadScore: 75, location: "Kolkata, WB", status: "Lead", notes: "Requested a noise-emission audit report for the rooftop unit." }
  ],
  opportunities: [
    { _id: "o1", opportunityName: "Tata Steel Plant 2 Upgrade", client: "Tata Steel Ltd", product: "ECOMax-HE", value: 1500000, stage: "Negotiation", probability: 75, closeDate: "2026-08-15", notes: "Refining pricing matrix and service level commitments." },
    { _id: "o2", opportunityName: "JSW Energy cooling towers", client: "JSW Steel", product: "ECOMax-CT", value: 3200000, stage: "Proposal", probability: 50, closeDate: "2026-09-01", notes: "Competitor is offering slightly lower rates. Highlighting our efficiency features." },
    { _id: "o3", opportunityName: "HDFC HQ chiller retrofit", client: "HDFC Bank Ltd", product: "ECOMax-HT", value: 950000, stage: "Closed Won", probability: 100, closeDate: "2026-07-10", notes: "Agreement signed. Forwarded details to service team for deployment schedule." },
    { _id: "o4", opportunityName: "Reliance Jamnagar Plant Phase 3", client: "Reliance Industries", product: "ECOMax-CT", value: 4500000, stage: "Qualification", probability: 25, closeDate: "2026-11-15", notes: "Initial round of RFQ documents submitted to technical desk." },
    { _id: "o5", opportunityName: "Infosys Hinjewadi Block 5", client: "Infosys Campus Pune", product: "ECOMax-HT", value: 1800000, stage: "Proposal", probability: 60, closeDate: "2026-08-30", notes: "HVAC cooling loop proposal submitted. Awaiting facilities manager review." },
    { _id: "o6", opportunityName: "Apollo Chennai Retrofit", client: "Apollo Hospitals", product: "ECOMax-HE", value: 1200000, stage: "Negotiation", probability: 80, closeDate: "2026-07-28", notes: "Discussing payment milestones and night shift working guidelines." },
    { _id: "o7", opportunityName: "DLF Cyber Park Chiller", client: "DLF Cyber City", product: "ECOMax-CT", value: 2800000, stage: "Closed Lost", probability: 0, closeDate: "2026-07-05", notes: "Lost due to competitor's heavy localization discounting model." }
  ],
  enquiries: [
    { _id: "eq1", enquiryNumber: "ENQ-20260712-0001", enquiryDate: "2026-07-10", customerName: "Mahindra & Mahindra", customerType: "Corporate", projectName: "Chakan Plant Retrofit", location: "Pune, MH", product: "ECOMax-HE", contactPerson: "Vijay Patil", phone: "+91 98900 12345", email: "patil.vijay@mahindra.com", stage: "Proposal", remarks: "Sent quotation Q-2026-001. Awaiting response." },
    { _id: "eq2", enquiryNumber: "ENQ-20260712-0002", enquiryDate: "2026-07-11", customerName: "ITC Limited", customerType: "Enterprise", projectName: "Hotel Chiller Automation", location: "Kolkata, WB", product: "ECOMax-HT", contactPerson: "Debashish Roy", phone: "+91 93300 54321", email: "d.roy@itc.in", stage: "Lead", remarks: "Customer wants high cooling efficiency with minimal noise." },
    { _id: "eq3", enquiryNumber: "ENQ-20260712-0003", enquiryDate: "2026-07-12", customerName: "Aditya Birla Fashion", customerType: "Retail Enterprise", projectName: "Warehouse HVAC Integration", location: "Delhi NCR", product: "ECOMax-SE", contactPerson: "Rohan Varma", phone: "+91 98100 98765", email: "rohan.varma@adityabirla.com", stage: "Won", remarks: "Order confirmed, PO received." },
    { _id: "eq4", enquiryNumber: "ENQ-20260712-0004", enquiryDate: "2026-07-13", customerName: "Godrej Consumer Products", customerType: "Corporate", projectName: "Factory Ventilation System", location: "Baddi, HP", product: "ECOMax-HE", contactPerson: "Nitin Paranjpe", phone: "+91 98200 45678", email: "nitin.p@godrej.com", stage: "Lead", remarks: "Initial requirements gathered. Drafting layout design." },
    { _id: "eq5", enquiryNumber: "ENQ-20260712-0005", enquiryDate: "2026-07-14", customerName: "Apollo Hospitals", customerType: "Healthcare", projectName: "ICU Air Handling Retrofit", location: "Chennai, TN", product: "ECOMax-HT", contactPerson: "R. Ramesh", phone: "+91 94440 98210", email: "ramesh.r@apollo.com", stage: "Proposal", remarks: "Shared revised layouts with medical facilities head." },
    { _id: "eq6", enquiryNumber: "ENQ-20260712-0006", enquiryDate: "2026-07-15", customerName: "ICICI Bank Data Center", customerType: "Enterprise", projectName: "Server Cooling Optimization", location: "Hyderabad, TS", product: "ECOMax-HE", contactPerson: "Ananya Deshmukh", phone: "+91 91234 56789", email: "ananya.d@icici.com", stage: "Won", remarks: "Project approved. Awaiting kickoff date." },
    { _id: "eq7", enquiryNumber: "ENQ-20260712-0007", enquiryDate: "2026-07-16", customerName: "DLF Cyber City", customerType: "Corporate", projectName: "HVAC Efficiency Upgrades", location: "Gurugram, HR", product: "ECOMax-CT", contactPerson: "Sanjay Dutta", phone: "+91 77777 66666", email: "sanjay.d@dlf.com", stage: "Lost", remarks: "Competitor bid won the tender." }
  ],
  quotations: [
    { _id: "q1", quoteNo: "Q-2026-001", date: "2026-07-10", customer: "Maruti Suzuki India Ltd", subject: "Supply of high-efficiency cooling loops", validUntil: "2026-08-10", lineItems: [{ description: "ECOMax-HE Main System Unit", quantity: 2, unitPrice: 350000, total: 700000 }, { description: "Installation & System Calibration Kit", quantity: 1, unitPrice: 50000, total: 50000 }], total: 750000, status: "Approved", notes: "Special discount of 5% on base parts included." },
    { _id: "q2", quoteNo: "Q-2026-002", date: "2026-07-11", customer: "Bajaj Auto Ltd", subject: "Installation of Condenser Loops", validUntil: "2026-08-11", lineItems: [{ description: "ECOMax-CT Cooling Tower Module", quantity: 1, unitPrice: 850000, total: 850000 }], total: 850000, status: "Sent", notes: "Awaiting approval from Bajaj plant manager." },
    { _id: "q3", quoteNo: "Q-2026-003", date: "2026-07-12", customer: "Hero MotoCorp Ltd", subject: "Comprehensive HVAC Revamp", validUntil: "2026-08-12", lineItems: [{ description: "ECOMax-HT Heat Treatment Loop", quantity: 3, unitPrice: 400000, total: 1200000 }, { description: "Pre-installation Site Preparation Support", quantity: 1, unitPrice: 80000, total: 80000 }], total: 1280000, status: "Draft", notes: "Draft prepared for review by internal technical director." },
    { _id: "q4", quoteNo: "Q-2026-004", date: "2026-07-13", customer: "Tata Steel Ltd", subject: "Plant 2 Coolers Supply", validUntil: "2026-08-13", lineItems: [{ description: "ECOMax-HE System Model B", quantity: 1, unitPrice: 1500000, total: 1500000 }], total: 1500000, status: "Approved", notes: "Price includes custom piping configurations." },
    { _id: "q5", quoteNo: "Q-2026-005", date: "2026-07-14", customer: "Infosys Campus Pune", subject: "IT Block cooling tower overhaul", validUntil: "2026-08-14", lineItems: [{ description: "ECOMax-CT Cooling Module Upgrade", quantity: 2, unitPrice: 900000, total: 1800000 }], total: 1800000, status: "Sent", notes: "Awaiting purchase committee validation." },
    { _id: "q6", quoteNo: "Q-2026-006", date: "2026-07-15", customer: "Apollo Hospitals Chennai", subject: "Cleanroom Air Handling Installation", validUntil: "2026-08-15", lineItems: [{ description: "ECOMax-HT Cleanroom Air Handler Unit", quantity: 1, unitPrice: 1200000, total: 1200000 }], total: 1200000, status: "Approved", notes: "Work must proceed only during night shifts." },
    { _id: "q7", quoteNo: "Q-2026-007", date: "2026-07-16", customer: "Reliance Jamnagar", subject: "Phase 3 Cooling Loops Equipment Supply", validUntil: "2026-08-16", lineItems: [{ description: "ECOMax-CT Main Chassis Unit", quantity: 5, unitPrice: 900000, total: 4500000 }], total: 4500000, status: "Draft", notes: "High volume pricing discounts applied." }
  ],
  proformas: [
    { _id: "p1", invoiceNo: "PI-2026-001", invoiceDate: "2026-07-11", customer: "Godrej Consumer Products", referenceQuote: "Q-2026-001", lineItems: [{ description: "ECOMax-HE Main System Unit", qty: 2, unitPrice: 350000, total: 700000 }, { description: "Installation & System Calibration Kit", qty: 1, unitPrice: 50000, total: 50000 }], subtotal: 750000, tax: 135000, total: 885000, paymentTerms: "50% Advance, 50% before dispatch", status: "Approved" },
    { _id: "p2", invoiceNo: "PI-2026-002", invoiceDate: "2026-07-12", customer: "Dr Reddy's Laboratories", referenceQuote: "Q-2026-002", lineItems: [{ description: "ECOMax-CT Cooling Tower Module", qty: 1, unitPrice: 850000, total: 850000 }], subtotal: 850000, tax: 153000, total: 1003000, paymentTerms: "30% Advance, 70% against delivery", status: "Sent" },
    { _id: "p3", invoiceNo: "PI-2026-003", invoiceDate: "2026-07-13", customer: "Hero MotoCorp Ltd", referenceQuote: "Q-2026-003", lineItems: [{ description: "ECOMax-HT Heat Treatment Loop", qty: 3, unitPrice: 400000, total: 1200000 }], subtotal: 1200000, tax: 216000, total: 1416000, paymentTerms: "100% Cash Against Documents", status: "Draft" },
    { _id: "p4", invoiceNo: "PI-2026-004", invoiceDate: "2026-07-14", customer: "Tata Steel Ltd", referenceQuote: "Q-2026-004", lineItems: [{ description: "ECOMax-HE System Model B", qty: 1, unitPrice: 1500000, total: 1500000 }], subtotal: 1500000, tax: 270000, total: 1770000, paymentTerms: "50% Advance, 50% within 15 days of installation", status: "Approved" },
    { _id: "p5", invoiceNo: "PI-2026-005", invoiceDate: "2026-07-15", customer: "Infosys Campus Pune", referenceQuote: "Q-2026-005", lineItems: [{ description: "ECOMax-CT Cooling Module Upgrade", qty: 2, unitPrice: 900000, total: 1800000 }], subtotal: 1800000, tax: 324000, total: 2124000, paymentTerms: "Net 30 Days", status: "Sent" },
    { _id: "p6", invoiceNo: "PI-2026-006", invoiceDate: "2026-07-16", customer: "Apollo Hospitals Chennai", referenceQuote: "Q-2026-006", lineItems: [{ description: "ECOMax-HT Cleanroom Air Handler Unit", qty: 1, unitPrice: 1200000, total: 1200000 }], subtotal: 1200000, tax: 216000, total: 1416000, paymentTerms: "10% Advance, 90% post commissioning", status: "Approved" },
    { _id: "p7", invoiceNo: "PI-2026-007", invoiceDate: "2026-07-17", customer: "Reliance Jamnagar", referenceQuote: "Q-2026-007", lineItems: [{ description: "ECOMax-CT Main Chassis Unit", qty: 5, unitPrice: 900000, total: 4500000 }], subtotal: 4500000, tax: 810000, total: 5310000, paymentTerms: "Letter of Credit, 60 Days", status: "Draft" }
  ],
  "sales-invoices": [
    { _id: "si1", invoiceNo: "INV-2026-001", invoiceDate: "2026-07-10", customer: "CIPLA Limited", referenceProforma: "PI-2026-001", paymentTerms: "30 Days", dueDate: "2026-08-10", lineItems: [{ description: "ECOMax-HE Main System Unit", product: "ECOMax-HE", qty: 2, unitPrice: 350000, discount: 5, total: 665000 }, { description: "Installation Support Kit", product: "Others", qty: 1, unitPrice: 50000, discount: 0, total: 50000 }], subtotal: 715000, tax: 128700, total: 843700, approvalStatus: "Approved" },
    { _id: "si2", invoiceNo: "INV-2026-002", invoiceDate: "2026-07-12", customer: "DLF Cyber City", referenceProforma: "PI-2026-002", paymentTerms: "15 Days", dueDate: "2026-07-27", lineItems: [{ description: "ECOMax-CT Cooling Tower Module", product: "ECOMax-CT", qty: 1, unitPrice: 850000, discount: 0, total: 850000 }], subtotal: 850000, tax: 153000, total: 1003000, approvalStatus: "Pending Approval" },
    { _id: "si3", invoiceNo: "INV-2026-003", invoiceDate: "2026-07-13", customer: "Hero MotoCorp Ltd", referenceProforma: "PI-2026-003", paymentTerms: "30 Days", dueDate: "2026-08-12", lineItems: [{ description: "ECOMax-HT Heat Treatment Loop", product: "ECOMax-HT", qty: 3, unitPrice: 400000, discount: 2, total: 1176000 }], subtotal: 1176000, tax: 211680, total: 1387680, approvalStatus: "Approved" },
    { _id: "si4", invoiceNo: "INV-2026-004", invoiceDate: "2026-07-14", customer: "Tata Steel Ltd", referenceProforma: "PI-2026-004", paymentTerms: "45 Days", dueDate: "2026-08-28", lineItems: [{ description: "ECOMax-HE System Model B", product: "ECOMax-HE", qty: 1, unitPrice: 1500000, discount: 0, total: 1500000 }], subtotal: 1500000, tax: 270000, total: 1770000, approvalStatus: "Draft" },
    { _id: "si5", invoiceNo: "INV-2026-005", invoiceDate: "2026-07-15", customer: "Infosys Campus Pune", referenceProforma: "PI-2026-005", paymentTerms: "30 Days", dueDate: "2026-08-14", lineItems: [{ description: "ECOMax-CT Cooling Module Upgrade", product: "ECOMax-CT", qty: 2, unitPrice: 900000, discount: 4, total: 1728000 }], subtotal: 1728000, tax: 311040, total: 2039040, approvalStatus: "Pending Approval" },
    { _id: "si6", invoiceNo: "INV-2026-006", invoiceDate: "2026-07-16", customer: "Apollo Hospitals Chennai", referenceProforma: "PI-2026-006", paymentTerms: "Immediate", dueDate: "2026-07-16", lineItems: [{ description: "ECOMax-HT Cleanroom Air Handler Unit", product: "ECOMax-HT", qty: 1, unitPrice: 1200000, discount: 0, total: 1200000 }], subtotal: 1200000, tax: 216000, total: 1416000, approvalStatus: "Approved" },
    { _id: "si7", invoiceNo: "INV-2026-007", invoiceDate: "2026-07-17", customer: "Godrej Consumer Products", referenceProforma: "PI-2026-001", paymentTerms: "30 Days", dueDate: "2026-08-16", lineItems: [{ description: "ECOMax-HE Main System Unit", product: "ECOMax-HE", qty: 2, unitPrice: 350000, discount: 0, total: 700000 }], subtotal: 700000, tax: 126000, total: 826000, approvalStatus: "Approved" }
  ],
  "purchase-orders": [
    { _id: "po1", poNo: "PO-2026-001", poDate: "2026-07-09", vendor: "Steel Supplier Inc", deliveryDate: "2026-07-30", paymentTerms: "45 Days", shippingAddress: "Ecomax Pune Plant Warehouse, Chakan, MH", lineItems: [{ description: "High-grade alloy steel pipes (3-inch)", product: "Others", qty: 100, unitPrice: 1500, total: 150000 }, { description: "Fittings and copper couplings pack", product: "Others", qty: 20, unitPrice: 2500, total: 50000 }], total: 200000, terms: "Prices include freight and insurance charges.", status: "Ordered" },
    { _id: "po2", poNo: "PO-2026-002", poDate: "2026-07-12", vendor: "Tech Solutions Valve Corp", deliveryDate: "2026-08-05", paymentTerms: "30 Days", shippingAddress: "Ecomax Bangalore Assembly Unit, Electronic City", lineItems: [{ description: "Pneumatic Control Valves V-42", product: "Others", qty: 5, unitPrice: 42000, total: 210000 }], total: 210000, terms: "Goods must match standard calibration logs.", status: "Draft" },
    { _id: "po3", poNo: "PO-2026-003", poDate: "2026-07-13", vendor: "Apex Engineering Parts", deliveryDate: "2026-07-28", paymentTerms: "15 Days", shippingAddress: "Ecomax Pune Plant Warehouse, Chakan, MH", lineItems: [{ description: "Custom Temperature Sensors T-9", product: "Others", qty: 12, unitPrice: 5000, total: 60000 }], total: 60000, terms: "Warranty 2 years must be included in packing slip.", status: "Ordered" },
    { _id: "po4", poNo: "PO-2026-004", poDate: "2026-07-14", vendor: "Global Tech Logistics", deliveryDate: "2026-07-20", paymentTerms: "15 Days", shippingAddress: "Ecomax Mumbai Transit Hub, Belapur", lineItems: [{ description: "Heavy Duty Freight Shifting - Jamnagar", product: "Others", qty: 1, unitPrice: 85000, total: 85000 }], total: 85000, terms: "Loading and unloading charges included.", status: "Completed" },
    { _id: "po5", poNo: "PO-2026-005", poDate: "2026-07-15", vendor: "Steel Supplier Inc", deliveryDate: "2026-08-10", paymentTerms: "45 Days", shippingAddress: "Ecomax Pune Plant Warehouse, Chakan, MH", lineItems: [{ description: "Alloy structural plates (10mm)", product: "Others", qty: 30, unitPrice: 4000, total: 120000 }], total: 120000, terms: "Mill test certifications required upon delivery.", status: "Ordered" },
    { _id: "po6", poNo: "PO-2026-006", poDate: "2026-07-16", vendor: "Tech Solutions Valve Corp", deliveryDate: "2026-08-15", paymentTerms: "30 Days", shippingAddress: "Ecomax Bangalore Assembly Unit, Electronic City", lineItems: [{ description: "Solenoid Valves S-12", product: "Others", qty: 10, unitPrice: 15000, total: 150000 }], total: 150000, terms: "OEM inspection report must accompany invoice.", status: "Draft" },
    { _id: "po7", poNo: "PO-2026-007", poDate: "2026-07-17", vendor: "Apex Engineering Parts", deliveryDate: "2026-08-01", paymentTerms: "30 Days", shippingAddress: "Ecomax Pune Plant Warehouse, Chakan, MH", lineItems: [{ description: "PLC Module Board E-9", product: "Others", qty: 2, unitPrice: 45000, total: 90000 }], total: 90000, terms: "Calibration certificate required.", status: "Ordered" }
  ],
  "work-orders": [
    { _id: "wo1", woNo: "WO-2026-001", woDate: "2026-07-08", customer: "Apollo Hospitals", referenceQuotePO: "PO-APOLLO-9821", projectName: "Block A Chiller Plant Revamp", location: "Chennai, TN", startDate: "2026-07-15", endDate: "2026-07-30", tasks: [{ description: "Dismantling old piping and structure layout", product: "Others", qty: 1, assignedTo: "Chennai Service Team" }, { description: "Installing ECOMax-HE heat recovery exchanger", product: "ECOMax-HE", qty: 1, assignedTo: "Technician R. Ramesh" }], specialInstructions: "Work must proceed only during night shifts to minimize patient disruption.", status: "In Progress" },
    { _id: "wo2", woNo: "WO-2026-002", woDate: "2026-07-12", customer: "Fortis Healthcare", referenceQuotePO: "PO-FORT-4422", projectName: "HVAC Efficiency Integration", location: "Gurugram, HR", startDate: "2026-08-01", endDate: "2026-08-10", tasks: [{ description: "Pre-commissioning site testing check", product: "ECOMax-HT", qty: 1, assignedTo: "Gurgaon Lead Eng" }], specialInstructions: "Confirm site checklist forms are filled before deployment.", status: "Draft" },
    { _id: "wo3", woNo: "WO-2026-003", woDate: "2026-07-13", customer: "Tata Steel Ltd", referenceQuotePO: "PO-TATA-5561", projectName: "Plant 2 Coolers Installation", location: "Jamshedpur, JH", startDate: "2026-07-20", endDate: "2026-08-05", tasks: [{ description: "Installation & piping assembly", product: "ECOMax-HE", qty: 1, assignedTo: "Jamshedpur Tech Team" }], specialInstructions: "PPE compliance audit mandatory before entry.", status: "In Progress" },
    { _id: "wo4", woNo: "WO-2026-004", woDate: "2026-07-14", customer: "ICICI Bank Data Center", referenceQuotePO: "PO-ICICI-1109", projectName: "Rooftop Cooling Tower Fitment", location: "Hyderabad, TS", startDate: "2026-07-18", endDate: "2026-07-22", tasks: [{ description: "Mounting main tower chassis and hookup", product: "ECOMax-CT", qty: 1, assignedTo: "Hyderabad Tech Team" }], specialInstructions: "Rooftop structural load confirmation signed off.", status: "Completed" },
    { _id: "wo5", woNo: "WO-2026-005", woDate: "2026-07-15", customer: "Godrej Consumer Products", referenceQuotePO: "PO-GODR-8822", projectName: "Factory HVAC Ventilation Upgrade", location: "Baddi, HP", startDate: "2026-08-15", endDate: "2026-08-30", tasks: [{ description: "HVAC ducting work and sensor installation", product: "ECOMax-HE", qty: 1, assignedTo: "Northern Service Hub" }], specialInstructions: "Work heights require dual-lanyard harness.", status: "Draft" },
    { _id: "wo6", woNo: "WO-2026-006", woDate: "2026-07-16", customer: "Standard Chartered HQ", referenceQuotePO: "PO-STAN-3321", projectName: "HVAC Chiller Loop Calibration", location: "Mumbai, MH", startDate: "2026-07-22", endDate: "2026-07-25", tasks: [{ description: "Sensor calibration and PLC logic gates tune up", product: "ECOMax-HT", qty: 1, assignedTo: "Senior Eng Rajesh S." }], specialInstructions: "Coordinate check times with building facilities manager.", status: "Completed" },
    { _id: "wo7", woNo: "WO-2026-007", woDate: "2026-07-17", customer: "HDFC Bank HQ", referenceQuotePO: "PO-HDFC-9911", projectName: "HQ chiller loop retrofit assembly", location: "Mumbai, MH", startDate: "2026-07-25", endDate: "2026-08-10", tasks: [{ description: "Chiller retrofit assembly and dry run testing", product: "ECOMax-HT", qty: 1, assignedTo: "Technician Swapnil G." }], specialInstructions: "Report dry-run performance values directly to PM.", status: "In Progress" }
  ],
  amc: [
    { _id: "am1", client: "Standard Chartered Bank HQ", contractNo: "AMC-2026-SC01", product: "ECOMax-HT", startDate: "2026-01-01", endDate: "2026-12-31", contractValue: 480000, terms: "Includes 4 quarterly visits and emergency breakdowns resolution.", status: "Active" },
    { _id: "am2", client: "ICICI Bank Data Center", contractNo: "AMC-2026-ICICI05", product: "ECOMax-HE", startDate: "2025-09-01", endDate: "2026-08-31", contractValue: 850000, terms: "Includes parts replacement and monthly routine audits.", status: "Expiring Soon" },
    { _id: "am3", client: "Tata Motors Chakan Plant", contractNo: "AMC-2026-TATA09", product: "ECOMax-HE", startDate: "2026-03-01", endDate: "2027-02-28", contractValue: 620000, terms: "Semi-annual audit check and quarterly filters sweep.", status: "Active" },
    { _id: "am4", client: "CIPLA Verna Goa Factory", contractNo: "AMC-2026-CIPLA02", product: "ECOMax-HE", startDate: "2025-07-01", endDate: "2026-06-30", contractValue: 550000, terms: "Emergency breakdown line response time under 12 hours.", status: "Expired" },
    { _id: "am5", client: "Infosys Campus Bangalore", contractNo: "AMC-2026-INFO11", product: "ECOMax-HT", startDate: "2026-05-01", endDate: "2027-04-30", contractValue: 920000, terms: "Bi-monthly sensor checks and complete PLC logic calibration.", status: "Active" },
    { _id: "am6", client: "Godrej Vikhroli Campus", contractNo: "AMC-2026-GODR08", product: "ECOMax-CT", startDate: "2025-11-01", endDate: "2026-10-31", contractValue: 420000, terms: "Monthly water scaling clearing work included.", status: "Expiring Soon" },
    { _id: "am7", client: "Apollo Hospitals Chennai", contractNo: "AMC-2026-APOL03", product: "ECOMax-HT", startDate: "2026-04-01", endDate: "2027-03-31", contractValue: 780000, terms: "Strict particulate control and HEPA compliance audits.", status: "Active" }
  ],
  "non-amc": [
    { _id: "na1", client: "Hindustan Unilever Ltd", product: "ECOMax-HE", contactPerson: "Nitin Paranjpe", phone: "+91 98200 45678", email: "nitin.p@hul.com", location: "Mumbai Main Plant", serviceFreq: "4 times", annualSpend: 320000, lastService: "2026-05-15", conversionScore: 78, potential: "High", notes: "Strong potential to convert into AMC. Follow up in August." },
    { _id: "na2", client: "Nestle India Foods", product: "ECOMax-CT", contactPerson: "Suresh Narayanan", phone: "+91 99300 98765", email: "suresh.n@nestle.in", location: "Moga Factory, PB", serviceFreq: "2 times", annualSpend: 150000, lastService: "2026-03-10", conversionScore: 45, potential: "Medium", notes: "Customer relies on local maintenance but wants OEM support for calibration." },
    { _id: "na3", client: "ITC Ltd Hotel Chennai", product: "ECOMax-HT", contactPerson: "Debashish Roy", phone: "+91 93300 54321", email: "d.roy@itc.in", location: "Chennai, TN", serviceFreq: "1 time", annualSpend: 95000, lastService: "2026-06-01", conversionScore: 88, potential: "High", notes: "Keen on AMC proposal. Drafting customized SLA model." },
    { _id: "na4", client: "Maruti Suzuki Manesar", product: "ECOMax-HE", contactPerson: "Vijay Patil", phone: "+91 98900 12345", email: "v.patil@maruti.co.in", location: "Manesar, HR", serviceFreq: "6 times", annualSpend: 480000, lastService: "2026-07-02", conversionScore: 60, potential: "Medium", notes: "High component wear frequency. Suggesting AMC." },
    { _id: "na5", client: "DLF Mall Saket Delhi", product: "ECOMax-CT", contactPerson: "Sanjay Dutta", phone: "+91 77777 66666", email: "sanjay.d@dlf.in", location: "New Delhi", serviceFreq: "3 times", annualSpend: 210000, lastService: "2026-04-18", conversionScore: 50, potential: "Medium", notes: "Frequent scaling issues due to regional groundwater hardness." },
    { _id: "na6", client: "L&T ECC Head Office", product: "ECOMax-SE", contactPerson: "Sanjay Dutta", phone: "+91 77777 66666", email: "sanjay.d@lntecc.com", location: "Chennai, TN", serviceFreq: "1 time", annualSpend: 80000, lastService: "2026-01-10", conversionScore: 30, potential: "Low", notes: "Only calls for emergency valve leaks." },
    { _id: "na7", client: "Wipro Tech Hinjewadi", product: "ECOMax-HT", contactPerson: "Karan Johar", phone: "+91 99999 88888", email: "karan.j@wipro.com", location: "Pune, MH", serviceFreq: "5 times", annualSpend: 360000, lastService: "2026-07-11", conversionScore: 92, potential: "High", notes: "Won the conversion, contract currently under draft." }
  ],
  vendors: [
    { _id: "v1", vendorName: "Apex Engineering Parts", contactPerson: "Dinesh Shah", category: "Parts Supplier", email: "dinesh@apexparts.in", phone: "+91 98220 11223", whatsapp: "+91 98220 11223", gstNo: "27AAACA1234F1Z8", address: "Industrial Area Phase 2, Chinchwad, Pune", paymentTerms: "30 Days", status: "Active" },
    { _id: "v2", vendorName: "Global Tech Logistics", contactPerson: "Priya Nair", category: "Freight Logistics", email: "priya@globaltechlog.com", phone: "+91 99110 55667", whatsapp: "+91 99110 55667", gstNo: "27BBBCB5678K2ZA", address: "Logistics Hub Sector 18, Navi Mumbai", paymentTerms: "15 Days", status: "Active" },
    { _id: "v3", vendorName: "Steel Supplier Inc", contactPerson: "Rajesh Sharma", category: "Raw Materials", email: "sales@steelsupplier.in", phone: "+91 98765 00998", whatsapp: "+91 98765 00998", gstNo: "27CCCDC9876D1Z2", address: "MIDC Sector 4, Bhosari, Pune", paymentTerms: "45 Days", status: "Active" },
    { _id: "v4", vendorName: "Tech Solutions Valve Corp", contactPerson: "Amit Patel", category: "Valves Supplier", email: "valves@techsolutions.com", phone: "+91 88888 11223", whatsapp: "+91 88888 11223", gstNo: "24DDDDD1122A1Z4", address: "GIDC Industrial Estate, Vadodara, GJ", paymentTerms: "30 Days", status: "Active" },
    { _id: "v5", vendorName: "Pneumatics Control Labs", contactPerson: "Swapnil Gaikwad", category: "Pneumatics", email: "info@pneumaticslabs.com", phone: "+91 99220 33445", whatsapp: "+91 99220 33445", gstNo: "27EEEEE3344B1Z5", address: "Electronic Zone MIDC, Mahape, Navi Mumbai", paymentTerms: "30 Days", status: "Inactive" },
    { _id: "v6", vendorName: "Precision Calibration Services", contactPerson: "Rajesh Kumar", category: "Calibration Lab", email: "calib@precisionlabs.in", phone: "+91 98110 44556", whatsapp: "+91 98110 44556", gstNo: "27FFFFF4455C1Z6", address: "TTC Industrial Area, Rabale, Navi Mumbai", paymentTerms: "30 Days", status: "Active" },
    { _id: "v7", vendorName: "Vikas Structural Fab", contactPerson: "Vijay Patil", category: "Structural Fab", email: "vikas@fabstructural.com", phone: "+91 98900 88776", whatsapp: "+91 98900 88776", gstNo: "27GGGGG8877D1Z7", address: "Talawade Fab Zone, Pune, MH", paymentTerms: "45 Days", status: "Active" }
  ],
  service: [
    { _id: "s1", customerName: "Tech Mahindra Hinjewadi", issue: "System efficiency dropped by 15%", description: "Heat exchange loops report elevated outlet temperature values. Scaling buildup suspected.", assignedTo: "Technician Swapnil G.", priority: "High", status: "In Progress" },
    { _id: "s2", customerName: "Cognizant Technology Solutions", issue: "Annual Calibration Check", description: "Standard annual calibration requested for cooling towers temperature sensors and PLC logic gates.", assignedTo: "Technician R. Ramesh", priority: "Medium", status: "Open" },
    { _id: "s3", customerName: "Capgemini Pune", issue: "Pressure Valve Leakage Repair", description: "Small minor leak detected at coupling Joint B. Replaced seals and tested joint pressure levels.", assignedTo: "Senior Eng Rajesh S.", priority: "Low", status: "Closed" },
    { _id: "s4", customerName: "Tata Motors Chakan Plant", issue: "Quarterly filter replacement", description: "Routine service sweep for filters and cleaning scaling from secondary condenser line.", assignedTo: "Technician Swapnil G.", priority: "Medium", status: "Open" },
    { _id: "s5", customerName: "Standard Chartered HQ", issue: "Temperature Sensor Out of Bound", description: "Outlet temperature sensors reporting sporadic high spikes. Re-wiring or board replacement required.", assignedTo: "Senior Eng Rajesh S.", priority: "High", status: "In Progress" },
    { _id: "s6", customerName: "ICICI Bank Data Center", issue: "Fan Motor Vibration Noise", description: "Cooling tower fan assembly reporting elevated dB noise. Inspecting rotor balances.", assignedTo: "Technician R. Ramesh", priority: "High", status: "Open" },
    { _id: "s7", customerName: "Godrej Vikhroli Campus", issue: "AMC routine audit check", description: "Monthly contract check for compressor scaling and pump flow rates validation.", assignedTo: "Technician Swapnil G.", priority: "Low", status: "Closed" }
  ],
  sales: [
    { _id: "so1", customerName: "Bharat Heavy Electricals (BHEL)", product: "ECOMax-HE", quantity: 2, price: 350000, totalAmount: 700000, status: "Completed" },
    { _id: "so2", customerName: "NTPC Ramagundem", product: "ECOMax-CT", quantity: 1, price: 850000, totalAmount: 850000, status: "Processing" },
    { _id: "so3", customerName: "ONGC Mumbai Offshore", product: "ECOMax-HT", quantity: 3, price: 400000, totalAmount: 1200000, status: "Pending" },
    { _id: "so4", customerName: "L&T Powai Plant", product: "ECOMax-HE", quantity: 1, price: 350000, totalAmount: 350000, status: "Completed" },
    { _id: "so5", customerName: "Tata Power Trombay", product: "ECOMax-CT", quantity: 2, price: 850000, totalAmount: 1700000, status: "Processing" },
    { _id: "so6", customerName: "Reliance Industries Jamnagar", product: "ECOMax-HT", quantity: 5, price: 400000, totalAmount: 2000000, status: "Pending" },
    { _id: "so7", customerName: "JSW Steel Bellary", product: "ECOMax-HE", quantity: 4, price: 350000, totalAmount: 1400000, status: "Completed" }
  ]
};

const getCollection = (name) => {
  const data = localStorage.getItem(`mock_db_${name}`);
  if (!data) {
    localStorage.setItem(`mock_db_${name}`, JSON.stringify(initialMockData[name] || []));
    return initialMockData[name] || [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialMockData[name] || [];
  }
};

const saveCollection = (name, list) => {
  localStorage.setItem(`mock_db_${name}`, JSON.stringify(list));
};

const getPayload = (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }
  return data;
};

// Custom mock adapter
const mockAdapter = async (config) => {
  const urlPath = config.url.replace(/^https?:\/\/[^\/]+/, "").split("?")[0];
  const method = config.method.toUpperCase();

  // Simple response delay to mimic latency and allow animations (skeleton, loading transitions)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 1. Handle analytics overview
  if (urlPath.includes("/api/analytics/overview") && method === "GET") {
    const sales = getCollection("sales");
    const invoices = getCollection("sales-invoices");
    const service = getCollection("service");
    const users = getCollection("users");

    const totalRevenue = invoices
      .filter(i => i.approvalStatus === "Approved")
      .reduce((sum, i) => sum + (i.total || 0), 0) +
      sales
        .filter(s => s.status === "Completed")
        .reduce((sum, s) => sum + (s.totalAmount || s.price * s.quantity || 0), 0);

    const totalOrders = sales.length + invoices.length;
    const openTickets = service.filter(t => t.status !== "Closed").length;
    const totalUsers = users.length;

    const monthlyRevenueData = [
      { month: "Jan", revenue: 450000 },
      { month: "Feb", revenue: 580000 },
      { month: "Mar", revenue: 820000 },
      { month: "Apr", revenue: 690000 },
      { month: "May", revenue: 950000 },
      { month: "Jun", revenue: 1200000 },
      { month: "Jul", revenue: totalRevenue > 0 ? totalRevenue : 1450000 }
    ];

    const serviceStatusStats = [
      { name: "Open", value: service.filter(t => t.status === "Open").length },
      { name: "In Progress", value: service.filter(t => t.status === "In Progress").length },
      { name: "Closed", value: service.filter(t => t.status === "Closed").length }
    ];

    return {
      data: { totalRevenue, totalOrders, openTickets, totalUsers, monthlyRevenueData, serviceStatusStats },
      status: 200,
      statusText: "OK",
      headers: {},
      config
    };
  }

  // 2. Handle login
  if (urlPath.includes("/api/auth/login") && method === "POST") {
    const body = getPayload(config.data);
    const users = getCollection("users");
    const matchedUser = users.find(u => u.email === body.email);
    const expectedPassword = matchedUser ? `${matchedUser.role}123` : "admin123";
    
    if (matchedUser && body.password === expectedPassword) {
      const responseUser = { ...matchedUser, token: `mock_jwt_token_${matchedUser._id}` };
      return {
        data: responseUser,
        status: 200,
        statusText: "OK",
        headers: {},
        config
      };
    } else {
      return {
        status: 400,
        statusText: "Bad Request",
        data: { message: "Invalid email or password" },
        headers: {},
        config
      };
    }
  }

  // 3. Handle get current user profile
  if (urlPath.includes("/api/auth/me") && method === "GET") {
    const storedUser = localStorage.getItem("user");
    return {
      data: storedUser ? JSON.parse(storedUser) : null,
      status: 200,
      statusText: "OK",
      headers: {},
      config
    };
  }

  // 4. Handle standard collections
  const getCollectionName = (path) => {
    if (path.includes("/api/users")) return "users";
    if (path.includes("/api/presales")) return "presales";
    if (path.includes("/api/leads")) return "leads";
    if (path.includes("/api/opportunities")) return "opportunities";
    if (path.includes("/api/enquiries")) return "enquiries";
    if (path.includes("/api/quotations")) return "quotations";
    if (path.includes("/api/proformas")) return "proformas";
    if (path.includes("/api/sales-invoices")) return "sales-invoices";
    if (path.includes("/api/purchase-orders")) return "purchase-orders";
    if (path.includes("/api/work-orders")) return "work-orders";
    if (path.includes("/api/amc")) return "amc";
    if (path.includes("/api/non-amc")) return "non-amc";
    if (path.includes("/api/vendors")) return "vendors";
    if (path.includes("/api/service")) return "service";
    if (path.includes("/api/sales")) return "sales";
    return null;
  };

  const collName = getCollectionName(urlPath);
  if (collName) {
    const items = getCollection(collName);
    const parts = urlPath.replace(/\/$/, "").split("/");
    const lastPart = parts[parts.length - 1];
    const isIdRequest = lastPart !== collName && lastPart !== "api" && lastPart !== "";

    if (method === "GET") {
      if (isIdRequest) {
        const item = items.find(i => i._id === lastPart);
        if (item) {
          return { data: item, status: 200, statusText: "OK", headers: {}, config };
        } else {
          return { status: 404, statusText: "Not Found", data: { message: "Item not found" }, headers: {}, config };
        }
      }
      return { data: items, status: 200, statusText: "OK", headers: {}, config };
    }

    if (method === "POST") {
      const newItem = getPayload(config.data);
      newItem._id = `mock_${collName}_${Date.now()}`;
      
      if (collName === "enquiries" && !newItem.enquiryNumber) {
        newItem.enquiryNumber = `ENQ-20260718-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      if (collName === "quotations" && !newItem.quoteNo) {
        newItem.quoteNo = `Q-2026-${Math.floor(100 + Math.random() * 900)}`;
      }
      if (collName === "proformas" && !newItem.invoiceNo) {
        newItem.invoiceNo = `PI-2026-${Math.floor(100 + Math.random() * 900)}`;
      }
      if (collName === "sales-invoices" && !newItem.invoiceNo) {
        newItem.invoiceNo = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
      }
      if (collName === "purchase-orders" && !newItem.poNo) {
        newItem.poNo = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
      }
      if (collName === "work-orders" && !newItem.woNo) {
        newItem.woNo = `WO-2026-${Math.floor(100 + Math.random() * 900)}`;
      }

      items.push(newItem);
      saveCollection(collName, items);
      return { data: newItem, status: 201, statusText: "Created", headers: {}, config };
    }

    if ((method === "PUT" || method === "PATCH") && isIdRequest) {
      const updateData = getPayload(config.data);
      const index = items.findIndex(i => i._id === lastPart);
      if (index !== -1) {
        items[index] = { ...items[index], ...updateData };
        saveCollection(collName, items);
        return { data: items[index], status: 200, statusText: "OK", headers: {}, config };
      } else {
        return { status: 404, statusText: "Not Found", data: { message: "Item not found" }, headers: {}, config };
      }
    }

    if (method === "DELETE" && isIdRequest) {
      const newItems = items.filter(i => i._id !== lastPart);
      saveCollection(collName, newItems);
      return { data: { message: "Deleted successfully" }, status: 200, statusText: "OK", headers: {}, config };
    }
  }

  return {
    status: 404,
    statusText: "Not Found",
    data: { message: `Mock API endpoint ${method} ${urlPath} not found` },
    headers: {},
    config
  };
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
  adapter: (config) => {
    if (useMock) {
      return mockAdapter(config);
    }
    const defaultAdapterFn = axios.defaults.adapter;
    return defaultAdapterFn(config);
  }
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
