# Notes App - Full-Stack Application

A modern, feature-rich notes application with advanced visual effects, built with React and Spring Boot. Features include user authentication, CRUD operations, image uploads, note sharing with access levels, and stunning visual animations.

## 🚀 Live Demo

- **Frontend**: [Your Vercel URL will be here after deployment]
- **Backend API**: [Your Render URL will be here after deployment]

## ✨ Features

### Core Functionality
- **User Authentication**: JWT-based secure authentication system
- **CRUD Operations**: Create, read, update, and delete notes
- **Image Upload**: Multi-image support with carousel display
- **Note Sharing**: Share notes with configurable access levels (Viewer/Editor)
- **Search & Filter**: Real-time client-side search functionality
- **Responsive Design**: Mobile-first, fully responsive interface

### Advanced Visual Effects
- **Parallax Scrolling**: Multi-layer depth effects on landing page
- **Scroll Animations**: Components animate into view using Intersection Observer API
- **3D Hover Effects**: Note cards with sophisticated transform animations
- **Counter Animations**: Animated statistics with scroll-triggered counting
- **Image Carousels**: Touch-friendly image galleries within notes

## 🛠 Tech Stack

### Frontend
- **React 18+** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

### Animation Libraries
- **react-scroll-parallax** - Smooth parallax scrolling effects
- **react-awesome-reveal** - Performance-optimized scroll animations
- **react-countup** - Animated number counting
- **react-alice-carousel** - Lightweight image carousel

### Backend
- **Spring Boot 3.x** - Java enterprise framework
- **Spring Security 6** - Authentication and authorization
- **Spring Data JPA** - Data persistence layer
- **PostgreSQL** - Production database
- **JWT** - Stateless authentication tokens

### Deployment
- **Frontend**: Vercel (with CDN and automatic HTTPS)
- **Backend**: Render (with PostgreSQL database)
- **File Storage**: Cloud storage integration ready

## 🏗 Project Structure

```
notes-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/             # API configuration and services
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Layout components (Navbar, Footer)
│   │   ├── pages/           # Page components
│   │   ├── services/        # Global services (AuthContext)
│   │   └── styles/          # Global CSS and styling
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── .env                 # Environment variables
│
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/notesapp/backend/
│   │   ├── config/          # Security and app configuration
│   │   ├── controllers/     # REST API endpoints
│   │   ├── dto/             # Data transfer objects
│   │   ├── entities/        # JPA entities
│   │   ├── enums/           # Application enums
│   │   ├── repositories/    # Data access layer
│   │   ├── security/        # JWT and security components
│   │   └── services/        # Business logic layer
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml              # Maven dependencies
│
├── RENDER_DEPLOYMENT.md     # Backend deployment guide
├── VERCEL_DEPLOYMENT.md     # Frontend deployment guide
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- PostgreSQL 12+ (for local development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd notes-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   
   # Configure database in application.properties
   # Update with your local PostgreSQL credentials
   
   # Install dependencies and run
   mvn clean install
   mvn spring-boot:run
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Notes (Protected)
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note with images
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

### Sharing (Protected)
- `POST /api/notes/{id}/share` - Create share link
- `GET /api/notes/{id}/shares` - Get note's share links

### Public Access
- `GET /api/public/notes/{shareId}` - Access shared note
- `PUT /api/public/notes/{shareId}` - Edit shared note (if allowed)

## 🚀 Deployment

This application is designed for easy deployment on modern cloud platforms.

### Backend Deployment (Render)
Follow the detailed guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Key Steps:**
1. Create PostgreSQL database on Render
2. Deploy Spring Boot application
3. Configure environment variables
4. Update CORS for frontend domain

### Frontend Deployment (Vercel)
Follow the detailed guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**Key Steps:**
1. Connect GitHub repository to Vercel
2. Configure build settings for Vite
3. Set environment variables
4. Deploy with automatic HTTPS and CDN

## 🔧 Environment Variables

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8080  # or your production backend URL
```

### Backend (application.properties)
```bash
# Database
SPRING_DATASOURCE_URL=your-database-url
SPRING_DATASOURCE_USERNAME=your-db-username  
SPRING_DATASOURCE_PASSWORD=your-db-password

# Security
JWT_SECRET=your-secure-jwt-secret

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173  # or your production frontend URL
```

## 🎨 Visual Effects Implementation

### Parallax Scrolling
Implemented using `react-scroll-parallax` with multiple layers moving at different speeds to create depth perception.

### Scroll Animations  
Uses `react-awesome-reveal` with Intersection Observer API for performance-optimized animations that trigger when elements enter the viewport.

### 3D Hover Effects
Pure CSS transforms with hardware acceleration for smooth card hover effects:
```css
.note-card:hover {
  transform: translateY(-10px) rotateX(15deg) scale(1.05);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### Counter Animations
`react-countup` with scroll spy functionality for statistics that animate from zero when they become visible.

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Server-side validation for all endpoints
- **SQL Injection Prevention**: JPA parameterized queries
- **XSS Protection**: React's built-in XSS prevention

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test          # Run unit tests
npm run test:coverage # Run with coverage report
npm run lint          # Code linting
```

### Backend Testing
```bash
cd backend
mvn test              # Run unit tests
mvn test -Dtest=*Integration* # Integration tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS_ALLOWED_ORIGINS includes your frontend URL
   - Check that both frontend and backend are using HTTPS in production

2. **Database Connection**
   - Ensure PostgreSQL is running locally or environment variables are set correctly
   - Check database URL format and credentials

3. **Build Failures**
   - Verify all dependencies are installed
   - Check Node.js and Java versions meet requirements
   - Review build logs for specific error messages

4. **Animation Issues**
   - Ensure all animation libraries are properly installed
   - Check for JavaScript console errors
   - Verify CSS is loading correctly

### Getting Help

- Check the deployment guides for detailed troubleshooting
- Review the API documentation for endpoint specifications  
- Open an issue for bugs or feature requests

## 📊 Performance Optimizations

- **Code Splitting**: Automatic chunks for better loading performance
- **Image Optimization**: Lazy loading and proper sizing
- **Caching**: Browser caching and CDN optimization
- **Minification**: Automatic CSS and JavaScript minification
- **Compression**: Gzip/Brotli compression for all assets

---

Built with ❤️ using React, Spring Boot, and modern web technologies.
