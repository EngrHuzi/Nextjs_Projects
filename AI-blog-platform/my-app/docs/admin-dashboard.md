# Admin Dashboard

The admin dashboard provides comprehensive management capabilities for the AI Blog Platform. It allows administrators to manage users, posts, and platform settings.

## Access

The admin dashboard is accessible at `/admin` and requires admin privileges. Only users with the `ADMIN` role can access this dashboard.

## Features

### 1. Overview Dashboard
- **Statistics**: View total users, posts, published posts, and draft posts
- **Content Performance**: See publish rate and content statistics
- **Quick Actions**: Direct links to common tasks

### 2. User Management
- **View Users**: See all registered users with their details
- **Search & Filter**: Search by name/email and filter by role
- **Role Management**: Change user roles between ADMIN and USER
- **User Deletion**: Remove users from the platform

### 3. Post Management
- **View Posts**: See all blog posts with detailed information
- **Search & Filter**: Search by title/content/author and filter by status/category
- **Status Management**: Publish/unpublish posts
- **Post Deletion**: Remove posts from the platform
- **Quick Actions**: Direct links to view and edit posts

### 4. Platform Settings
- **General Settings**: Site name, description, URL, admin email, theme
- **User Management**: Registration settings, email verification, post limits
- **Content Settings**: Comment settings, AI features
- **Maintenance Mode**: Temporarily disable public access

## API Endpoints

### Users
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/[id]` - Update user role
- `DELETE /api/admin/users/[id]` - Delete user

### Posts
- `GET /api/admin/posts` - Get all posts
- `PATCH /api/admin/posts/[id]` - Update post status
- `DELETE /api/admin/posts/[id]` - Delete post

### Settings
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings

## Authentication

All admin API endpoints require:
- Valid JWT token in Authorization header
- User must have ADMIN role

## Security

- All admin operations are protected by authentication middleware
- Role-based access control ensures only admins can access admin features
- Sensitive user data (passwords) are never exposed in API responses

## Usage

1. **Login** as an admin user
2. **Navigate** to `/admin` or click the "Admin" link in the header
3. **Use the tabs** to switch between different management sections
4. **Search and filter** data as needed
5. **Perform actions** using the action buttons and dropdowns

## Default Admin User

For testing purposes, you can use:
- **Email**: muhammadhuzaifaai890@gmail.com
- **Password**: (use the password you set during registration)

Or create a new admin user using the script:
```bash
npx tsx scripts/create-admin-user.ts
```

## Troubleshooting

- **Access Denied**: Ensure you're logged in with an admin account
- **API Errors**: Check browser console for detailed error messages
- **Data Not Loading**: Verify authentication token is valid
- **Permission Errors**: Ensure user has ADMIN role
