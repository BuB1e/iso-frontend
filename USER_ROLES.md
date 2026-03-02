# User Roles and Permissions Guide

This guide outlines the different user roles within the ISO 27001 Compliance Portal, their specific permissions, and intended workflows.

## Role Overview

The application defines three distinct roles, each tailored to a specific part of the compliance process:

| Role                | Label             | Key Responsibility                                                 |
| :------------------ | :---------------- | :----------------------------------------------------------------- |
| **ADMIN**           | `ADMIN`           | System configuration, user/company management, and full oversight. |
| **INTERNAL EXPERT** | `INTERNAL EXPERT` | Implementing controls, uploading evidence, and internal auditing.  |
| **EXTERNAL EXPERT** | `EXTERNAL EXPERT` | Reviewing assessments, validating evidence, and external auditing. |

---

## Detailed Role Capabilities

### 1. Admin (`ADMIN`)

The **Admin** has unrestricted access to the system. While they can perform all actions, their primary focus is usually on system management and oversight.

- **Dashboards**: Access to a Global Dashboard (all companies) and a Company-Specific Dashboard (hybrid view).
- **Management**:
  - Create, Update, Delete **Users**.
  - Create, Update, Delete **Companies/Organizations**.
- **Permissions**:
  - **Full Read/Write** access to all controls, assessments, and evidence.
  - Can switch between companies to view specific compliance data.
  - Can upload and delete evidence.
  - Can change implementation status of controls (Implemented, Partially, Not Implemented).

### 2. Internal Expert (`INTERNAL_EXPERT`)

The **Internal Expert** is typically an employee or consultant responsible for executing the compliance roadmap for a specific organization.

- **Scope**: Restricted to their **assigned company**. They cannot see data from other organizations.
- **Dashboard**: Shows implementation progress, high-risk controls, and domain compliance for their company.
- **Key Permissions**:
  - **View**: All controls, assessments, and evidence for their company.
  - **Edit Control Status**: Can update the status of controls (e.g., mark as "Implemented").
  - **Evidence Management**:
    - **Upload**: Can upload files (PDF, Images, Excel) as evidence.
    - **Delete**: Can remove evidence files.
  - **Edit Practices**: Can update "Current Practices" text for controls.

### 3. External Expert (`EXTERNAL_EXPERT`)

The **External Expert** is an auditor or external consultant invited to validate the compliance posture. Their role is "Read-Only" regarding implementation details to preserve audit integrity.

- **Scope**: Restricted to their **assigned company**.
- **Dashboard**: A "Reviewer Dashboard" that highlights compliance status but prevents execution.
- **Key Permissions**:
  - **View Only**: Can view all controls, current practices, and uploaded evidence.
  - **No Editing**:
    - Cannot change control status.
    - Cannot edit "Current Practices".
    - **Cannot Upload/Delete Evidence**: Restrictive access ensures they only review what is presented.

---

## Permissions Matrix

| Feature                 | Admin | Internal Expert | External Expert |
| :---------------------- | :---: | :-------------: | :-------------: |
| **View Implementation** |  ✅   |       ✅        |       ✅        |
| **Switch Companies**    |  ✅   |       ❌        |       ❌        |
| **Manage Users**        |  ✅   |       ❌        |       ❌        |
| **Manage Companies**    |  ✅   |       ❌        |       ❌        |
| **Edit Control Status** |  ✅   |       ✅        |       ❌        |
| **Update "Practices"**  |  ✅   |       ✅        |       ❌        |
| **Upload Evidence**     |  ✅   |       ✅        |       ❌        |
| **Delete Evidence**     |  ✅   |       ✅        |       ❌        |

## Typical Workflow

1.  **Admin** sets up the Company and creates the initial **Internal Expert** user.
2.  **Internal Expert** logs in, reviews the **Dashboard** for high-risk controls, and begins implementation.
3.  **Internal Expert** updates specific controls:
    - Writes "Current Practices" description.
    - Changes Status to "Implemented".
    - Uploads supporting proof to the **Evidence Library**.
4.  Once ready for audit, **Admin** creates an **External Expert** user and assigns them to the company.
5.  **External Expert** logs in and reviews the controls and evidence. They verify if the evidence matches the requirements without modifying the data.
