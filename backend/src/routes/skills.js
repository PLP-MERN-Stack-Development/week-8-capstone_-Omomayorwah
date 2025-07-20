const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeArtisan } = require('../middleware/auth');
const logger = require('../utils/logger');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/skills/available
// @desc    Get available skills for assessment
// @access  Private (Artisan)
router.get('/available', authenticateToken, authorizeArtisan, async (req, res) => {
  try {
    // Mock available skills
    const skills = [
      {
        id: '1',
        name: 'Plumbing',
        category: 'technical',
        description: 'Basic plumbing installation and repair skills',
        requirements: ['Basic tools', 'Safety equipment'],
        assessmentCriteria: [
          'Pipe fitting accuracy',
          'Leak detection',
          'Safety procedures',
        ],
        levels: ['basic', 'intermediate', 'advanced'],
        estimatedDuration: 120, // minutes
      },
      {
        id: '2',
        name: 'Electrical Wiring',
        category: 'technical',
        description: 'Electrical installation and maintenance',
        requirements: ['Electrical tools', 'Safety equipment', 'Basic knowledge'],
        assessmentCriteria: [
          'Circuit installation',
          'Safety compliance',
          'Troubleshooting',
        ],
        levels: ['basic', 'intermediate', 'advanced'],
        estimatedDuration: 180,
      },
      {
        id: '3',
        name: 'Carpentry',
        category: 'technical',
        description: 'Woodworking and furniture making',
        requirements: ['Woodworking tools', 'Safety equipment'],
        assessmentCriteria: [
          'Measurement accuracy',
          'Joinery techniques',
          'Finish quality',
        ],
        levels: ['basic', 'intermediate', 'advanced'],
        estimatedDuration: 150,
      },
      {
        id: '4',
        name: 'Hair Styling',
        category: 'creative',
        description: 'Professional hair styling and cutting',
        requirements: ['Styling tools', 'Hair products'],
        assessmentCriteria: [
          'Cutting techniques',
          'Styling creativity',
          'Client satisfaction',
        ],
        levels: ['basic', 'intermediate', 'advanced'],
        estimatedDuration: 90,
      },
      {
        id: '5',
        name: 'Cooking',
        category: 'creative',
        description: 'Professional cooking and food preparation',
        requirements: ['Kitchen equipment', 'Ingredients'],
        assessmentCriteria: [
          'Food safety',
          'Taste and presentation',
          'Efficiency',
        ],
        levels: ['basic', 'intermediate', 'advanced'],
        estimatedDuration: 120,
      },
    ];

    res.json({
      success: true,
      data: {
        skills,
      },
    });
  } catch (error) {
    logger.error('Error fetching available skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available skills',
    });
  }
});

// @route   POST /api/skills/assess
// @desc    Submit skill assessment
// @access  Private (Artisan)
router.post('/assess', authenticateToken, authorizeArtisan, async (req, res) => {
  try {
    const { skillId, level, answers, practicalEvidence } = req.body;

    if (!skillId || !level) {
      return res.status(400).json({
        success: false,
        message: 'Skill ID and level are required',
      });
    }

    // Mock assessment processing
    const score = Math.floor(Math.random() * 100) + 1;
    const passed = score >= 70; // 70% passing threshold

    const assessment = {
      id: `assessment-${Date.now()}`,
      artisanId: req.user._id,
      skillId,
      level,
      score,
      passed,
      completedAt: new Date(),
      answers: answers || [],
      practicalEvidence: practicalEvidence || [],
      certifyingBody: 'internal', // or 'NABTEB', 'ITF'
    };

    logger.info(`Skill assessment submitted by artisan ${req.user._id}: ${skillId}`);

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        assessment,
      },
    });
  } catch (error) {
    logger.error('Error submitting skill assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
    });
  }
});

// @route   GET /api/skills/certifications
// @desc    Get artisan certifications
// @access  Private (Artisan)
router.get('/certifications', authenticateToken, authorizeArtisan, async (req, res) => {
  try {
    // Mock certifications
    const certifications = [
      {
        id: 'cert-1',
        artisanId: req.user._id,
        skillName: 'Plumbing',
        level: 'basic',
        certifyingBody: 'internal',
        score: 85,
        issuedDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        certificateUrl: 'https://example.com/certificates/cert-1.pdf',
        verificationCode: 'LERNBASE-PLUMB-001',
        status: 'active',
      },
      {
        id: 'cert-2',
        artisanId: req.user._id,
        skillName: 'Electrical Wiring',
        level: 'intermediate',
        certifyingBody: 'NABTEB',
        score: 92,
        issuedDate: new Date('2024-02-20'),
        expiryDate: new Date('2027-02-20'),
        certificateUrl: 'https://example.com/certificates/cert-2.pdf',
        verificationCode: 'NABTEB-ELEC-002',
        status: 'active',
      },
    ];

    // n8n certification automation (trigger for each cert)
    if (process.env.N8N_CERTIFICATION_WEBHOOK_URL) {
      certifications.forEach(cert => {
        axios.post(process.env.N8N_CERTIFICATION_WEBHOOK_URL, cert).catch(err => {
          logger.error('Failed to trigger n8n certification workflow:', err.message);
        });
      });
    }

    res.json({
      success: true,
      data: {
        certifications,
      },
    });
  } catch (error) {
    logger.error('Error fetching certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certifications',
    });
  }
});

