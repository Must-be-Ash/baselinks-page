# Create sell quote

> The Sell Quote API provides clients with a quote based on the asset the user would like to sell, the network they plan to send it on, the crypto amount of the sale, the sale currency, the fiat deposit method, and country of the user.

## OpenAPI

````yaml POST /v1/sell/quote
paths:
  path: /v1/sell/quote
  method: post
  servers:
    - url: https://api.developer.coinbase.com/onramp
  request:
    security:
      - title: bearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                Enter your JSON Web Token (JWT) here. Refer to the [Generate
                JWT](/api-reference/authentication#2-generate-jwt-server-only)
                section of our Authentication docs for information on how to
                generate your Bearer Token.
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              cashoutCurrency:
                allOf:
                  - description: Fiat currency to be cashed out to e.g. `USD`
                    type: string
              country:
                allOf:
                  - description: The ISO 3166-1 two letter country code e.g. `US`
                    type: string
              paymentMethod:
                allOf:
                  - description: Payment method type to be deposited to
                    enum:
                      - UNSPECIFIED
                      - CARD
                      - ACH_BANK_ACCOUNT
                      - APPLE_PAY
                      - FIAT_WALLET
                      - CRYPTO_ACCOUNT
                      - GUEST_CHECKOUT_CARD
                      - PAYPAL
                      - RTP
                      - GUEST_CHECKOUT_APPLE_PAY
                    format: enum
                    type: string
              sellAmount:
                allOf:
                  - description: >-
                      Amount of sell_currency to be converted to fiat e.g.
                      `0.05`
                    type: string
              sellCurrency:
                allOf:
                  - description: >-
                      The ticker (e.g. `BTC`, `USDC`) or the UUID (e.g.
                      `d85dce9b-5b73-5c3c-8978-522ce1d1c1b4`) of crypto asset to
                      be sold
                    type: string
              sellNetwork:
                allOf:
                  - description: >-
                      Network name crypto will be sent on e.g. `ethereum`,
                      `base`
                    type: string
              subdivision:
                allOf:
                  - description: >-
                      The ISO 3166-2 two letter state code e.g. `NY`, only
                      required for `US`
                    type: string
            required: true
            description: Create Sell Quote API request parameters
            refIdentifier: '#/components/schemas/CreateSellQuoteRequest'
            requiredProperties:
              - sellCurrency
              - sellAmount
              - cashoutCurrency
              - paymentMethod
              - country
        examples:
          example:
            value:
              cashoutCurrency: <string>
              country: <string>
              paymentMethod: UNSPECIFIED
              sellAmount: <string>
              sellCurrency: <string>
              sellNetwork: <string>
              subdivision: <string>
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              cashoutSubtotal:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              cashoutTotal:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              coinbaseFee:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              quoteId:
                allOf:
                  - description: >-
                      UUID that should be passed into the Offramp Widget URL as
                      the `quoteId` query parameter
                    type: string
              sellAmount:
                allOf:
                  - $ref: '#/components/schemas/Amount'
            description: Create Sell Quote API response
            refIdentifier: '#/components/schemas/CreateSellQuoteResponse'
        examples:
          example:
            value:
              cashoutSubtotal:
                currency: <string>
                value: <string>
              cashoutTotal:
                currency: <string>
                value: <string>
              coinbaseFee:
                currency: <string>
                value: <string>
              quoteId: <string>
              sellAmount:
                currency: <string>
                value: <string>
        description: OK
    default:
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - description: >-
                      The status code, which should be an enum value of
                      [google.rpc.Code][google.rpc.Code].
                    format: int32
                    type: integer
              details:
                allOf:
                  - description: >-
                      A list of messages that carry the error details.  There is
                      a common set of message types for APIs to use.
                    items:
                      $ref: '#/components/schemas/GoogleProtobufAny'
                    type: array
              message:
                allOf:
                  - description: >-
                      A developer-facing error message, which should be in
                      English. Any user-facing error message should be localized
                      and sent in the
                      [google.rpc.Status.details][google.rpc.Status.details]
                      field, or localized by the client.
                    type: string
            description: >-
              The `Status` type defines a logical error model that is suitable
              for different programming environments, including REST APIs and
              RPC APIs. It is used by [gRPC](https://github.com/grpc). Each
              `Status` message contains three pieces of data: error code, error
              message, and error details. You can find out more about this error
              model and how to work with it in the [API Design
              Guide](https://cloud.google.com/apis/design/errors).
            refIdentifier: '#/components/schemas/Status'
        examples:
          example:
            value:
              code: 123
              details:
                - '@type': <string>
              message: <string>
        description: Default error response
  deprecated: false
  type: path
components:
  schemas:
    Amount:
      description: A monetary amount represented by a decimal value and currency symbol
      properties:
        currency:
          description: Currency symbol e.g. `USD`, `BTC`
          type: string
        value:
          description: Non-localized amount in decimal notation (e.g. `1.234`)
          type: string
      type: object
    GoogleProtobufAny:
      additionalProperties: true
      description: >-
        Contains an arbitrary serialized message along with a @type that
        describes the type of the serialized message.
      properties:
        '@type':
          description: The type of the serialized message.
          type: string
      type: object

````