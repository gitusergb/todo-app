# Todo Web Application

**Created by: Gauri Bidwai**  

A full-stack Todo List application with user authentication, role-based access control, and comprehensive admin dashboard for task and user management.

## Features

### Backend (Node.js + Express + MongoDB)
- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: User and Admin roles
- **CRUD Operations**: Complete task management (Create, Read, Update, Delete)
- **User Management**: Admin can manage users and view statistics
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling and logging

### Frontend (React.js)
- **Modern UI**: Clean and responsive user interface
- **Authentication**: Login and registration forms
- **Task Management**: Add, edit, delete, and mark tasks as complete
- **Filtering**: Filter tasks by status (All, Pending, Completed)
- **Real-time Updates**: Instant UI updates with context state management
- **Admin Dashboard**: Admin users can manage other users

## User Roles

### Regular User
- Create, edit, and delete their own tasks
- Mark tasks as complete/incomplete
- View their task statistics
- Update their own profile

### Admin User
- All regular user capabilities
- View and manage all users
- Delete users and their associated tasks
- View system-wide statistics
- Activate/deactivate user accounts

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React.js 18
- React Router for navigation
- Context API for state management
- Axios for API calls
- React Icons for UI icons
- React Toastify for notifications
- date-fns for date formatting

## Requirements

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB**: v5.0 or higher (local installation or cloud instance like MongoDB Atlas)
- **Git**: For cloning the repository

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/todoapp
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

### Admin (Admin only)
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users with pagination
- `GET /api/admin/users/:id` - Get specific user with task statistics
- `PUT /api/admin/users/:id` - Update user information
- `DELETE /api/admin/users/:id` - Delete user and associated tasks
- `PATCH /api/admin/users/:id/toggle-status` - Toggle user active/inactive status
- `GET /api/admin/tasks` - Get all tasks from all users with pagination
- `PUT /api/admin/tasks/:id` - Update any task (admin privilege)
- `DELETE /api/admin/tasks/:id` - Delete any task (admin privilege)

## Default Admin Account

To create an admin account, register a new user and manually update their role in the database:

```javascript
// In MongoDB shell or compass
db.users.updateOne(
  { email: "admint@gmail.com" },
  { $set: { role: "Admint@1234" } }
)
```

```
For ex: 
admint@gmail.com
Admint@1234

userone@gmail.com
Userone@1

user2@gmail.com
Usertwo@2
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Role-based route protection

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start  # React development server with hot reload
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in environment variables
2. Use a production MongoDB instance
3. Generate a secure JWT secret
4. Deploy to your preferred hosting service

### Frontend
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve the build folder using a web server

## Contributing

**This project is open for collaboration!** We welcome contributions from developers of all skill levels.

### How to Contribute

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/todo-webapp.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and test thoroughly
5. **Commit your changes**:
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Contact & Support

**Creator**:  https://github.com/gitusergb 
**Status**: Open for collaboration

Feel free to reach out for questions, suggestions, or collaboration opportunities!

## License

This project is licensed under the ISC License - see the LICENSE file for details.
