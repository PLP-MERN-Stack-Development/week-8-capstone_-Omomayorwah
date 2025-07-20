const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeEmployer, authorizeArtisan } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get job listings with filters
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      q, 
      location, 
      skills, 
      jobType, 
      minSalary, 
      maxSalary, 
      limit = 20, 
      page = 1 
    } = req.query;

    // Mock job listings
    const jobs = [
      {
        id: 'job-1',
        employerId: 'employer-1',
        employerName: 'ABC Construction Ltd',
        title: 'Experienced Plumber Needed',
        description: 'We need a skilled plumber for residential and commercial projects. Must have at least 2 years experience.',
        requiredSkills: ['Plumbing'],
        location: 'Lagos',
        salary: {
          min: 80000,
          max: 120000,
          currency: 'NGN',
        },
        jobType: 'full-time',
        applicationDeadline: new Date('2024-12-31'),
        status: 'active',
        createdAt: new Date('2024-01-15'),
        applications: 5,
      },
      {
        id: 'job-2',
        employerId: 'employer-2',
        employerName: 'Tech Solutions Inc',
        title: 'Electrical Technician',
        description: 'Looking for an electrical technician for installation and maintenance work.',
        requiredSkills: ['Electrical Wiring'],
        location: 'Abuja',
        salary: {
          min: 100000,
          max: 150000,
          currency: 'NGN',
        },
        jobType: 'contract',
        applicationDeadline: new Date('2024-11-30'),
        status: 'active',
        createdAt: new Date('2024-01-10'),
        applications: 3,
      },
      {
        id: 'job-3',
        employerId: 'employer-3',
        employerName: 'Home Services Ltd',
        title: 'Carpenter for Furniture Making',
        description: 'Skilled carpenter needed for custom furniture making and installation.',
        requiredSkills: ['Carpentry'],
        location: 'Port Harcourt',
        salary: {
          min: 60000,
          max: 90000,
          currency: 'NGN',
        },
        jobType: 'part-time',
        applicationDeadline: new Date('2024-12-15'),
        status: 'active',
        createdAt: new Date('2024-01-20'),
        applications: 2,
      },
    ];

    // Filter jobs based on query parameters
    let filteredJobs = jobs;
    
    if (q) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(q.toLowerCase()) ||
        job.description.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    if (location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (skills) {
      const skillArray = skills.split(',');
      filteredJobs = filteredJobs.filter(job => 
        job.requiredSkills.some(skill => skillArray.includes(skill))
      );
    }
    
    if (jobType) {
      filteredJobs = filteredJobs.filter(job => job.jobType === jobType);
    }
    
    if (minSalary) {
      filteredJobs = filteredJobs.filter(job => job.salary.min >= parseInt(minSalary));
    }
    
    if (maxSalary) {
      filteredJobs = filteredJobs.filter(job => job.salary.max <= parseInt(maxSalary));
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedJobs = filteredJobs.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredJobs.length,
          pages: Math.ceil(filteredJobs.length / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
    });
  }
});

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Employer)
router.post('/', authenticateToken, authorizeEmployer, async (req, res) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      location,
      salary,
      jobType,
      applicationDeadline,
    } = req.body;

    if (!title || !description || !requiredSkills || !location || !salary) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, required skills, location, and salary are required',
      });
    }

    // Mock job creation
    const job = {
      id: `job-${Date.now()}`,
      employerId: req.user._id,
      employerName: req.user.profile.employerProfile?.companyName || 'Unknown Company',
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      location,
      salary,
      jobType: jobType || 'full-time',
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      status: 'active',
      createdAt: new Date(),
      applications: 0,
    };

    // n8n job automation
    if (process.env.N8N_JOB_WEBHOOK_URL) {
      axios.post(process.env.N8N_JOB_WEBHOOK_URL, job).catch(err => {
        logger.error('Failed to trigger n8n job workflow:', err.message);
      });
    }

    logger.info(`Job posted by employer ${req.user._id}: ${job.id}`);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: {
        job,
      },
    });
  } catch (error) {
    logger.error('Error posting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post job',
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock job data
    const job = {
      id,
      employerId: 'employer-1',
      employerName: 'ABC Construction Ltd',
      title: 'Experienced Plumber Needed',
      description: 'We need a skilled plumber for residential and commercial projects. Must have at least 2 years experience.',
      requiredSkills: ['Plumbing'],
      location: 'Lagos',
      salary: {
        min: 80000,
        max: 120000,
        currency: 'NGN',
      },
      jobType: 'full-time',
      applicationDeadline: new Date('2024-12-31'),
      status: 'active',
      createdAt: new Date('2024-01-15'),
      applications: 5,
      requirements: [
        'Minimum 2 years experience',
        'Valid certification',
        'Own tools',
        'Reliable transportation',
      ],
      benefits: [
        'Health insurance',
        'Paid time off',
        'Performance bonuses',
        'Training opportunities',
      ],
    };

    res.json({
      success: true,
      data: {
        job,
      },
    });
  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Employer - owner only)
router.put('/:id', authenticateToken, authorizeEmployer, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Mock job update
    logger.info(`Job updated by employer ${req.user._id}: ${id}`);

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: {
        jobId: id,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (Employer - owner only)
router.delete('/:id', authenticateToken, authorizeEmployer, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock job deletion
    logger.info(`Job deleted by employer ${req.user._id}: ${id}`);

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
    });
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Artisan)
router.post('/:id/apply', authenticateToken, authorizeArtisan, async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter, expectedSalary } = req.body;

    // Mock application
    const application = {
      id: `app-${Date.now()}`,
      jobId: id,
      artisanId: req.user._id,
      artisanName: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
      coverLetter: coverLetter || '',
      expectedSalary: expectedSalary || null,
      status: 'pending',
      appliedAt: new Date(),
    };

    logger.info(`Job application submitted by artisan ${req.user._id} for job ${id}`);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application,
      },
    });
  } catch (error) {
    logger.error('Error submitting job application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
    });
  }
});

