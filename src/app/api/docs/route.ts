export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'LivelihoodSaathi AI - Enterprise Backend API',
    version: '2.0.0',
    description:
      'Production-ready, enterprise-focused, multilingual AI-powered livelihood guidance API for NGOs, skill-development institutions, and individual beneficiaries.',
  },
  servers: [{ url: '/api', description: 'Internal Next.js API Server' }],
  tags: [
    { name: 'Authentication', description: 'User login, registration, profile, and session management' },
    { name: 'Organizations', description: 'Enterprise tenant registration, isolation, and member management' },
    { name: 'Beneficiaries', description: 'Beneficiary profiles, search, filtering, and coordinator assignment' },
    { name: 'AI Assessments', description: 'Scikit-learn recommender and Gnani Evon 30B reasoning' },
    { name: 'Training Programmes', description: 'Programmes, capacity, seats, and beneficiary enrollments' },
    { name: 'Progress & Follow-ups', description: 'Structured milestone timeline and coordinator interactions' },
    { name: 'Enterprise Analytics', description: 'Calculated metrics, KPI dashboards, and skill distribution' },
    { name: 'Voice & AI', description: 'Gnani Prisma v3.0 STT, Timbre v3.0 TTS, and WebSocket streaming' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from /api/auth/login or /api/auth/register',
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new beneficiary or organization coordinator',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Shwetha S' },
                  email: { type: 'string', example: 'shwetha.s@livelihoodsaathi.org' },
                  password: { type: 'string', example: 'Password@123' },
                  role: { type: 'string', enum: ['BENEFICIARY', 'COORDINATOR', 'ORG_ADMIN'], default: 'BENEFICIARY' },
                  organizationId: { type: 'string', example: 'org-tnsrlm' },
                  phone: { type: 'string', example: '+91 98765 43210' },
                  preferredLanguage: { type: 'string', default: 'ta-IN' },
                  educationLevel: { type: 'string', example: 'B.Tech AI & DS' },
                  targetCareer: { type: 'string', example: 'Full-Stack Developer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          409: { description: 'User already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@tnsrlm.org' },
                  password: { type: 'string', example: 'Password@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with JWT token and profile' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile and roles',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated user details' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/organizations': {
      get: {
        tags: ['Organizations'],
        summary: 'List accessible organizations',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of organization profiles with metric totals' },
        },
      },
      post: {
        tags: ['Organizations'],
        summary: 'Register a new organization',
        responses: { 201: { description: 'Organization registered' } },
      },
    },
    '/organizations/{id}': {
      get: {
        tags: ['Organizations'],
        summary: 'Get organization details with strict multi-tenant boundary',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Organization details' },
          403: { description: 'Forbidden: Cannot access another organization' },
        },
      },
    },
    '/beneficiaries': {
      get: {
        tags: ['Beneficiaries'],
        summary: 'List and filter beneficiaries with multi-tenant isolation',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search name, code, phone, email' },
          { name: 'education', in: 'query', schema: { type: 'string' } },
          { name: 'employment_status', in: 'query', schema: { type: 'string' } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'coordinator_id', in: 'query', schema: { type: 'string' } },
          { name: 'completed_assessment', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Filtered list of beneficiaries' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Beneficiaries'],
        summary: 'Register new beneficiary under organization',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Beneficiary registered' } },
      },
    },
    '/assessments': {
      post: {
        tags: ['AI Assessments'],
        summary: 'Submit career assessment and generate Scikit-Learn + Evon 30B recommendations',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['beneficiaryId'],
                properties: {
                  beneficiaryId: { type: 'string' },
                  education: { type: 'string' },
                  skills: { type: 'array', items: { type: 'string' } },
                  interests: { type: 'array', items: { type: 'string' } },
                  targetCareer: { type: 'string' },
                  language: { type: 'string', default: 'ta-IN' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Assessment completed with dominant domain, skill gaps, and Evon guidance' },
        },
      },
    },
    '/training/programmes': {
      get: {
        tags: ['Training Programmes'],
        summary: 'List organization training programmes',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Active training programmes' } },
      },
      post: {
        tags: ['Training Programmes'],
        summary: 'Create training programme',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Training programme created' } },
      },
    },
    '/training/enrollments': {
      post: {
        tags: ['Training Programmes'],
        summary: 'Enroll beneficiary into a training programme',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Beneficiary enrolled' } },
      },
    },
    '/analytics/dashboard': {
      get: {
        tags: ['Enterprise Analytics'],
        summary: 'Organization analytics dashboard KPIs calculated from live DB',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Real calculated KPIs: beneficiaries, training completion, skill distribution' },
        },
      },
    },
    '/stt/transcribe': {
      post: {
        tags: ['Voice & AI'],
        summary: 'Gnani Prisma v3.0 REST Audio Transcription',
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { audio: { type: 'string', format: 'binary' }, language: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Transcription text with language and confidence' } },
      },
    },
    '/tts/synthesize': {
      post: {
        tags: ['Voice & AI'],
        summary: 'Gnani Timbre v3.0 Text-to-Speech synthesis',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' }, language: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Binary WAV audio stream or web_speech instructions' } },
      },
    },
  },
};

export async function GET(req: NextRequest) {
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    // Render clean visual documentation
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LivelihoodSaathi AI - Enterprise API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .top-bar { background: #1e1b4b; color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .top-bar h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .badge { background: #10b981; color: white; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="top-bar">
    <h1>LivelihoodSaathi AI — Enterprise API Portal v2.0</h1>
    <span class="badge">OpenAPI 3.1</span>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/api/docs',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis],
    });
  </script>
</body>
</html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  return NextResponse.json(OPENAPI_SPEC);
}
