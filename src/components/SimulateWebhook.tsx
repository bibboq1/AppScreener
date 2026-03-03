import { useState, useEffect } from 'react'
import { supabase, type JobDescription } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function SimulateWebhook() {
  const [jobs, setJobs] = useState<JobDescription[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resumeText: '',
    primaryJobId: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    candidateId?: string
  } | null>(null)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('is_active', true)
      .order('title')

    if (!error && data) {
      setJobs(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert([{
          name: formData.name,
          email: formData.email,
          resume_text: formData.resumeText,
          primary_job_id: formData.primaryJobId,
          status: 'pending'
        }])
        .select()
        .single()

      if (candidateError) {
        throw new Error('Failed to create candidate')
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-candidate`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          resumeText: formData.resumeText,
          primaryJobId: formData.primaryJobId
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const analysisResult = await response.json()

      setResult({
        success: true,
        message: `Candidate analyzed successfully! Primary match score: ${analysisResult.primary_match.score}`,
        candidateId: candidate.id
      })

      setFormData({
        name: '',
        email: '',
        resumeText: '',
        primaryJobId: ''
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    setFormData({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      resumeText: `JANE SMITH
Senior Software Engineer

EXPERIENCE:
- Lead Software Engineer at TechCorp (2020-Present)
  • Led development of React-based enterprise applications
  • Implemented microservices architecture using Node.js and TypeScript
  • Managed team of 5 developers using Agile methodology
  • Reduced application load time by 40% through optimization

- Software Developer at StartupXYZ (2017-2020)
  • Built RESTful APIs using Python and Django
  • Designed and implemented PostgreSQL database schemas
  • Collaborated with UX team on responsive web applications
  • Deployed applications to AWS using Docker

EDUCATION:
- B.S. Computer Science, University of Technology (2017)

SKILLS:
- Languages: JavaScript, TypeScript, Python, Java
- Frameworks: React, Node.js, Django, Express
- Tools: Git, Docker, AWS, Jenkins, Jira
- Databases: PostgreSQL, MongoDB, Redis

CERTIFICATIONS:
- AWS Certified Solutions Architect
- Scrum Master Certification`,
      primaryJobId: jobs[0]?.id || ''
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Simulate Webhook</h2>
        <p className="text-slate-500 mt-1">Test the candidate analysis system with sample data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test Candidate Submission
          </CardTitle>
          <CardDescription>
            Upload a candidate resume and analyze against job descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadSampleData}
                disabled={jobs.length === 0}
              >
                Load Sample Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Candidate Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryJob">Primary Job Role</Label>
              <Select
                id="primaryJob"
                value={formData.primaryJobId}
                onChange={(e) => setFormData({ ...formData, primaryJobId: e.target.value })}
                required
              >
                <option value="">Select a job...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.department}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeText">Resume Text</Label>
              <Textarea
                id="resumeText"
                value={formData.resumeText}
                onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                placeholder="Paste the candidate's resume here..."
                rows={12}
                required
              />
            </div>

            {result && (
              <div
                className={`rounded-lg p-4 flex items-start gap-3 ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.candidateId && (
                    <p className="text-xs text-green-600 mt-2">
                      Candidate ID: {result.candidateId}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({ name: '', email: '', resumeText: '', primaryJobId: '' })
                  setResult(null)
                }}
              >
                Clear
              </Button>
              <Button type="submit" disabled={loading || jobs.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze Candidate
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">1</Badge>
              <span>Candidate data is submitted to the system (simulating a BambooHR webhook)</span>
            </li>
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">2</Badge>
              <span>The analysis API fetches all active job descriptions from the library</span>
            </li>
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">3</Badge>
              <span>AI analysis compares the resume against each job description</span>
            </li>
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">4</Badge>
              <span>Match scores and reasoning are stored in the database</span>
            </li>
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">5</Badge>
              <span>Results appear in the Candidate Inbox and Match Matrix views</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
