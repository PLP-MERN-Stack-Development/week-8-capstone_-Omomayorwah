// MongoDB initialization script for LearnBase

// Create database and collections
db = db.getSiblingDB('learnbase');

// Create collections
db.createCollection('users');
db.createCollection('jobs');
db.createCollection('certificates');
db.createCollection('notifications');
db.createCollection('assessments');
db.createCollection('applications');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": -1 });

db.jobs.createIndex({ "title": "text", "description": "text" });
db.jobs.createIndex({ "employer": 1 });
db.jobs.createIndex({ "location": 1 });
db.jobs.createIndex({ "status": 1 });
db.jobs.createIndex({ "createdAt": -1 });

db.certificates.createIndex({ "userId": 1 });
db.certificates.createIndex({ "title": "text" });
db.certificates.createIndex({ "expiryDate": 1 });

db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "read": 1 });
db.notifications.createIndex({ "createdAt": -1 });

db.assessments.createIndex({ "userId": 1 });
db.assessments.createIndex({ "type": 1 });
db.assessments.createIndex({ "completedAt": -1 });

db.applications.createIndex({ "jobId": 1 });
db.applications.createIndex({ "userId": 1 });
db.applications.createIndex({ "status": 1 });
db.applications.createIndex({ "createdAt": -1 });

print('LearnBase database initialized successfully'); 