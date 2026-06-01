# BSearch Deployment Guide

## Prerequisites

- Docker 24+
- Docker Compose 2.20+
- Kubernetes 1.28+ (for production)
- kubectl CLI
- Helm 3 (optional)
- Domain name with DNS configured
- SSL certificates (Let's Encrypt recommended)

## Development Setup

### Quick Start with Docker Compose

1. **Clone the repository**
```bash
git clone <repository-url>
cd bsearch
```

2. **Copy environment files**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai_service/.env.example ai_service/.env
```

3. **Generate application keys**
```bash
cd backend
php artisan key:generate
```

4. **Start all services**
```bash
docker-compose up -d
```

5. **Run migrations**
```bash
docker-compose exec backend php artisan migrate --seed
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- AI Service: http://localhost:8001
- OpenSearch: http://localhost:9200

### Individual Service Management

```bash
# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Production Deployment

### Option 1: Docker Compose (Single Server)

1. **Update environment variables for production**
```bash
# backend/.env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://bsearch.ir

DB_HOST=postgres
DB_PASSWORD=<strong-password>

REDIS_PASSWORD=<strong-password>

JWT_SECRET=<random-string>
```

2. **Build production images**
```bash
docker-compose -f docker-compose.prod.yml build
```

3. **Deploy with Nginx reverse proxy**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Configure SSL with Let's Encrypt**
```bash
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d bsearch.ir -d www.bsearch.ir
```

### Option 2: Kubernetes (Production Cluster)

#### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
- kubectl configured
- Helm installed
- Ingress controller deployed

#### Deploy using Helm

1. **Add Helm repositories**
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

2. **Deploy PostgreSQL**
```bash
helm install postgres bitnami/postgresql \
  --namespace database \
  --create-namespace \
  --set auth.postgresPassword=<password> \
  --set auth.database=bsearch
```

3. **Deploy Redis**
```bash
helm install redis bitnami/redis \
  --namespace cache \
  --create-namespace \
  --set auth.password=<password>
```

4. **Deploy OpenSearch**
```bash
helm install opensearch opensearch-project/opensearch \
  --namespace search \
  --create-namespace \
  --set replicas=3 \
  --set resources.requests.memory=2Gi \
  --set resources.limits.memory=4Gi
```

5. **Deploy Application**
```bash
kubectl apply -f infrastructure/k8s/backend/
kubectl apply -f infrastructure/k8s/frontend/
kubectl apply -f infrastructure/k8s/ai/
```

6. **Configure Ingress**
```bash
kubectl apply -f infrastructure/k8s/ingress.yaml
```

7. **Setup Cert-Manager for SSL**
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

kubectl apply -f infrastructure/k8s/certificate.yaml
```

### Kubernetes Manifests Structure

```
infrastructure/k8s/
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── hpa.yaml
├── frontend/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── ai/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── databases/
│   ├── postgres-statefulset.yaml
│   ├── redis-statefulset.yaml
│   └── opensearch-statefulset.yaml
├── monitoring/
│   ├── prometheus.yaml
│   └── grafana.yaml
├── ingress.yaml
├── certificate.yaml
└── secrets.yaml
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
      
      - name: Install dependencies
        run: composer install -d backend
      
      - name: Run tests
        run: php artisan test -d backend

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker images
        run: |
          docker build -t bsearch/backend:latest ./backend
          docker push bsearch/backend:latest
          
          docker build -t bsearch/frontend:latest ./frontend
          docker push bsearch/frontend:latest
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend backend=bsearch/backend:latest
          kubectl set image deployment/frontend frontend=bsearch/frontend:latest
```

## Monitoring & Logging

### Prometheus Metrics

1. **Deploy Prometheus**
```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

2. **Key Metrics to Monitor**
- API response time
- Search query latency
- Crawler throughput
- Cache hit rate
- Database connections
- Memory usage
- CPU usage

### Grafana Dashboards

Import dashboards for:
- Application performance
- Database metrics
- Search engine health
- Cache statistics

### Log Aggregation

```bash
# Deploy ELK Stack
helm install elasticsearch elastic/elasticsearch
helm install logstash elastic/logstash
helm install kibana elastic/kibana
```

## Backup & Recovery

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres bsearch > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres bsearch < backup.sql
```

### Automated Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/bsearch"

# Database backup
docker-compose exec -T postgres pg_dump -U postgres bsearch | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### Disaster Recovery

1. **Restore database**
```bash
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U postgres bsearch
```

2. **Restore from snapshot** (Kubernetes)
```bash
velero restore create --from-backup bsearch-backup
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend pods
kubectl scale deployment backend --replicas=5

# Scale crawler workers
kubectl scale deployment crawler-worker --replicas=10
```

### Vertical Scaling

Update resource limits in Kubernetes manifests:
```yaml
resources:
  requests:
    memory: "2Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

## Security Hardening

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8000
```

### Secrets Management

```bash
# Create sealed secrets
kubeseal --format yaml < secret.yaml > sealed-secret.yaml
```

### Security Scanning

```bash
# Scan Docker images
trivy image bsearch/backend:latest

# Scan Kubernetes manifests
kube-bench check
```

## Performance Tuning

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_search_documents_title ON search_documents USING gin(to_tsvector('simple', title));
CREATE INDEX idx_search_documents_content ON search_documents USING gin(to_tsvector('simple', content));

-- Analyze tables
ANALYZE search_documents;
```

### Cache Configuration

```php
// config/cache.php
'default' => env('CACHE_DRIVER', 'redis'),

'redis' => [
    'client' => env('REDIS_CLIENT', 'predis'),
    'default' => [
        'host' => env('REDIS_HOST', 'redis'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],
    'cache' => [
        'database' => env('REDIS_CACHE_DB', 1),
    ],
],
```

### OpenSearch Tuning

```yaml
# OpenSearch configuration
indices:
  memory:
    index_buffer_size: 20%
  queries:
    cache:
      size: 10%
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
```bash
kubectl logs deployment/postgres
kubectl exec -it deployment/postgres -- pg_isready
```

2. **High memory usage**
```bash
kubectl top pods
kubectl describe pod <pod-name>
```

3. **Search indexing issues**
```bash
curl -X GET "localhost:9200/_cat/indices?v"
curl -X GET "localhost:9200/_cluster/health?pretty"
```

### Debug Mode

Enable debug logging:
```bash
# Backend
kubectl set env deployment/backend APP_DEBUG=true

# View logs
kubectl logs -f deployment/backend
```

## Maintenance

### Zero-Downtime Deployments

```bash
# Rolling update strategy
kubectl set image deployment/backend backend=bsearch/backend:v2
kubectl rollout status deployment/backend
```

### Database Migrations

```bash
# Run migrations safely
kubectl exec -it deployment/backend -- php artisan migrate --force
```

### Cleanup

```bash
# Remove old pods
kubectl delete pods --field-selector=status.phase==Failed

# Clear completed jobs
kubectl delete job --all --field-selector=status.successful=1
```
