# Mini Leave Management System

A comprehensive leave management system built with React (TypeScript), Node.js/Express, JWT authentication, and MongoDB. This system allows employees to apply for leaves and HR to manage employee leave requests efficiently.

## 🚀 Features

### Core Functionality

- **Employee Management**: Add, view, and manage employee profiles
- **Leave Applications**: Employees can apply for different types of leaves
- **Approval Workflow**: HR can approve or reject leave requests with comments
- **Leave Balance Tracking**: Real-time tracking of available leave balance
- **Dashboard**: Overview of leave statistics and recent activities
- **Reports**: Comprehensive reporting and analytics

### Advanced Features

- **Role-based Access Control**: Different permissions for employees, managers, and HR
- **Real-time Validation**: Prevent overlapping leaves, insufficient balance, etc.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Working Days Calculation**: Automatically excludes weekends from leave calculations

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **React Router DOM** for navigation
- **React Hot Toast** for notifications
- **Axios** for API communication

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** for cross-origin requests

## 📁 Project Structure

```
Mini Leave Management System/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main App component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                # Node.js backend application
│   ├── models/            # Mongoose models
│   ├── routes/            # API route handlers
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── server.js          # Main server file
└── README.md              # Project documentation
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Step 1: Clone and Setup

```bash
# Create project directory
mkdir "Mini Leave Management System"
cd "Mini Leave Management System"

# Setup will be done via the provided files
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
# MONGODB_URI=mongodb://localhost:27017/leave_management
# JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
# PORT=8000
# NODE_ENV=development

# Start the backend server
npm run dev
# or
npm start
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Step 4: Database Setup

The system will automatically create the necessary database collections when you first run the application. Use the signup page to create the first account; the first registered account is assigned role `HR` automatically so you can manage employees.

## 👤 Demo Credentials

The system comes with demo data. Use these credentials to login:

### HR Account

- **Email**: hr@company.com
- **Password**: password123
- **Role**: HR (can manage employees and approve leaves)

### Employee Account

- **Email**: john@company.com
- **Password**: password123
- **Role**: Employee (can apply for leaves and view own records)

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Signup (self-register). First user becomes HR automatically to bootstrap the system
- `POST /api/auth/login` - Employee login
- `GET /api/auth/me` - Get current user profile

### Employee Management

- `POST /api/employees` - Add new employee (HR only)
- `GET /api/employees` - Get all employees (HR only)
- `GET /api/employees/:id/balance` - Get employee leave balance
- `GET /api/employees/:id/leaves` - Get employee leave history

### Leave Management

- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/requests` - Get all leave requests (HR only)
- `GET /api/leaves/my-requests` - Get current user's leave requests
- `PUT /api/leaves/:id/approve` - Approve leave request (HR only)
- `PUT /api/leaves/:id/reject` - Reject leave request (HR only)
- `DELETE /api/leaves/:id` - Cancel pending leave request

## 🎯 Business Rules & Edge Cases Handled

### Leave Application Rules

1. **Cannot apply for past dates**: Applications must be for future dates only
2. **No overlapping leaves**: System prevents conflicting leave requests
3. **Insufficient balance check**: Cannot apply for more days than available
4. **Joining date validation**: Cannot apply for leave before joining the company
5. **Weekend exclusion**: Working days calculation automatically excludes weekends
6. **Minimum duration**: Leave must be for at least one working day

### Data Validation

1. **Email uniqueness**: Prevents duplicate employee emails
2. **Password security**: Minimum 6 characters required
3. **Future date restriction**: Joining date cannot be in the future
4. **Required fields**: All mandatory fields validated on both frontend and backend
5. **Input sanitization**: Prevents malicious input and XSS attacks

### Access Control

1. **Role-based permissions**: Different access levels for employees, managers, and HR
2. **JWT token validation**: Secure API access with token expiration
3. **Route protection**: Frontend routes protected based on user roles
4. **Data isolation**: Users can only access their own data (unless HR/Manager)

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Secure token-based authentication with expiration
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper CORS setup for secure cross-origin requests
- **SQL Injection Prevention**: MongoDB with Mongoose provides built-in protection
- **XSS Protection**: Input sanitization and validation

## 📱 Responsive Design

The application is fully responsive and works across:

- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with collapsible navigation

## 🚀 Deployment

### Backend Deployment (Heroku/Render)

1. Set environment variables in hosting platform
2. Update MONGODB_URI to MongoDB Atlas connection string
3. Deploy the backend folder

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Update API base URL in production

### Environment Variables

```bash
# Backend (.env)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=8000
NODE_ENV=production
FRONTEND_URL=your_frontend_url
```

## 📊 Scaling Considerations (50 → 500 employees)

### Database Scaling

- **Indexing**: Add indexes on frequently queried fields (employee ID, date ranges, status)
- **Database Sharding**: Partition data across multiple database instances
- **Connection Pooling**: Implement connection pooling for better resource management

### Application Scaling

- **Horizontal Scaling**: Deploy multiple instances behind a load balancer
- **Caching**: Implement Redis for session storage and frequently accessed data
- **CDN**: Use CDN for static assets delivery
- **Database Optimization**: Implement query optimization and aggregation pipelines

### Architecture Improvements

- **Microservices**: Split into separate services (auth, employee, leave management)
- **Message Queues**: Implement async processing for email notifications
- **API Gateway**: Centralized API management and rate limiting
- **Monitoring**: Add comprehensive logging and monitoring (ELK stack, Prometheus)

## 🐛 Known Limitations & Future Improvements

### Current Limitations

1. **Email Notifications**: Not implemented (can be added with SendGrid/Nodemailer)
2. **File Attachments**: No support for medical certificates or documents
3. **Calendar Integration**: No integration with Google Calendar or Outlook
4. **Mobile App**: Web-based only, no native mobile apps

### Planned Improvements

1. **Email Notifications**: Automated email alerts for leave status updates
2. **Calendar View**: Visual calendar interface for leave scheduling
3. **Bulk Operations**: Bulk approve/reject functionality
4. **Advanced Reporting**: More detailed analytics and export capabilities
5. **Leave Policies**: Configurable leave policies per department/role
6. **Mobile App**: React Native mobile application

## 📋 Testing

### Manual Testing Checklist

- [ ] Employee login/logout functionality
- [ ] HR login and employee management
- [ ] Leave application with various edge cases
- [ ] Approval/rejection workflow
- [ ] Leave balance calculation
- [ ] Responsive design on different devices

### Automated Testing (Future)

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For support or questions about this project, please reach out to the development team or create an issue in the repository.

---

**Built with ❤️ using modern web technologies for efficient leave management.**
