# 📋 RSV360 Operations Runbook

## Emergency Contacts
- **Development Team**: dev@rsv360.com
- **Infrastructure**: infra@rsv360.com
- **On-call Engineer**: +55 11 99999-9999

## Postgres / pgvector (I1 — 2026-07-13)

- **Imagem canônica:** `pgvector/pgvector:pg16` (substituí `postgres:16-alpine` no `docker-compose.yml`).
- **Motivo:** habilitar `CREATE EXTENSION vector` para o cache semântico do módulo `agentes` (F2b+).
- **Host local:** porta **5433** → container 5432 (evitar o Postgres Windows em `:5432`). `DATABASE_URL` local deve usar `:5433`.
- **Rollback:** voltar `image: postgres:16-alpine` e `docker compose up -d postgres` — **não** recriar o volume; dados intactos. A extension só existe se já tiver sido criada no volume.

## Incident Response

### Severity Levels
- **SEV-1**: Complete system outage, immediate response required
- **SEV-2**: Major functionality broken, response within 1 hour
- **SEV-3**: Minor issues, response within 4 hours
- **SEV-4**: Cosmetic issues, response within 24 hours

### Response Procedures

#### SEV-1: Critical System Outage
1. **Immediate Actions**:
   - Notify all stakeholders
   - Start incident response team
   - Assess impact and scope

2. **Investigation**:
   ```bash
   # Check system status
   make health-check

   # Check monitoring
   # Access Grafana/Prometheus dashboards

   # Review recent deployments
   git log --oneline -10
   ```

3. **Recovery**:
   ```bash
   # Quick rollback if recent deployment
   make rollback-prod

   # Or restart services
   make docker-down-prod
   make docker-up-prod
   ```

4. **Communication**:
   - Update status page
   - Send regular updates
   - Document root cause

#### SEV-2: Major Issues
1. **Assessment**: Determine affected components
2. **Mitigation**: Apply temporary fixes
3. **Investigation**: Identify root cause
4. **Resolution**: Implement permanent fix

## Routine Operations

### Daily Checks
```bash
# Health verification
make health-check

# Backup verification
ls -la backups/production/

# Log review
make logs | tail -50

# Resource monitoring
docker stats
```

### Weekly Maintenance
- Review monitoring dashboards
- Check backup integrity
- Update dependencies
- Security scan review
- Performance optimization

### Monthly Tasks
- Full system backup test
- Disaster recovery drill
- Security assessment
- Capacity planning review

## Service Management

### Starting Services
```bash
# Development
make docker-up

# Production
make docker-up-prod
```

### Stopping Services
```bash
# Graceful shutdown
make docker-down

# Force stop (emergency)
docker-compose kill
```

### Service Restart
```bash
# Individual service
docker-compose restart <service_name>

# All services
make docker-down && make docker-up
```

## Database Operations

### Emergency Database Access
```bash
# Connect to database
docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

# Check connections
SELECT * FROM pg_stat_activity;

# Terminate problematic connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';
```

### Data Recovery
1. **Identify backup**: Check available backups
2. **Test restore**: Restore to staging first
3. **Production restore**: Follow restore procedure
4. **Verification**: Validate data integrity

## Monitoring and Alerting

### Key Metrics to Monitor
- **Application**: Response time, error rate, throughput
- **Database**: Connection count, query performance, disk usage
- **Infrastructure**: CPU, memory, disk I/O, network
- **Business**: User activity, conversion rates

### Alert Thresholds
- CPU > 80% for 5 minutes
- Memory > 90% for 2 minutes
- Error rate > 5% for 1 minute
- Response time > 2s for 3 minutes

### Dashboard Access
- **Grafana**: http://your-domain:3001
- **Prometheus**: http://your-domain:9090
- **Application Metrics**: http://your-domain:3002/api/v1/metrics

## Security Procedures

### Access Management
- Use SSH keys for server access
- Rotate passwords quarterly
- Implement least privilege principle
- Regular access reviews

### Security Monitoring
- Review CodeQL alerts weekly
- Monitor Trivy scan results
- Check dependency updates
- Audit system logs

### Incident Response
1. **Contain**: Isolate affected systems
2. **Investigate**: Gather evidence and logs
3. **Remediate**: Apply fixes and patches
4. **Communicate**: Notify stakeholders
5. **Learn**: Document and improve

## Backup and Recovery

### Backup Schedule
- **Database**: Daily at 02:00 UTC
- **Application**: Before deployments
- **Configuration**: Weekly
- **Logs**: Continuous

### Recovery Time Objectives (RTO)
- **Critical services**: 1 hour
- **Database**: 4 hours
- **Full system**: 8 hours

### Recovery Point Objectives (RPO)
- **Database**: 1 hour
- **Application data**: 15 minutes
- **Logs**: Real-time

## Performance Optimization

### Application Performance
- Monitor response times
- Optimize database queries
- Implement caching strategies
- Scale services horizontally

### Infrastructure Performance
- Monitor resource utilization
- Optimize Docker configurations
- Implement load balancing
- Plan capacity upgrades

## Communication

### Status Updates
- Use predefined templates
- Include timeline and impact
- Provide clear next steps
- Update stakeholders regularly

### Documentation
- Maintain this runbook
- Document all changes
- Update procedures as needed
- Share knowledge with team

## Escalation Matrix

| Issue Type | Initial Response | Escalation Time | Escalation Contact |
|------------|------------------|-----------------|-------------------|
| SEV-1 | Immediate | 15 minutes | On-call engineer |
| SEV-2 | 1 hour | 2 hours | Team lead |
| SEV-3 | 4 hours | 8 hours | Development team |
| SEV-4 | 24 hours | 48 hours | Product owner |

## Post-Incident Review

### Process
1. **Collect data**: Logs, metrics, timeline
2. **Analyze**: Root cause analysis
3. **Document**: Incident report
4. **Improve**: Update procedures and monitoring
5. **Share**: Team learning session

### Key Questions
- What happened?
- Why did it happen?
- How was it detected?
- How was it resolved?
- How can we prevent it?

## Contact Information

### Development Team
- Email: dev@rsv360.com
- Slack: #dev-team
- Phone: +55 11 99999-9999

### Infrastructure Team
- Email: infra@rsv360.com
- Slack: #infra-team
- Phone: +55 11 88888-8888

### Management
- Email: management@rsv360.com
- Phone: +55 11 77777-7777

## Incident #198 Closure Plan

### Order
1. Close incident #198 with a final status comment.
2. Run the post-rewrite sanity checks on `main`.
3. Return repository visibility to public after the sanity checks pass.
4. Triage the stale `BEHIND` PR backlog.
5. Remove temporary audit artifacts from the local machine.

### Stop Conditions
- Do not move to the next step if the previous step fails.
- Do not make the repository public until the incident is closed and the sanity checks pass.
- Do not close the stale PR backlog before the incident closure is documented.
- Do not remove audit artifacts until the final state is confirmed.

### Safety Notes
- Keep the pre-commit anti-secret hook enabled.
- Keep the rewritten history validated before any visibility change.
- Treat any regression in `main` or CI as a blocker.

---

**Last Updated**: April 13, 2026
**Version**: 1.0
