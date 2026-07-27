from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class SubscriptionPlan(BaseModel):
    id: str
    name: str  # Starter, Pro, Business, Enterprise
    price_monthly: float
    price_yearly: float
    token_limit: int
    agent_limit: int
    workspace_limit: int
    features: List[str]
    is_popular: bool = False


class SubscriptionResponse(BaseModel):
    tier: str  # Starter, Pro, Business, Enterprise
    status: str  # active, past_due, canceled
    monthly_budget_usd: float
    current_spend_usd: float
    token_usage_current: int
    token_usage_limit: int
    next_billing_date: datetime
    auto_renew: bool = True
    payment_method: Optional[Dict[str, str]] = None
    plan_details: SubscriptionPlan


class UpgradeSubscriptionRequest(BaseModel):
    tier: str = Field(..., description="Starter, Pro, Business, Enterprise")
    billing_cycle: str = Field(default="monthly", description="monthly or yearly")


class InvoiceItem(BaseModel):
    id: str
    invoice_number: str
    date: datetime
    tier: str
    amount_usd: float
    status: str  # paid, pending, failed
    pdf_url: str


class ModelTokenBreakdown(BaseModel):
    model: str
    tokens: int
    cost_usd: float


class BillingUsageResponse(BaseModel):
    token_consumption_today: int
    token_consumption_month: int
    monthly_token_limit: int
    monthly_spend_usd: float
    monthly_budget_limit_usd: float
    model_breakdown: List[ModelTokenBreakdown]
    daily_consumption_history: List[Dict[str, Any]]
