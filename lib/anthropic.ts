import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const PRICING_ANALYSIS_PROMPT = `You are an expert pricing analyst. Your task is to analyze pricing page content and extract ALL pricing information into a precise, structured format.

CRITICAL INSTRUCTIONS:
1. Extract EVERY pricing tier you find (Free, Starter, Basic, Pro, Business, Enterprise, etc.)
2. For each tier, capture ALL features listed - don't miss any
3. If a price shows "Contact Sales", "Custom", or "Get a Quote", set price to null and priceUnit to "custom"
4. Look carefully for:
   - Add-ons and optional extras
   - Usage-based or metered pricing
   - Volume discounts
   - Annual vs monthly pricing differences
5. Preserve exact feature wording from the source
6. Note any billing terms, trial periods, or special offers
7. Identify the currency (USD, EUR, GBP, INR, etc.)

Return ONLY a valid JSON object with this exact structure:

{
  "tiers": [
    {
      "id": "tier_1",
      "name": "Tier Name",
      "price": 99,
      "priceUnit": "month",
      "billingNote": "billed annually, save 20%",
      "description": "Short description of target audience",
      "features": [
        "Feature 1",
        "Feature 2",
        "Feature 3"
      ],
      "highlighted": false
    }
  ],
  "addons": [
    {
      "id": "addon_1",
      "name": "Add-on Name",
      "price": 10,
      "priceUnit": "per user/month",
      "description": "Optional description"
    }
  ],
  "usageBasedPricing": [
    {
      "name": "Metric Name (e.g., API Calls)",
      "tiers": [
        { "limit": "0 - 10,000", "price": "Free" },
        { "limit": "10,001 - 100,000", "price": "$0.001 per call" }
      ]
    }
  ],
  "notes": "Any important pricing notes, trial info, or terms",
  "currency": "USD"
}

RULES:
- "price" must be a number or null (for custom pricing)
- "priceUnit" must be one of: "month", "year", "one-time", "custom"
- "highlighted" should be true for the "recommended" or "most popular" tier
- If a section doesn't apply, use an empty array []
- Generate unique IDs for tiers and addons (tier_1, tier_2, addon_1, etc.)
- Return ONLY the JSON object, no markdown formatting, no explanations`;

export async function analyzePricingContent(content: string): Promise<any> {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022", // Using latest available Sonnet model
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `${PRICING_ANALYSIS_PROMPT}

PRICING CONTENT TO ANALYZE:
---
${content}
---

Return the JSON object:`
      }
    ]
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  // Parse JSON response
  let pricingData;
  try {
    // Try direct parse first
    pricingData = JSON.parse(responseText);
  } catch (e) {
    // Extract JSON if wrapped in markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      pricingData = JSON.parse(jsonMatch[1].trim());
    } else {
      // Try to find JSON object pattern
      const objectMatch = responseText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        pricingData = JSON.parse(objectMatch[0]);
      } else {
        throw new Error('Failed to extract pricing data from AI response');
      }
    }
  }

  // Validate and add missing fields
  pricingData.tiers = pricingData.tiers || [];
  pricingData.addons = pricingData.addons || [];
  pricingData.usageBasedPricing = pricingData.usageBasedPricing || [];
  pricingData.currency = pricingData.currency || 'USD';

  // Ensure all tiers have IDs
  pricingData.tiers = pricingData.tiers.map((tier: any, index: number) => ({
    ...tier,
    id: tier.id || `tier_${index + 1}`
  }));

  // Ensure all addons have IDs
  pricingData.addons = pricingData.addons.map((addon: any, index: number) => ({
    ...addon,
    id: addon.id || `addon_${index + 1}`
  }));

  return pricingData;
}
