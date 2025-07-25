# Get all offramp transactions

> Returns all offramp transactions created by your app in the provided time period.

## OpenAPI

````yaml GET /v1/sell/transactions
paths:
  path: /v1/sell/transactions
  method: get
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
      query:
        startDate:
          schema:
            - type: string
              description: >-
                Date of the oldest transaction to return e.g. `2025-01-02`, 
                `2025-01-02T15:04:05Z`, `2025-01-02T15:04:05+07:00`
        endDate:
          schema:
            - type: string
              description: >-
                Date of the newest transaction to return e.g. `2025-01-03`,
                `2025-01-02T15:04:05Z`, `2025-01-02T15:04:05+07:00`
        pageKey:
          schema:
            - type: string
              description: Page key returned by this API for pagination
        pageSize:
          schema:
            - type: integer
              description: The number of transactions to return, between 1 and 1000
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              nextPageKey:
                allOf:
                  - description: >-
                      The page key to be passed into this API to get the next
                      page of results
                    type: string
              transactions:
                allOf:
                  - description: List of transactions
                    items:
                      $ref: '#/components/schemas/OfframpTransaction'
                    type: array
            description: Get All Offramp Transactions response
            refIdentifier: '#/components/schemas/GetOfframpTransactionsForPartnerResponse'
        examples:
          example:
            value:
              nextPageKey: <string>
              transactions:
                - asset: <string>
                  coinbaseFee:
                    currency: <string>
                    value: <string>
                  createdAt: '2023-11-07T05:31:56Z'
                  exchangeRate:
                    currency: <string>
                    value: <string>
                  fromAddress: <string>
                  minimumTotal:
                    currency: <string>
                    value: <string>
                  network: <string>
                  redirectUrl: <string>
                  sellAmount:
                    currency: <string>
                    value: <string>
                  status: TRANSACTION_STATUS_CREATED
                  subtotal:
                    currency: <string>
                    value: <string>
                  toAddress: <string>
                  total:
                    currency: <string>
                    value: <string>
                  transactionId: <string>
                  txHash: <string>
                  unitPrice:
                    currency: <string>
                    value: <string>
                  updatedAt: '2023-11-07T05:31:56Z'
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
    OfframpTransaction:
      description: OfframpTransaction
      properties:
        asset:
          description: Currency symbol e.g. `ETH`
          type: string
        coinbaseFee:
          $ref: '#/components/schemas/Amount'
        createdAt:
          description: Create at timestamp
          format: date-time
          type: string
        exchangeRate:
          $ref: '#/components/schemas/Amount'
        fromAddress:
          description: Address crypto was received from
          type: string
        minimumTotal:
          $ref: '#/components/schemas/Amount'
        network:
          description: Network name e.g. `ethereum`
          type: string
        redirectUrl:
          description: >-
            The URL the user was redirected to after confirming their offramp
            transaction
          type: string
        sellAmount:
          $ref: '#/components/schemas/Amount'
        status:
          description: Current status of the transaction
          enum:
            - TRANSACTION_STATUS_CREATED
            - TRANSACTION_STATUS_EXPIRED
            - TRANSACTION_STATUS_STARTED
            - TRANSACTION_STATUS_SUCCESS
            - TRANSACTION_STATUS_FAILED
          format: enum
          type: string
        subtotal:
          $ref: '#/components/schemas/Amount'
        toAddress:
          description: Address crypto was sent to
          type: string
        total:
          $ref: '#/components/schemas/Amount'
        transactionId:
          description: Unique ID for the transaction
          type: string
        txHash:
          description: Onchain tx hash of the send
          type: string
        unitPrice:
          $ref: '#/components/schemas/Amount'
        updatedAt:
          description: Last update timestamp
          format: date-time
          type: string
      type: object

````