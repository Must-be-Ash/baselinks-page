# Get offramp transactions by ID

> When you initialize the Offramp Widget you can pass a `partnerUserId` parameter to associate the transaction created during that session with the ID. You can then use that ID in this API to retrieve that transaction and any others that share the ID. The value of the `partnerUserId` param can be any string you want e.g. the ID of the user in your app, a unique transaction ID, or a combination of values. Anything that is meaningful to your app.

## OpenAPI

````yaml GET /v1/sell/user/{partnerUserRef}/transactions
paths:
  path: /v1/sell/user/{partnerUserRef}/transactions
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
      path:
        partnerUserRef:
          schema:
            - type: string
              required: true
              description: >-
                The `partnerUserId` parameter used to initialize the Offramp
                Widget
      query:
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
              totalCount:
                allOf:
                  - description: The number of transactions returned by this call
                    format: int64
                    type: integer
              transactions:
                allOf:
                  - description: List of transactions matching the `partnerUserId`
                    items:
                      $ref: '#/components/schemas/OfframpTransaction'
                    type: array
            description: Get Offramp Transactions by ID API response
            refIdentifier: '#/components/schemas/GetOfframpTransactionsForPartnerUserResponse'
        examples:
          example:
            value:
              nextPageKey: <string>
              totalCount: 123
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