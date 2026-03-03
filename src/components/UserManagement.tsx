import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserPlus, Mail, Shield, ShieldCheck, User as UserIcon, AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'recruiter' | 'hiring_manager'
  is_active: boolean
  created_at: string
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  created_at: string
  expires_at: string
}

export function UserManagement() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'recruiter' | 'hiring_manager'>('hiring_manager')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
    loadInvitations()
  }, [])

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
  }

  const loadInvitations = async () => {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setInvitations(data)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const invitationToken = crypto.randomUUID()

    const { error } = await supabase
      .from('user_invitations')
      .insert([{
        email: inviteEmail,
        role: inviteRole,
        invited_by: profile?.id,
        invitation_token: invitationToken
      }])

    if (error) {
      setError(error.message)
    } else {
      await loadInvitations()
      setIsInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('hiring_manager')
    }

    setLoading(false)
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await supabase
      .from('user_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    await loadUsers()
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)

    await loadUsers()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4" />
      case 'recruiter':
        return <Shield className="h-4 w-4" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900">Access Denied</h3>
              <p className="text-slate-500 mt-2">
                Only administrators can access user management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">User Management</h2>
          <p className="text-slate-500 mt-1">Manage users and invite new team members</p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {invitations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {user.id !== profile?.id && (
                      <>
                        <Select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="inline-flex w-auto"
                        >
                          <option value="admin">Admin</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="hiring_manager">Hiring Manager</option>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>Users who have been invited but not yet registered</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {invitation.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{invitation.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent onClose={() => setIsInviteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user to join your team
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <Select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
              >
                <option value="hiring_manager">Hiring Manager</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </Select>
              <p className="text-xs text-slate-500">
                {inviteRole === 'admin' && 'Full access to all features and settings'}
                {inviteRole === 'recruiter' && 'Can manage jobs, candidates, and view analytics'}
                {inviteRole === 'hiring_manager' && 'Can view candidates and job matches'}
              </p>
            </div>

            {error && (
              <div className="rounded-lg p-3 bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
