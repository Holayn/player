Express server to play music

Requires a .env file in this package root

Requires service_account.json and credentials.json to reside in the `google` directory. See [here](https://console.cloud.google.com/apis/credentials)
- A service account is needed, as well as an oauth client credentials

Need to set env var GOOGLE_APPLICATION_CREDENTIALS  to service_account path - see [here](https://cloud.google.com/pubsub/docs/quickstart-client-libraries)