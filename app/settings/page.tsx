"use client"

import { useState } from "react"
import { Loader2, User, Shield } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { getInitials } from "@/lib/utils"

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    university: profile?.university ?? "",
    department: profile?.department ?? "",
  })
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        university: form.university,
        department: form.department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      toast.error("Failed to update profile")
    } else {
      toast.success("Profile updated!")
      await refreshProfile()
    }
    setLoading(false)
  }

  const handleChangePassword = async () => {
    if (!user?.email) return
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) {
      toast.error("Failed to send reset email")
    } else {
      toast.success("Password reset email sent!")
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Profile</CardTitle>
            </div>
            <CardDescription>Update your personal and company information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-14 w-14">
                <AvatarImage src={profile?.avatar_url ?? ""} />
                <AvatarFallback className="text-sm bg-slate-100 text-slate-600">
                  {getInitials(profile?.full_name ?? user?.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-900">{profile?.full_name ?? "No name set"}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Alex Johnson"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="university">Company</Label>
                <Input
                  id="university"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Role / Title</Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Head of Growth, VP Sales, Founder..."
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#1E3A5F] hover:bg-[#16304f] text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Security</CardTitle>
            </div>
            <CardDescription>Manage your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input value={user?.email ?? ""} disabled className="bg-slate-50" />
              <p className="text-xs text-slate-400">Email cannot be changed.</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Password</p>
                <p className="text-xs text-slate-500">Send a password reset link to your email.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleChangePassword} className="border-slate-200">
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Delete Account</p>
                <p className="text-xs text-slate-500">Permanently delete your account and all data.</p>
              </div>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
