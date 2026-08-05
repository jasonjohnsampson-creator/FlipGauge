# Production database map

## Identity and workspace
- `profiles`
- `organizations`
- `organization_members`
- `user_settings`

## Product intelligence
- `products`
- `scans`
- `price_history`

## Seller workflow
- `buy_lists`
- `buy_list_items`
- `alerts`

## Connections and accountability
- `provider_connections`
- `audit_events`

All customer-owned tables use PostgreSQL Row Level Security. The browser receives only the Supabase publishable key. RLS policies use the authenticated user's JWT identity to enforce access.
