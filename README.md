# LearnBase Platform

A comprehensive educational platform for skill development, job matching, and professional growth in Nigeria. Built with React.js, Node.js, and MongoDB.

# LearnBase Pitch Deck Link - https://drive.google.com/file/d/1qlyaiY0yjbESv0G2Z2ITplNCXTmMSbDG/view?usp=drive_link

## 🚀 Features

### Core Features
- **Multi-language Support** - English, Yoruba, Hausa, Igbo, and Pidgin
- **Role-based Access** - Students, Employers, and Administrators
- **Skill Assessment** - Interactive tests and evaluations
- **Job Matching** - AI-powered job recommendations
- **Certificate Management** - Digital credential storage and verification
- **Real-time Notifications** - Instant updates and alerts
- **Accessibility** - WCAG 2.1 AA compliant with full keyboard navigation

### Technical Features
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Automatic theme switching
- **Progressive Web App** - Offline capabilities
- **Security** - JWT authentication, rate limiting, input validation
- **Performance** - Redis caching, optimized queries
- **Monitoring** - Health checks, logging, error tracking

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **React Context** - State management
- **i18next** - Internationalization
- **CSS Modules** - Styling
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Redis** - Caching
- **JWT** - Authentication
- **Multer** - File uploads
- **Joi** - Validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD pipeline
- **Let's Encrypt** - SSL certificates

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB 6.0+
- Redis 7.0+

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/learnbase-platform.git
   cd learnbase-platform
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm start
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017
   - Redis: localhost:6379

### Production Deployment

1. **Set up environment variables**
   ```bash
   cp env.example .env
   # Configure production settings
   ```

2. **Deploy with production profile**
   ```bash
   docker-compose --profile production up -d
   ```

3. **Set up SSL certificates**
   ```bash
   # Update DOMAIN_NAME and CERTBOT_EMAIL in .env
   docker-compose --profile production run certbot
   ```

## 📁 Project Structure

```
learnbase-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── uploads/             # File uploads
├── docker/                   # Docker configuration
│   ├── entrypoint.sh        # Container entrypoint
│   ├── nginx.conf           # Nginx configuration
│   └── mongo-init.js        # Database initialization
├── .github/workflows/        # CI/CD pipelines
└── docs/                     # Documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB admin username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password | `password` |
| `MONGO_DATABASE` | Database name | `learnbase` |
| `REDIS_PASSWORD` | Redis password | `password` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `UPLOAD_PATH` | File upload directory | `/app/uploads` |
| `MAX_FILE_SIZE` | Maximum file size (bytes) | `10485760` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |

### Docker Configuration

The platform uses Docker Compose for orchestration:

- **MongoDB**: Database with authentication
- **Redis**: Caching and session storage
- **App**: Main application container
- **Nginx**: Reverse proxy (production)
- **Certbot**: SSL certificate management (production)

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 Monitoring

### Health Checks
- Application: `GET /api/health`
- Database: MongoDB connection status
- Cache: Redis connection status

### Logging
- Application logs: Docker container logs
- Access logs: Nginx access logs
- Error logs: Nginx error logs

## 🔒 Security

### Authentication
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Session management with Redis

### API Security
- Rate limiting (10 req/s for API, 5 req/m for login)
- Input validation with Joi
- CORS configuration
- Helmet.js security headers

### File Upload Security
- File type validation
- Size limits
- Virus scanning (optional)
- Secure file storage

## 🌐 Accessibility

The platform is designed with accessibility in mind:

- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - ARIA labels and semantic HTML
- **High Contrast Mode** - For visual impairments
- **Reduced Motion** - Respects user preferences
- **Font Size Control** - 4 size options
- **Focus Management** - Visible focus indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Ensure accessibility compliance
- Test across different browsers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Issues**: [GitHub Issues](https://github.com/yourusername/learnbase-platform/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/learnbase-platform/wiki)
- **Email**: support@learnbase.com

## 🙏 Acknowledgments

- Nigerian educational institutions for domain expertise
- Open source community for tools and libraries
- Accessibility advocates for guidance
- Beta testers for feedback and improvements

---

**LearnBase Platform** - Empowering Nigerian learners and professionals through technology. 
