# HR & Employee Management System

A comprehensive, full-stack Human Resources management platform built with React, Node.js, Express, and MySQL. This system streamlines organizational workflows by providing role-based portals for both HR Administrators and Employees.

## Key Features

### Role-Based Access Control (RBAC)
* **Admin Portal:** Full oversight of organization data, payroll generation, and leave approvals.
* **Employee Portal:** Personalized dashboard for attendance tracking, leave requests, and payslip viewing.
* Secure JWT-based authentication.

### Real-Time Attendance Tracking
* Employees can securely Punch-In and Punch-Out.
* Automated tracking of working hours and active shift status.
* Admins can view live organizational attendance logs with date filtering.

### Leave Management Workflow
* Employees can apply for Sick, Casual, or Earned leaves with date ranges and reasons.
* Real-time status tracking (Pending, Approved, Rejected).
* Admin inbox for single-click leave request resolution.

### Automated Payroll Generation
* Admins can input basic salary, allowances, and deductions.
* Backend engine automatically calculates `net_salary` and enforces monthly duplicate guards (Upsert logic).
* Employees can view and track their secure, formatted historical payslips.

---

## Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS, Lucide React (Icons), Axios
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT) for Auth
* **Database:** MySQL (Relational Schema)

---

## Installation & Local Setup

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MySQL](https://dev.mysql.com/downloads/installer/) & MySQL Workbench

### 2. Database Setup
1. Open MySQL Workbench.
2. Create a new SQL tab and copy the contents of `backend/schema.sql`.
3. Execute the script to automatically build the `hr_management_db` database, establish all relational tables, and create the default Admin account.

### 3. Backend Setup
Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a .env file in the root of the backend folder and add your configuration:

```bash
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hr_management_db
JWT_SECRET=super_secret_jwt_key_123
```

Start the backend server:

```bash
node server.js
```

### 4. Frontend Setup
Frontend Setup
Open a new terminal window and navigate to the frontend directory:

```Bash
cd frontend
npm install
```

Create a .env file in the root of the frontend folder:

```bash
VITE_API_URL=http://localhost:5000/api
```

Start the React development server:

```Bash
npm run dev
```


## NOTE: Default Test Credentials
Upon running the SQL schema above, a default Admin account is automatically created for testing purposes.

Email: admin@company.com

Password: Password123!
___________________________________________________________________________________________________________
#### Password for all pre-existing employees:

Email: janedoe@comapny.com

Email: johndoe@company.com

Email: marksmith@company.com

Email: alicesmith@company.com


Password: Password123!
____________________________________________________________________________________________________________
New Employees with different email addresses and passwords can be created by the admin. The above credentials were created just for testing purposes.
