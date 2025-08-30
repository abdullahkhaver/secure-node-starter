This starter is intentionally minimal and focuses on secure defaults.
Before deploying to production:
- Replace secrets with KMS-managed secrets.
- Limit number of refresh tokens per user or store them in Redis with TTLs.
- Harden DB access and network rules.
- Run automated dependency & image scanning (Trivy, Snyk).
- Configure branch protection & require code reviews.