// @route   GET /api/applications
// @desc    Get job applications (for employers) or user applications (for artisans)
// @access  Private
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    // Mock applications based on user role
    let applications = [];
    
    if (req.user.role === 'employer') {
      // Employer viewing applications for their jobs
      applications = [
        {
          id: 'app-1',
          jobId: 'job-1',
          jobTitle: 'Experienced Plumber Needed',
          artisanId: 'artisan-1',
          artisanName: 'John Doe',
          artisanSkills: ['Plumbing'],
          coverLetter: 'I have 3 years of experience in plumbing...',
          expectedSalary: 100000,
          status: 'pending',
          appliedAt: new Date('2024-01-20'),
        },
        {
          id: 'app-2',
          jobId: 'job-1',
          jobTitle: 'Experienced Plumber Needed',
          artisanId: 'artisan-2',
          artisanName: 'Jane Smith',
          artisanSkills: ['Plumbing', 'Electrical Wiring'],
          coverLetter: 'I am a certified plumber with 5 years experience...',
          expectedSalary: 120000,
          status: 'shortlisted',
          appliedAt: new Date('2024-01-18'),
        },
      ];
    } else if (req.user.role === 'artisan') {
      // Artisan viewing their own applications
      applications = [
        {
          id: 'app-1',
          jobId: 'job-1',
          jobTitle: 'Experienced Plumber Needed',
          employerName: 'ABC Construction Ltd',
          coverLetter: 'I have 3 years of experience in plumbing...',
          expectedSalary: 100000,
          status: 'pending',
          appliedAt: new Date('2024-01-20'),
        },
        {
          id: 'app-2',
          jobId: 'job-2',
          jobTitle: 'Electrical Technician',
          employerName: 'Tech Solutions Inc',
          coverLetter: 'I am a certified electrical technician...',
          expectedSalary: 130000,
          status: 'accepted',
          appliedAt: new Date('2024-01-15'),
        },
      ];
    }

    // Filter by status if provided
    if (status) {
      applications = applications.filter(app => app.status === status);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedApplications = applications.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        applications: paginatedApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: applications.length,
          pages: Math.ceil(applications.length / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (employer only)
// @access  Private (Employer)
router.put('/applications/:id/status', authenticateToken, authorizeEmployer, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!status || !['pending', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required',
      });
    }

    // Mock application status update
    logger.info(`Application status updated by employer ${req.user._id}: ${id} -> ${status}`);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        applicationId: id,
        status,
        feedback,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
    });
  }
});

// @route   PUT /api/jobs/:id/status
// @desc    Update job status (admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['active', 'closed', 'flagged'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing status',
      });
    }
    const job = await Job.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }
    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: {
        job,
      },
    });
  } catch (error) {
    logger.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
    });
  }
});

module.exports = router; 