# CRM Sales Management System

A full-stack CRM Sales Management System built using the MERN stack to manage leads, customers, contacts, deals, sales activities, and pipeline operations.

The application implements role-based access control for Admin, Sales Manager, and Sales Executive users and provides a centralized dashboard for monitoring sales performance.

---

## 🚀 Project Overview

The CRM Sales Management System helps sales teams manage the complete customer lifecycle:

Lead → Customer → Contact → Deal → Sales Activity → Deal Closure

The system provides secure authentication, role-based authorization, CRUD operations, assignment management, deal pipeline tracking, lead conversion, activity management, and dashboard analytics.

---

## ✨ Key Features

### Authentication & Authorization

- User login and logout
- Protected API routes
- Authentication middleware
- Role-based access control
- Admin role
- Sales Manager role
- Sales Executive role
- Backend authorization enforcement

---

### Lead Management

- Create leads
- View leads
- Update leads
- Delete leads
- Search leads
- Filter leads
- Lead status management
- Lead source management
- Lead assignment
- Lead conversion
- Notes management

Supported lead statuses:

- New
- Contacted
- Qualified
- Proposal
- Converted
- Lost

---

### Lead Conversion

The system supports converting a qualified lead into a customer.

Example workflow:

```text
Lead
  ↓
Qualified
  ↓
Convert
  ↓
Customer
