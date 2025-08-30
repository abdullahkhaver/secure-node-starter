# Security Checklist (summary)

1. **No "100% unhackable" promise:** Security is a process. Regularly patch, test, and monitor. (See OWASP resources.)
2. **Use Argon2id for password hashing.**
3. **Use HTTPS/TLS in production** and terminate TLS at a reverse proxy or load balancer.
4. **Store secrets in a managed secret store** (Vault, cloud KMS) — do not commit `.env`.
5. **Enable Dependabot & CodeQL on GitHub** for dependency & code scanning.
6. **Protect main branches** with required reviews & status checks.
7. **Rotate credentials** and implement short-lived tokens + refresh tokens with rotation.
8. **Run automated tests and static analysis** in CI.
9. **Use a WAF and monitoring/alerting** for production workloads.
10. **Periodic penetration tests and bug bounty** for mature apps.

