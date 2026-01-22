from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel, Field
import httpx

app = FastAPI(title="Lead Processing API")

FAKE_CUSTOMER_URL = "https://contactapi.static.fyi/lead/receive/fake/USER_ID/"
FAKE_CUSTOMER_TOKEN = "FakeCustomerToken"

# 
class LeadAttributes(BaseModel):
    solar_owner: str = Field(..., description="Ja, Nein, In Auftrag")
    solar_energy_consumption: str = None
    solar_monthly_electricity_bill: str = None
    solar_offer_type: str = None
    solar_property_type: str = None
    solar_area: int = None

class LeadMeta(BaseModel):
    landingpage_url: str = None
    unique_id: str = None
    utm_campaign: str = None
    utm_source: str = None
    ip: str = None
    browser: str = None
    optin: bool = False

class Lead(BaseModel):
    phone: str
    email: str = None
    first_name: str = None
    last_name: str = None
    street: str = None
    housenumber: str = None
    postcode: str
    city: str = None
    country: str
    product_name: str
    lead_attributes: LeadAttributes
    meta_attributes: LeadMeta

#
VALID_SOLAR_OWNER = ["Ja", "Nein", "In Auftrag"]
VALID_OFFER_TYPE = ["Beides interessant", "Mieten", "Kaufen"]

@app.post("/receive-lead")
async def receive_lead(lead: Lead):
    # 1️⃣ 
    if not lead.postcode.startswith("66"):
        return {"status": "skipped", "reason": "ZIP не из региона 66***"}

    # 2️⃣ 
    if lead.lead_attributes.solar_owner != "Ja":
        return {"status": "skipped", "reason": "Не владелец дома"}

    # 3️⃣ 
    if lead.lead_attributes.solar_offer_type not in VALID_OFFER_TYPE:
        lead.lead_attributes.solar_offer_type = None  

    # 4️⃣ 
    for attr in ["solar_energy_consumption", "solar_monthly_electricity_bill", "solar_area"]:
        val = getattr(lead.lead_attributes, attr)
        if val is not None:
            try:
                setattr(lead.lead_attributes, attr, float(val))
            except ValueError:
                setattr(lead.lead_attributes, attr, None)

    # 5️⃣ 
    client_payload = {
        "lead": {
            "phone": lead.phone,
            "email": lead.email,
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "street": lead.street,
            "housenumber": lead.housenumber,
            "postcode": lead.postcode,
            "city": lead.city,
            "country": lead.country
        },
        "product": {"name": lead.product_name},
        "lead_attributes": lead.lead_attributes.dict(exclude_none=True),
        "meta_attributes": lead.meta_attributes.dict(exclude_none=True)
    }

    # 6️⃣ 
    headers = {"Authorization": f"Bearer {FAKE_CUSTOMER_TOKEN}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(FAKE_CUSTOMER_URL, json=client_payload, headers=headers)

    if response.status_code == 201:
        return {"status": "success", "client_response": response.json()}
    else:
        return {"status": "error", "client_status": response.status_code, "client_response": response.text}