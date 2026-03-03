import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Upload, Trash2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react'

interface CompanySettings {
  id: string
  company_name: string
  logo_url: string | null
  updated_at: string
}

export function CompanySettings() {
  const { profile } = useAuth()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (data) {
      setSettings(data)
      setCompanyName(data.company_name || '')
      setLogoPreview(data.logo_url)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB')
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `company-logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      if (settings?.logo_url) {
        const oldPath = settings.logo_url.split('/').pop()
        if (oldPath && oldPath.startsWith('company-logo-')) {
          await supabase.storage
            .from('public')
            .remove([`logos/${oldPath}`])
        }
      }

      await handleSave(publicUrl)
      setLogoFile(null)
      setSuccess('Logo uploaded successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!settings?.logo_url) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const oldPath = settings.logo_url.split('/').pop()
      if (oldPath && oldPath.startsWith('company-logo-')) {
        await supabase.storage
          .from('public')
          .remove([`logos/${oldPath}`])
      }

      await handleSave(null)
      setLogoPreview(null)
      setSuccess('Logo removed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove logo')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (logoUrl: string | null = settings?.logo_url || null) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (settings) {
        const { error } = await supabase
          .from('company_settings')
          .update({
            company_name: companyName,
            logo_url: logoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert({
            company_name: companyName,
            logo_url: logoUrl
          })

        if (error) throw error
      }

      await loadSettings()
      if (!logoUrl) {
        setSuccess('Settings saved successfully!')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-violet)] bg-opacity-10 mb-4">
                <AlertCircle className="h-8 w-8 text-[var(--accent-violet)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Access Denied</h3>
              <p className="text-[var(--text-secondary)] mt-2">
                Only administrators can manage company settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Company Settings</h2>
        <p className="text-[var(--text-secondary)] mt-1">Customize your company branding</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--accent-violet)]" />
            Company Information
          </CardTitle>
          <CardDescription>
            Update your company name and logo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Your Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <Label>Company Logo</Label>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {logoPreview && (
                <div className="w-32 h-32 rounded-[var(--radius-lg)] border-2 border-[var(--border-subtle)] surface-2 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading || loading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                      disabled={uploading || loading}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </label>

                  {logoFile && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadLogo}
                      disabled={uploading || loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  )}

                  {settings?.logo_url && !logoFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={uploading || loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Logo
                    </Button>
                  )}
                </div>

                <p className="text-xs text-[var(--text-muted)]">
                  Recommended: PNG or SVG, max 2MB. Square format works best (e.g., 200x200px).
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-[var(--radius-md)] p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-30 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[var(--error)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-[var(--radius-md)] p-3 bg-[var(--success)] bg-opacity-10 border border-[var(--success)] border-opacity-30 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--success)]">{success}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => handleSave()}
              disabled={loading || uploading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
