# Generating an Onramp URL

Coinbase Onramp is accessed by creating and directing users to a URL with [query parameters](#onramp-url-parameters) specific to their request.
There are two ways to create an Onramp URL:

1. Use the [getOnrampBuyUrl](https://docs.base.org/builderkits/onchainkit/fund/get-onramp-buy-url) util to generate a URL with default parameters
   * Most commonly used on the `Frontend`

<Tip>
  Frontend developers love using our [`<FundCard />`](https://onchainkit.xyz/fund/fund-card) and [`<FundButton />`](https://onchainkit.xyz/fund/fund-button), customizable React components to fund a wallet without leaving your App!
</Tip>

2. Manually generate a URL with required parameters
   * Most commonly used on the `Backend`

<Tip>
  Full API endpoint list

  For a complete list of all API endpoints supported by Onramp/Offramp, visit our [API Reference section](/api-reference/rest-api/onramp-offramp/create-buy-quote).
</Tip>

#### Backend URL creation

For Apps with a backend, use our APIs to create a [One-Click-Buy URL](/onramp-&-offramp/onramp-apis/one-click-buy-url) - a prefilled URL which takes users straight to the preview screen (existing Coinbase users) or Apple Pay + debit card (Guest checkout).
This enables you to pass a user's wallet addresses via API and avoid using query params for sensitive fields

### Example URL

Session tokens are now required and will be enforced starting 7/31/2025. The URL should look like this:

```bash lines wrap
https://pay.coinbase.com/buy/select-asset?sessionToken=<token>&<other params>
```

### Onramp URL parameters:

| Parameter               | Required | Type             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :---------------------- | :------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| appId                   | Yes      | String           | The Project ID found on the project Dashboard                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `addresses`             | Yes      | Record\<Address> | Addresses that the purchased crypto should be sent to. An object whose keys are addresses and values are arrays of networks each address supports. (e.g. `addresses={"0x1":["base"]}`)                                                                                                                                                                                                                                                                                                                                                              |
| `assets`                | No       | String\[]        | List of assets that will be available for the user to buy/send. e.g. \["ETH", "BTC"] or UUIDs retrieved from the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies). This optional parameter acts as a filter on the addresses parameter. If it is included then only the assets in this list that are available on one of the supported blockchains in the Addresses list will be available to the user. See the See the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies) for the full list of assets. |
| `defaultNetwork`        | No       | String           | Default network that should be selected when multiple networks are present                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `defaultAsset`          | No       | String           | Default asset that should be selected when multiple assets are present                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `presetCryptoAmount`    | No       | Number           | Preset crypto amount value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `presetFiatAmount`      | No       | Number           | Preset fiat amount value (for USD, CAD, GBP, EUR only). Ignored if `presetCryptoAmount` is also set.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `defaultExperience`     | No       | 'send', 'buy'    | Default visual experience: either (1) Transfer funds from Coinbase ('send') or (2) Buy assets ('buy')                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `defaultPaymentMethod`  | No       | String           | Default payment method used to purchase the asset                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `fiatCurrency`          | No       | String           | e.g: USD, CAD, GBP, etc.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `handlingRequestedUrls` | No       | Boolean          | Prevents the widget from opening URLs directly & relies on `onRequestedUrl` entirely for opening links                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `partnerUserId`         | No       | String           | Unique ID representing the end-user. Must be less than 50 chars. Use with the Transaction Status API to retrieve transactions made during the session.                                                                                                                                                                                                                                                                                                                                                                                              |
| `sessionToken`          | Yes      | String           | Token generated by the [Onramp Session Token API](#getting-an-session-token). Required if [Require secure initialization](#getting-a-session-token) is true which all apps must do by 7/31/2025. If this is set, `appId` and `addresses` parameters not required.                                                                                                                                                                                                                                                                                   |
| `redirectUrl`           | No       | String           | URL to redirect the user to when they successfully complete a transaction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Getting a Session Token

All apps must use session tokens starting 7/31/2025. Developers can create and use a session token to securely authenticate users and manage sessions.

### Authentication

To authenticate your requests to the Session Token API, you'll need to:

1. [Create a CDP Secret API Key](/onramp-&-offramp/introduction/getting-started#step-4-create-a-secret-api-key)
2. Follow the instructions for [CDP API key authentication](/api-reference/v2/authentication#generate-bearer-token-jwt-and-export) to make signed requests

Using the JWT token, you can make a request to the Session Token API to obtain a token, then pass that token as the `sessionToken` query string parameter when generating the Coinbase Onramp or Offramp URL.

<Warning>
  The token expires after a short period of time and can only be used once. A new token must be obtained for every new session.
</Warning>

<Warning>
  Full API endpoint list
  For a complete list of all API endpoints supported by Onramp/Offramp, visit our [API Reference section](/api-reference/rest-api/onramp-offramp/create-session-token).
</Warning>

### Method

```
POST
```

### URL

```
https://api.developer.coinbase.com/onramp/v1/token
```

### Request Parameters

The Session Token API is an RPC endpoint that accepts parameters as JSON in the request body.

| Name        | Type                               | Req | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :---------- | :--------------------------------- | :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addresses` | [Address\[\]](#address-parameters) | Y   | List of addresses that the purchased crypto should be sent to. Each entry in this array is an object containing an address and a list of blockchains the address supports.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `assets`    | String\[]                          | N   | List of assets that will be available for the user to buy/send. Assets can either be symbols e.g. "ETH" or "BTC", or UUIDs retrieved from the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies). This optional parameter acts as a filter on the addresses parameter. If it is included then only the assets in this list that are available on one of the supported blockchains in the Addresses list will be available to the user. See the See the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies) for the full list of assets. |

#### Address Parameters

An Address object accepts the following parameters:

| Parameter   | Req'd | Type      | Description                                                                                                                                                                                                                                                                                                                                                                |
| :---------- | :---- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| address     | Yes   | String    | Destination address where the purchased tokens will be sent.                                                                                                                                                                                                                                                                                                               |
| blockchains | Yes   | String\[] | List of blockchains enabled for the associated address. All tokens available per blockchain are displayed to the user. Available blockchains include: "ethereum", "bitcoin", "base", "avacchain", "optimism", "solana", "polygon", "arbitrum", "stellar" and many more. See the [Buy Options API](/onramp-&-offramp/onramp-apis/countries-&-currencies) for the full list. |

### Response Fields

The Session Token API returns a JSON response including the following fields.

### Example Request/Response

<Tabs>
  <Tab value="bash" title="Request (cURL)">
    ```bash lines wrap
    cdpcurl -X POST 'https://api.developer.coinbase.com/onramp/v1/token' \
      -k /tmp/cdp_api_key.json \
      -d '{"addresses": [{"address": "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c", "blockchains": ["ethereum", "base"]}], "assets": ["ETH", "USDC"]}'
    ```
  </Tab>

  <Tab value="jsonResponse" title="Response 200 (JSON)">
    ```json lines wrap
    {
      "data": {
        "token": "ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh",
        "channel_id": "",
      }
    }
    ```
  </Tab>
</Tabs>
