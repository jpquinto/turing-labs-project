# Future Features/Improvements


## Data + Backend
- [ ] Data Storage
Access patterns might have made more sense to use RDS (or a relational database), but I didn't want to deal with networking and also keep costs to basically free (Dynamo is basically free here, as opposed to creating an RDS instance and setting up networking). Building out the frontend, being able to use joins would have been very nice.


- [ ] Proctor ID
Add a session proctor ID to all trials, recipes, submissions, etc. (the currently logged in user/proctor), as the users table is kinda useless right now.


- [ ] Transcription
For demo purposes, I set up the transcription to use AWS Transcribe via an endpoint in the backend. This would not be how I would implement it in an actual app, as transcriptions would likely exceed the 29 second timeout of API Gateway/Lambda integrations.
Depending on the needs of the app, I had a few options:
- Transcription on the frontend - less accurate but can be shown in near real time
- AWS Transcribe real time transcriptions - likely more accurate than frontend transcription libraries, but more costly
- Transcription job decoupling with S3 Event Notifications and queues (SQS) - done asynchronously once voice memo is uploaded to S3. In this case, the frontend wouldn't show the transcription immediately


- [ ] Caching
Once API Gateway authorizers were added to the backend, the latency shot up. There are a couple ways that caching could have helped here:
- Caching access tokens/authentication methods, which can be setup via API Gateway natively
- Caching database results: perhaps caching queries using Write-Through pattern

## Authentication
Authentication flow would obviously need to be adjusted to business logic.

- [ ] Delete user webhook handler
Currently, the Auth0 webhook for creating a user in Dynamo is set up, but not for when a user deletes their account.

- [ ] Authorization Server/Service
If we wanted to stay AWS native, then could use Cognito.


## Testing
- [ ] Unit/Integration Tests: Pytest
- [ ] E2E Tests: Playwright

GitHub Actions can trigger these testing suites in the CICD flow

## Frontend

- [ ] General frontend improvements
    - [ ] Loading screens cleaned up
    - [ ] Loading skeletons
    - [ ] Toast feedback
    - [ ] Modal for confirming leaving page without saving
    - [ ] Bug fixes
    - [ ] UI improvements - colors, consistency, etc

