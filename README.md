currency-exchange-api (A simple currency exchange API)

To start local server: npm start

Dependencies used:

- express: for backend server v4.21.0
- axios: for making http requests v1.7.7
- dotenv: for environment variables v16.4.5
- node: v20.17.0

To hit this server endpoint examples:

1: http://localhost:3005/quote?baseCurrency=USD&quoteCurrency=EUR&baseAmount=10
2: http://localhost:3005/quote?baseCurrency=EUR&quoteCurrency=USD&baseAmount=10

Parameters to be passed in query string:

- baseCurrency: String, 3 letters ISO currency code. Currency to convert from
- quoteCurrency: String, 3 letters ISO currency code. Currency to convert to.
- baseAmount: Integer. The amount to convert in cents. Example: 100 (1 USD)

API response interface examples:

1:

```json
{
  "exchangeRate": "0.895",
  "quoteAmount": 9
}
```

2:

```json
{
  "exchangeRate": "1.117",
  "quoteAmount": 11
}
```
