"""
Industry-specific keyword libraries used to bias resume analysis toward the
terminology a given field's ATS/recruiters actually search for. Purely
static data — no model/migration needed, and new industries are just a new
dict entry here.
"""

INDUSTRY_KEYWORDS = {
    "technology": [
        "Agile", "API", "CI/CD", "Cloud Computing", "Data Structures", "DevOps",
        "Git", "Kubernetes", "Machine Learning", "Microservices", "REST",
        "Scalability", "SDLC", "System Design", "Unit Testing", "Version Control",
    ],
    "finance": [
        "Financial Modeling", "GAAP", "Risk Management", "Portfolio Management",
        "Valuation", "Forecasting", "Compliance", "Reconciliation", "Audit",
        "Budgeting", "P&L", "Financial Reporting", "Investment Analysis",
        "Regulatory Reporting", "SOX",
    ],
    "healthcare": [
        "Patient Care", "HIPAA", "EHR/EMR", "Clinical Documentation",
        "Care Coordination", "Regulatory Compliance", "Quality Assurance",
        "Patient Safety", "Medical Terminology", "Interdisciplinary Collaboration",
        "Case Management", "ICD-10", "Evidence-Based Practice",
    ],
    "marketing": [
        "SEO", "Content Strategy", "Brand Management", "Campaign Management",
        "Marketing Analytics", "A/B Testing", "CRM", "Lead Generation",
        "Social Media Strategy", "Conversion Rate Optimization", "Market Research",
    ],
    "sales": [
        "Pipeline Management", "CRM", "Quota Attainment", "Prospecting",
        "Account Management", "Negotiation", "Client Relationship Management",
        "Sales Forecasting", "Upselling", "Territory Management",
    ],
}


def get_industries():
    return sorted(INDUSTRY_KEYWORDS.keys())


def get_keywords_for_industry(industry: str):
    return INDUSTRY_KEYWORDS.get((industry or "").lower(), [])
