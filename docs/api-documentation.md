# API Documentation

## Overview
This document outlines the API endpoints for the FuseLabs platform.

## Services
- Strava Worker API
- Token Service API
- Social Listener API

## Authentication
All API endpoints require authentication via Bearer token:
```header
Authorization: Bearer {token}
```

## Endpoints

### Strava Worker
- `POST /webhook` - Receive Strava activity webhooks
- `GET /activities` - List user activities

### Token Service
- `POST /tokens/mint` - Create new tokens
- `GET /transactions` - List token transactions