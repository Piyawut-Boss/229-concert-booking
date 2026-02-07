# PostgreSQL Database Architecture

## Overview

This document describes the database architecture for the Concert Ticket System using PostgreSQL with production-grade configuration.

## Database Schema

### Tables

#### 1. **concerts**
Stores concert event information.

```sql
Field              | Type              | Purpose
------------------|-------------------|----------------------------------
id                 | SERIAL PRIMARY KEY| Unique concert identifier
name               | VARCHAR(255)      | Concert name/title
artist             | VARCHAR(255)      | Artist/performer name
date               | DATE              | Concert date
venue              | VARCHAR(255)      | Venue location
total_tickets      | INTEGER           | Total tickets available
available_tickets  | INTEGER           | Remaining tickets
price              | DECIMAL(10,2)     | Ticket price
status             | VARCHAR(50)       | open/closed/archived
image_url          | TEXT              | Concert poster/image URL
description        | TEXT              | Concert description
created_at         | TIMESTAMP         | Record creation time
updated_at         | TIMESTAMP         | Last update time
deleted_at         | TIMESTAMP (NULL)  | Soft delete timestamp
```

#### 2. **reservations**
Stores customer reservations/bookings.

```sql
Field              | Type              | Purpose
------------------|-------------------|----------------------------------
id                 | VARCHAR(50) PK    | Unique reservation ID (RES timestamp)
concert_id         | INTEGER FK        | Reference to concerts table
customer_name      | VARCHAR(255)      | Booking customer name
customer_email     | VARCHAR(255)      | Customer email (for confirmation)
quantity           | INTEGER           | Number of tickets booked
total_price        | DECIMAL(10,2)     | Total booking amount
status             | VARCHAR(50)       | confirmed/cancelled/pending/expired
google_auth        | BOOLEAN           | Whether booked via Google login
payment_status     | VARCHAR(50)       | pending/completed/failed/refunded
reserved_at        | TIMESTAMP         | Reservation timestamp
created_at         | TIMESTAMP         | Record creation time
updated_at         | TIMESTAMP         | Last update time
deleted_at         | TIMESTAMP (NULL)  | Soft delete timestamp
```

#### 3. **admin_users**
Stores administrator accounts.

```sql
Field              | Type              | Purpose
------------------|-------------------|----------------------------------
id                 | SERIAL PRIMARY KEY| Admin user ID
username           | VARCHAR(100) UQ   | Login username (unique)
password           | VARCHAR(255)      | Hashed password (bcrypt)
email              | VARCHAR(255) UQ   | Admin email (unique)
role               | VARCHAR(50)       | admin/superadmin/moderator
is_active          | BOOLEAN           | Account status
last_login         | TIMESTAMP (NULL)  | Last login timestamp
created_at         | TIMESTAMP         | Account creation time
updated_at         | TIMESTAMP         | Last update time
deleted_at         | TIMESTAMP (NULL)  | Soft delete timestamp
```

#### 4. **audit_logs** (Compliance)
Tracks all data modifications for compliance.

```sql
Field              | Type              | Purpose
------------------|-------------------|----------------------------------
id                 | SERIAL PRIMARY KEY| Log entry ID
user_id            | INTEGER FK        | Reference to admin_users
action             | VARCHAR(255)      | CREATE/UPDATE/DELETE/EXPORT
table_name         | VARCHAR(100)      | Table being modified
record_id          | VARCHAR(50)       | ID of modified record
old_values         | JSONB             | Previous values (JSON)
new_values         | JSONB             | New values (JSON)
ip_address         | VARCHAR(45)       | IP address of modification
created_at         | TIMESTAMP         | Audit entry timestamp
```

### Indexes

```sql
-- Performance optimization indexes
idx_concerts_status          - For filtering by concert status
idx_concerts_date            - For sorting concerts chronologically
idx_reservations_email       - For looking up customer reservations
idx_reservations_concert     - For counting concert reservations
idx_reservations_status      - For filtering reservations by status
idx_reservations_created     - For time-based queries
idx_admin_users_username     - For admin login
idx_audit_logs_created       - For audit trail queries
```

## Data Relationships

```
┌─────────────────────┐
│     CONCERTS        │ (1 concert can have many reservations)
│                     │
│ id (PK)             │
│ name                │ ◄──────┐
│ artist              │        │ FK (concert_id)
│ date                │     ┌──────────────────┐
│ venue               │     │ RESERVATIONS     │
│ total_tickets       │     │                  │
│ available_tickets   │─────► id (PK)          │
│ price               │     │ concert_id       │
│ status              │     │ customer_name    │
│ ...                 │     │ customer_email   │
└─────────────────────┘     │ quantity         │
                            │ total_price      │
                            │ status           │
                            │ ...              │
                            └──────────────────┘

┌─────────────────────┐
│   ADMIN_USERS       │ (1 admin can have many audit logs)
│                     │
│ id (PK)             │
│ username            │ ◄──────┐
│ password            │        │ FK (user_id, optional)
│ email               │     ┌──────────────────┐
│ role                │     │  AUDIT_LOGS      │
│ is_active           │  ───► id (PK)          │
│ ...                 │     │ user_id          │
└─────────────────────┘     │ action           │
                            │ table_name       │
                            │ record_id        │
                            │ old_values       │
                            │ new_values       │
                            │ ...              │
                            └──────────────────┘
```

