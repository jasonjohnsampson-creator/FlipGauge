-- Optional non-sensitive demo product seed.
insert into public.products (asin, upc, marketplace, title, brand, category)
values
  ('B0DEMO1234', '012345678905', 'US', 'Demo Star Cruiser Building Set', 'Demo Brand', 'Toys'),
  ('B0RISK9999', '036000291452', 'US', 'Demo Seasonal Gift Pack', 'Demo Brand', 'Grocery')
on conflict do nothing;
