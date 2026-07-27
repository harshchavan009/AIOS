from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies.auth_deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.billing import (
    SubscriptionPlan,
    SubscriptionResponse,
    UpgradeSubscriptionRequest,
    InvoiceItem,
    BillingUsageResponse,
    ModelTokenBreakdown,
)

router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])

# 4 Subscription Tier Definitions
PLANS: Dict[str, SubscriptionPlan] = {
    "Starter": SubscriptionPlan(
        id="plan-starter",
        name="Starter",
        price_monthly=0.0,
        price_yearly=0.0,
        token_limit=100_000,
        agent_limit=2,
        workspace_limit=1,
        features=[
            "100k Monthly LLM Tokens",
            "2 Active Agent Swarms",
            "1 Workspace Isolation",
            "Community Support & Basic Analytics"
        ],
        is_popular=False,
    ),
    "Pro": SubscriptionPlan(
        id="plan-pro",
        name="Pro",
        price_monthly=49.0,
        price_yearly=470.0,
        token_limit=2_000_000,
        agent_limit=10,
        workspace_limit=3,
        features=[
            "2 Million Monthly LLM Tokens",
            "10 Active Agent Swarms",
            "3 Workspaces (My Startup, Team Labs)",
            "Standard API Keys & Email Support",
            "Prompt Studio Template Library"
        ],
        is_popular=True,
    ),
    "Business": SubscriptionPlan(
        id="plan-business",
        name="Business",
        price_monthly=199.0,
        price_yearly=1900.0,
        token_limit=10_000_000,
        agent_limit=50,
        workspace_limit=10,
        features=[
            "10 Million Monthly LLM Tokens",
            "50 Active Agent Swarms",
            "10 Workspaces Isolation",
            "Graph RAG & Vector Mesh (Qdrant & Neo4j)",
            "SOC-2 Type II Compliance Controls",
            "24/7 Priority SLA Support"
        ],
        is_popular=False,
    ),
    "Enterprise": SubscriptionPlan(
        id="plan-enterprise",
        name="Enterprise",
        price_monthly=999.0,
        price_yearly=9500.0,
        token_limit=100_000_000,
        agent_limit=999,
        workspace_limit=999,
        features=[
            "Unlimited LLM Tokens Mesh",
            "Unlimited Multi-Agent Orchestration",
            "Custom Workspaces & Fine-Tuned Models",
            "Dedicated Infrastructure Node",
            "Custom SSO & SAML Authentication",
            "Dedicated Solutions Architect"
        ],
        is_popular=False,
    ),
}

# State store simulation
_active_user_subscriptions: Dict[str, str] = {}  # user_id -> tier_name


@router.get("/plans", response_model=List[SubscriptionPlan])
async def list_subscription_plans():
    """List all available subscription tiers (Starter, Pro, Business, Enterprise)."""
    return list(PLANS.values())


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: User = Depends(get_current_user)
):
    """Get active subscription plan, token commitment, and billing state."""
    tier = _active_user_subscriptions.get(current_user.id, "Enterprise")
    plan = PLANS.get(tier, PLANS["Enterprise"])

    return SubscriptionResponse(
        tier=plan.name,
        status="active",
        monthly_budget_usd=plan.price_monthly if plan.price_monthly > 0 else 1000.0,
        current_spend_usd=442.80 if plan.name == "Enterprise" else (plan.price_monthly * 0.7),
        token_usage_current=1_840_000,
        token_usage_limit=plan.token_limit,
        next_billing_date=datetime.now(timezone.utc) + timedelta(days=24),
        auto_renew=True,
        payment_method={"brand": "Visa", "last4": "8842", "exp_month": "09", "exp_year": "2028"},
        plan_details=plan,
    )


@router.post("/subscription/upgrade", response_model=SubscriptionResponse)
async def upgrade_subscription(
    payload: UpgradeSubscriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """Upgrade or downgrade subscription tier (Starter, Pro, Business, Enterprise)."""
    if payload.tier not in PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier '{payload.tier}'. Must be one of: Starter, Pro, Business, Enterprise."
        )

    _active_user_subscriptions[current_user.id] = payload.tier
    plan = PLANS[payload.tier]

    return SubscriptionResponse(
        tier=plan.name,
        status="active",
        monthly_budget_usd=plan.price_monthly,
        current_spend_usd=0.0,
        token_usage_current=0,
        token_usage_limit=plan.token_limit,
        next_billing_date=datetime.now(timezone.utc) + timedelta(days=30),
        auto_renew=True,
        payment_method={"brand": "Visa", "last4": "8842", "exp_month": "09", "exp_year": "2028"},
        plan_details=plan,
    )


@router.get("/usage", response_model=BillingUsageResponse)
async def get_billing_usage(
    current_user: User = Depends(get_current_user)
):
    """Get detailed Token Consumption metrics, monthly spend, and model breakdown."""
    return BillingUsageResponse(
        token_consumption_today=148_200,
        token_consumption_month=1_840_000,
        monthly_token_limit=10_000_000,
        monthly_spend_usd=442.80,
        monthly_budget_limit_usd=1000.0,
        model_breakdown=[
            ModelTokenBreakdown(model="OpenAI GPT-4o", tokens=1_120_000, cost_usd=280.00),
            ModelTokenBreakdown(model="Claude 3.5 Sonnet", tokens=480_000, cost_usd=120.00),
            ModelTokenBreakdown(model="Google Gemini 1.5 Pro", tokens=240_000, cost_usd=42.80),
        ],
        daily_consumption_history=[
            {"date": "2026-07-21", "tokens": 120000, "spend_usd": 28.80},
            {"date": "2026-07-22", "tokens": 145000, "spend_usd": 34.80},
            {"date": "2026-07-23", "tokens": 160000, "spend_usd": 38.40},
            {"date": "2026-07-24", "tokens": 190000, "spend_usd": 45.60},
            {"date": "2026-07-25", "tokens": 175000, "spend_usd": 42.00},
            {"date": "2026-07-26", "tokens": 210000, "spend_usd": 50.40},
            {"date": "2026-07-27", "tokens": 148200, "spend_usd": 35.57},
        ]
    )


@router.get("/invoices", response_model=List[InvoiceItem])
async def get_invoice_history(
    current_user: User = Depends(get_current_user)
):
    """Get complete Invoice History and receipt download metadata."""
    now = datetime.now(timezone.utc)
    return [
        InvoiceItem(
            id="inv-101",
            invoice_number="INV-2026-0701",
            date=now - timedelta(days=26),
            tier="Enterprise",
            amount_usd=1000.00,
            status="paid",
            pdf_url="/api/v1/billing/invoices/INV-2026-0701/download"
        ),
        InvoiceItem(
            id="inv-100",
            invoice_number="INV-2026-0601",
            date=now - timedelta(days=56),
            tier="Enterprise",
            amount_usd=1000.00,
            status="paid",
            pdf_url="/api/v1/billing/invoices/INV-2026-0601/download"
        ),
        InvoiceItem(
            id="inv-099",
            invoice_number="INV-2026-0501",
            date=now - timedelta(days=86),
            tier="Business",
            amount_usd=199.00,
            status="paid",
            pdf_url="/api/v1/billing/invoices/INV-2026-0501/download"
        ),
    ]


@router.post("/webhooks/stripe")
async def stripe_webhook_handler(request: Request):
    """Stripe Webhook Architecture handler for payment events."""
    payload = await request.json()
    event_type = payload.get("type", "unknown")
    return {
        "status": "processed",
        "event": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
