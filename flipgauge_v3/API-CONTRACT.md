# FlipGauge v2 API contract

The browser app calls:

`GET /product-lookup?id={UPC_OR_ASIN}`

Optional header:

`Authorization: Bearer YOUR_APP_TOKEN`

Return JSON in this shape:

```json
{
  "asin": "B012345678",
  "upc": "012345678905",
  "title": "Product title",
  "category": "Kitchen & Dining",
  "image": "https://...",
  "buyBox": 29.99,
  "lowestFba": 28.95,
  "referralPct": 15,
  "fulfillmentFee": 5.18,
  "salesRank": 8421,
  "salesEstimate": 135,
  "fbaSellers": 8,
  "amazonOnListing": false,
  "eligible": true,
  "hazmat": false,
  "restrictedReason": "",
  "sizeTier": "Large standard",
  "weight": "1.2 lb"
}
```

## Security

Do not place Amazon SP-API client secrets, refresh tokens, AWS keys, or Keepa keys inside the web app. Your server should hold those credentials and return only the product fields above.

## Suggested backend flow

1. Resolve UPC/EAN to ASIN through Amazon catalog data.
2. Retrieve catalog attributes and image.
3. Retrieve competitive pricing or featured offer data.
4. Request official fee estimates for the intended selling price.
5. Check seller-specific listing eligibility and restrictions.
6. Optionally enrich sales-rank history and sales estimates through a licensed provider.
7. Normalize the result to the JSON contract above.


## Version 3 optional fields
`priceHistory`: array of `{date,buyBox,lowestFba,rank}`
`rankDrops`: monthly integer
`variations`: array of `{name,asin,price,rank,sales,sellers}`