## Connection Pool Configuration

### Production Settings

```javascript
{
  max: 20,                      // Maximum connections
  min: 2,                       // Minimum idle connections
  idleTimeoutMillis: 30000,     // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
  statement_timeout: 120000,    // 2 minute query timeout
  application_name: 'concert-ticket-system'
}
```

### Connection Lifecycle

```
┌─────────────────────────────────────────┐
│     Connection Pool                     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Available Connections (min=2)  │   │
│  └─────────────────────────────────┘   │
│                  │                      │
│          Request arrives                │
│                  │                      │
│                  ▼                      │
│  ┌─────────────────────────────────┐   │
│  │  Active Connections (max=20)    │   │
│  └─────────────────────────────────┘   │
│                  │                      │
│          Request completes              │
│                  │                      │
│                  ▼                      │
│  ┌─────────────────────────────────┐   │
│  │ Idle (wait 30s) → Release Pool  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## High-Availability Considerations

### 1. **Replication Setup** (for failover)
```
Primary PostgreSQL (Write)
         │
    WAL Streaming
         │
    ┌────▼────┐
    │ Standby  │ (Read-only replica)
    │PostgreSQL│
    └──────────┘
```

Configuration:
- Enable WAL (Write-Ahead Logging)
- Configure streaming replication
- Set up automated failover with tools like Patroni

### 2. **Backup Strategy**
- Daily full backups (retained 30 days)
- Continuous WAL archiving
- Point-in-time recovery capability
- Off-site backup storage (S3, Azure, etc.)

### 3. **Read Replicas**
For read-heavy workloads:
- Primary for writes (reservations, admin actions)
- Replicas for reads (concert listings, reporting)
- Load balance read queries across replicas

## Query Optimization

### Most Common Queries

```sql
-- 1. List available concerts (O(n) with index)
SELECT * FROM concerts 
WHERE status = 'open' AND date >= CURRENT_DATE
ORDER BY date ASC;
-- Index: idx_concerts_status, idx_concerts_date

-- 2. Get customer reservations
SELECT * FROM reservations
WHERE customer_email = $1
ORDER BY created_at DESC;
-- Index: idx_reservations_email, idx_reservations_created

-- 3. Count concert reservations
SELECT COUNT(*) FROM reservations
WHERE concert_id = $1 AND status = 'confirmed';
-- Index: idx_reservations_concert, idx_reservations_status

-- 4. Check available tickets
SELECT available_tickets FROM concerts WHERE id = $1 FOR UPDATE;
-- Uses PK index for serializable consistency
```

### Performance Tips

1. **Use Prepared Statements** (prevents SQL injection, improves performance)
   ```javascript
   db.query('SELECT * FROM concerts WHERE id = $1', [concertId])
   ```

2. **Batch Operations** (fewer round-trips)
   ```javascript
   INSERT INTO reservations VALUES (...), (...), (...)
   ```

3. **Connection Pooling** (reuse connections, reduce overhead)
   ```javascript
   // Already configured in database-production.js
   ```

4. **Index Statistics** (keep optimizer informed)
   ```sql
   ANALYZE; -- Update statistics monthly
   ```

## Environment-Specific Configurations

### Development
```
- Single PostgreSQL instance
- Development database
- Sample data included
- Full logging enabled
```

### Production
```
- Replicated PostgreSQL setup
- Production database
- Minimal logging (info level)
- SSL/TLS encryption required
- Automated backups (daily)
- Connection pooling active
- Query timeouts enabled
```

## Security by Layer

```
┌────────────────────────────────────┐
│ Application Layer Security         │
│ - Input validation                 │
│ - Parameterized queries            │
│ - RBAC (role-based access)         │
└───────────────┬────────────────────┘
                │
┌───────────────▼────────────────────┐
│ Network Layer Security             │
│ - SSL/TLS encryption               │
│ - VPC/firewall rules               │
│ - Private network topology         │
└───────────────┬────────────────────┘
                │
┌───────────────▼────────────────────┐
│ Database Layer Security            │
│ - User permissions (least privilege)
│ - Row-level security               │
│ - Audit logging                    │
└────────────────────────────────────┘
```

## Monitoring Metrics

Key metrics to monitor:

1. **Connection Pool**
   - Active connections
   - Idle connections
   - Wait queue length
   - Connection errors

2. **Query Performance**
   - Query execution time
   - Slow query log (>100ms)
   - Full table scans
   - Lock contention

3. **Data Volume**
   - Table sizes
   - Index sizes
   - Daily growth rate
   - Disk space usage

4. **Availability**
   - Connection uptime
   - Replication lag
   - Backup completion
   - Recovery time

---

**Version:** 1.0.0  
**Last Updated:** February 7, 2026  
**Status:** Production Ready
