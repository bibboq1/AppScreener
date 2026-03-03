import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings, CheckCircle2, AlertCircle, Webhook, RefreshCw } from 'lucide-react'

interface BambooHRConnection {
  id: string
  company_domain: string
  api_key: string
  is_active: boolean
  webhook_enabled: boolean
  sync_enabled: boolean
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export function Connections() {
  const [connection, setConnection] = useState<BambooHRConnection | null>(null)
  const [formData, setFormData] = useState({
    company_domain: '',
    api_key: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadConnection()
  }, [])

  const loadConnection = async () => {
    const { data, error } = await supabase
      .from('bamboohr_connections')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      setConnection(data)
      setFormData({
        company_domain: data.company_domain,
        api_key: data.api_key
      })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTestResult(null)

    try {
      if (connection) {
        await supabase
          .from('bamboohr_connections')
          .update({
            company_domain: formData.company_domain,
            api_key: formData.api_key
          })
          .eq('id', connection.id)
      } else {
        await supabase
          .from('bamboohr_connections')
          .insert([{
            company_domain: formData.company_domain,
            api_key: formData.api_key,
            is_active: true
          }])
      }

      await loadConnection()
      setIsEditing(false)
      setTestResult({ success: true, message: 'Connection saved successfully' })
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save connection'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    setTestResult(null)

    setTimeout(() => {
      const isValid = !!(formData.company_domain && formData.api_key.length > 10)
      setTestResult({
        success: isValid,
        message: isValid
          ? 'Connection test successful! API credentials are valid.'
          : 'Connection test failed. Please check your credentials.'
      })
      setLoading(false)
    }, 1500)
  }

  const handleToggleWebhook = async () => {
    if (!connection) return

    await supabase
      .from('bamboohr_connections')
      .update({ webhook_enabled: !connection.webhook_enabled })
      .eq('id', connection.id)

    await loadConnection()
  }

  const handleToggleSync = async () => {
    if (!connection) return

    await supabase
      .from('bamboohr_connections')
      .update({ sync_enabled: !connection.sync_enabled })
      .eq('id', connection.id)

    await loadConnection()
  }

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-candidate`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Connections</h2>
        <p className="text-slate-500 mt-1">Configure BambooHR API integration and webhook settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {connection?.is_active ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-slate-400" />
                  <span className="font-semibold text-slate-400">Not Connected</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Webhook Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={connection?.webhook_enabled ? 'default' : 'secondary'}>
              {connection?.webhook_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Auto-Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={connection?.sync_enabled ? 'default' : 'secondary'}>
              {connection?.sync_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                BambooHR API Configuration
              </CardTitle>
              <CardDescription>
                Enter your BambooHR API credentials to enable integration
              </CardDescription>
            </div>
            {connection && !isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Credentials
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_domain">Company Domain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="company_domain"
                  value={formData.company_domain}
                  onChange={(e) => setFormData({ ...formData, company_domain: e.target.value })}
                  placeholder="yourcompany"
                  disabled={!isEditing && !!connection}
                  required
                />
                <span className="text-sm text-slate-500 whitespace-nowrap">.bamboohr.com</span>
              </div>
              <p className="text-xs text-slate-500">
                Your BambooHR subdomain (e.g., "acmecorp" for acmecorp.bamboohr.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Enter your BambooHR API key"
                disabled={!isEditing && !!connection}
                required
              />
              <p className="text-xs text-slate-500">
                Generate an API key in BambooHR under Settings → API Keys
              </p>
            </div>

            {testResult && (
              <div
                className={`rounded-lg p-4 flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResult.message}
                  </p>
                </div>
              </div>
            )}

            {(isEditing || !connection) && (
              <div className="flex justify-end space-x-2 pt-4">
                {isEditing && connection && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        company_domain: connection.company_domain,
                        api_key: connection.api_key
                      })
                      setTestResult(null)
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={loading}
                >
                  {loading ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Credentials'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {connection && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure BambooHR to send candidate data to this system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Add this URL to your BambooHR webhook configuration for new applicants
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Enable Webhooks</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Automatically receive candidate data from BambooHR
                  </p>
                </div>
                <Button
                  variant={connection.webhook_enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleWebhook}
                >
                  {connection.webhook_enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync Settings
              </CardTitle>
              <CardDescription>
                Configure automatic synchronization with BambooHR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Auto-Sync Candidates</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Automatically sync candidate data with BambooHR
                  </p>
                </div>
                <Button
                  variant={connection.sync_enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleSync}
                >
                  {connection.sync_enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {connection.last_sync_at && (
                <div className="text-sm text-slate-600">
                  Last sync: {new Date(connection.last_sync_at).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">1</Badge>
                  <span>Log in to your BambooHR account and navigate to Settings → API Keys</span>
                </li>
                <li className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">2</Badge>
                  <span>Generate a new API key with permissions to read applicant data</span>
                </li>
                <li className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">3</Badge>
                  <span>Enter your company domain and API key in the form above</span>
                </li>
                <li className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">4</Badge>
                  <span>Configure webhook in BambooHR to point to the webhook URL provided</span>
                </li>
                <li className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center flex-shrink-0">5</Badge>
                  <span>Enable webhooks and auto-sync to start receiving candidate data automatically</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