// @route   POST /api/skills/certify
// @desc    Generate certification for passed assessment
// @access  Private (Artisan)
router.post('/certify', authenticateToken, authorizeArtisan, async (req, res) => {
  try {
    const { assessmentId, certifyingBody = 'internal' } = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required',
      });
    }

    // Mock certification generation
    const certification = {
      id: `cert-${Date.now()}`,
      artisanId: req.user._id,
      skillName: 'Plumbing', // Mock skill name
      level: 'basic',
      certifyingBody,
      score: 85,
      issuedDate: new Date(),
      expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
      certificateUrl: `https://example.com/certificates/cert-${Date.now()}.pdf`,
      verificationCode: `LERNBASE-${certifyingBody.toUpperCase()}-${Date.now()}`,
      status: 'active',
    };

    logger.info(`Certification generated for artisan ${req.user._id}: ${certification.id}`);

    res.json({
      success: true,
      message: 'Certification generated successfully',
      data: {
        certification,
      },
    });
  } catch (error) {
    logger.error('Error generating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certification',
    });
  }
});

// @route   GET /api/skills/verify/:code
// @desc    Verify certification by code
// @access  Public
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
    }

    // Mock verification
    const verification = {
      code,
      isValid: true,
      certification: {
        id: 'cert-1',
        artisanName: 'John Doe',
        skillName: 'Plumbing',
        level: 'basic',
        certifyingBody: 'internal',
        issuedDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        status: 'active',
      },
    };

    res.json({
      success: true,
      data: {
        verification,
      },
    });
  } catch (error) {
    logger.error('Error verifying certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certification',
    });
  }
});

// @route   GET /api/skills/portfolio
// @desc    Get artisan portfolio
// @access  Private (Artisan)
router.get('/portfolio', authenticateToken, authorizeArtisan, async (req, res) => {
  try {
    // Mock portfolio data
    const portfolio = {
      artisanId: req.user._id,
      skills: [
        {
          name: 'Plumbing',
          level: 'basic',
          experience: 2, // years
          certifications: [
            {
              id: 'cert-1',
              level: 'basic',
              issuedDate: new Date('2024-01-15'),
              expiryDate: new Date('2026-01-15'),
              certifyingBody: 'internal',
            },
          ],
        },
        {
          name: 'Electrical Wiring',
          level: 'intermediate',
          experience: 3,
          certifications: [
            {
              id: 'cert-2',
              level: 'intermediate',
              issuedDate: new Date('2024-02-20'),
              expiryDate: new Date('2027-02-20'),
              certifyingBody: 'NABTEB',
            },
          ],
        },
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'Residential Plumbing Installation',
          description: 'Complete plumbing installation for 3-bedroom house',
          skills: ['Plumbing'],
          completedDate: new Date('2024-03-15'),
          clientRating: 5,
          images: ['https://example.com/project1-1.jpg', 'https://example.com/project1-2.jpg'],
        },
        {
          id: 'proj-2',
          title: 'Commercial Electrical Work',
          description: 'Electrical wiring for small office building',
          skills: ['Electrical Wiring'],
          completedDate: new Date('2024-02-10'),
          clientRating: 4,
          images: ['https://example.com/project2-1.jpg'],
        },
      ],
      availability: 'available',
      hourlyRate: 5000, // NGN
      currency: 'NGN',
    };

    res.json({
      success: true,
      data: {
        portfolio,
      },
    });
  } catch (error) {
    logger.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
    });
  }
});

// @route   POST /api/skills/portfolio
// @desc    Update artisan portfolio
// @access  Private (Artisan)
router.post('/portfolio', authenticateToken, authorizeArtisan, async (req, res) => {
  try {
    const { skills, projects, availability, hourlyRate } = req.body;

    // Mock portfolio update
    logger.info(`Portfolio updated for artisan ${req.user._id}`);

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: {
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error updating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
    });
  }
});

module.exports = router; 