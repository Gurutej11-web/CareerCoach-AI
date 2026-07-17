import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/dashboard/Sidebar';
import ActiveSessions from '../components/profile/ActiveSessions';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { exportUserData } from '../services/profileService';
import { useNotification } from '../contexts/NotificationContext';

// API base URL
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;

interface UserProfileData {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  profile: {
    bio: string;
    location: string;
    profile_picture: string;
    job_title: string;
    company: string;
    skills: string;
    phone_number: string;
    career_goal: string;
    target_role: string;
    leaderboard_opt_in: boolean;
    portfolio_public: boolean;
    portfolio_slug: string | null;
    notify_achievement_alerts: boolean;
    notify_streak_reminders: boolean;
    notify_progress_digest: boolean;
  };
}

const Profile: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { notify } = useNotification();
  const [exporting, setExporting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: '',
    location: '',
    job_title: '',
    company: '',
    skills: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    career_goal: '',
    target_role: '',
    portfolio_slug: '',
  });
  const [preferences, setPreferences] = useState({
    leaderboard_opt_in: false,
    portfolio_public: false,
    notify_achievement_alerts: true,
    notify_streak_reminders: true,
    notify_progress_digest: true,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfileData(response.data);
        // Initialize form data with profile data
        setFormData({
          username: response.data.user.username || '',
          email: response.data.user.email || '',
          first_name: response.data.user.first_name || '',
          last_name: response.data.user.last_name || '',
          phone_number: response.data.profile.phone_number || '',
          bio: response.data.profile.bio || '',
          location: response.data.profile.location || '',
          job_title: response.data.profile.job_title || '',
          company: response.data.profile.company || '',
          skills: response.data.profile.skills || '',
          current_password: '',
          new_password: '',
          confirm_password: '',
          career_goal: response.data.profile.career_goal || '',
          target_role: response.data.profile.target_role || '',
          portfolio_slug: response.data.profile.portfolio_slug || '',
        });
        setPreferences({
          leaderboard_opt_in: response.data.profile.leaderboard_opt_in || false,
          portfolio_public: response.data.profile.portfolio_public || false,
          notify_achievement_alerts: response.data.profile.notify_achievement_alerts ?? true,
          notify_streak_reminders: response.data.profile.notify_streak_reminders ?? true,
          notify_progress_digest: response.data.profile.notify_progress_digest ?? true,
        });
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        notify('Failed to load profile data. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      
      // Update profile information
      await axios.put(
        `${API_BASE_URL}/profile/`,
        {
          user: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
          },
          profile: {
            bio: formData.bio,
            location: formData.location,
            job_title: formData.job_title,
            company: formData.company,
            skills: formData.skills,
            phone_number: formData.phone_number,
            career_goal: formData.career_goal,
            target_role: formData.target_role,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      notify('Profile updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      notify('Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${API_BASE_URL}/profile/`,
        {
          profile: {
            ...preferences,
            portfolio_slug: preferences.portfolio_public ? (formData.portfolio_slug || undefined) : formData.portfolio_slug,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notify('Preferences updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      notify(err.response?.data?.portfolio_slug?.[0] || 'Failed to update preferences. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      await exportUserData();
      notify('Your data export has started downloading.', 'success');
    } catch (err) {
      console.error('Error exporting data:', err);
      notify('Failed to export your data. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      notify('New passwords do not match', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      
      // Change password
      await axios.post(
        `${API_BASE_URL}/change-password/`,
        {
          current_password: formData.current_password,
          new_password: formData.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear password fields
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      notify('Password changed successfully', 'success');
    } catch (err: any) {
      console.error('Error changing password:', err);
      notify('Failed to change password. Please check your current password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE_URL}/delete-account/`,
        { password: deletePassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteDialogOpen(false);
      logout();
      navigate('/');
    } catch (err: any) {
      notify(err.response?.data?.error || 'Failed to delete account. Please check your password and try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashboardHeader onToggleSidebar={handleDrawerToggle} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Sidebar for larger screens */}
        <Box
          component="nav"
          sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
          aria-label="mailbox folders"
        >
          {/* Mobile sidebar */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 280,
              },
            }}
          >
            <Sidebar />
          </Drawer>
          
          {/* Desktop sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 280,
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              },
            }}
            open
          >
            <Sidebar />
          </Drawer>
        </Box>
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - 280px)` },
          }}
        >
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={profileData?.profile?.profile_picture || "/default-avatar.png"}
                  sx={{ width: 100, height: 100, mr: 3 }}
                />
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {loading ? 'Loading...' : `${formData.first_name} ${formData.last_name}`}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {formData.username}
                  </Typography>
                </Box>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <form onSubmit={handleProfileUpdate}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          name="bio"
                          multiline
                          rows={3}
                          value={formData.bio}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          name="job_title"
                          value={formData.job_title}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Skills"
                          name="skills"
                          multiline
                          rows={3}
                          value={formData.skills}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Target Role"
                          name="target_role"
                          placeholder="e.g. Senior Software Engineer"
                          value={formData.target_role}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Career Goal"
                          name="career_goal"
                          multiline
                          rows={2}
                          placeholder="What are you working toward?"
                          value={formData.career_goal}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          disabled={saving}
                        >
                          {saving ? <CircularProgress size={24} /> : "Save Changes"}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>

                  <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <form onSubmit={handlePasswordChange}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          name="current_password"
                          type="password"
                          value={formData.current_password}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="new_password"
                          type="password"
                          value={formData.new_password}
                          onChange={handleChange}
                          required
                        />
                        <PasswordStrengthMeter password={formData.new_password} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirm_password"
                          type="password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          disabled={saving}
                        >
                          {saving ? <CircularProgress size={24} /> : "Change Password"}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>

                  <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
                    Preferences
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <FormGroup sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.leaderboard_opt_in}
                          onChange={(e) => setPreferences({ ...preferences, leaderboard_opt_in: e.target.checked })}
                        />
                      }
                      label="Appear on the anonymized mock-interview leaderboard"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notify_achievement_alerts}
                          onChange={(e) => setPreferences({ ...preferences, notify_achievement_alerts: e.target.checked })}
                        />
                      }
                      label="Notify me about new achievements"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notify_streak_reminders}
                          onChange={(e) => setPreferences({ ...preferences, notify_streak_reminders: e.target.checked })}
                        />
                      }
                      label="Notify me about streaks"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notify_progress_digest}
                          onChange={(e) => setPreferences({ ...preferences, notify_progress_digest: e.target.checked })}
                        />
                      }
                      label="Notify me with progress digest summaries"
                    />
                  </FormGroup>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.portfolio_public}
                        onChange={(e) => setPreferences({ ...preferences, portfolio_public: e.target.checked })}
                      />
                    }
                    label="Make my portfolio page public"
                  />
                  {preferences.portfolio_public && (
                    <TextField
                      fullWidth
                      label="Portfolio URL slug"
                      name="portfolio_slug"
                      placeholder="e.g. jane-doe"
                      value={formData.portfolio_slug}
                      onChange={handleChange}
                      helperText={
                        formData.portfolio_slug
                          ? `Your portfolio will be visible at ${window.location.origin}/portfolio/${formData.portfolio_slug}`
                          : 'Choose a URL slug to publish your portfolio'
                      }
                      sx={{ mt: 1, mb: 2 }}
                    />
                  )}

                  <Box>
                    <Button
                      variant="contained"
                      onClick={handlePreferencesUpdate}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Save Preferences'}
                    </Button>
                  </Box>

                  <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
                    Your Data
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Download a copy of everything tied to your account — resumes, analyses, mock
                    interviews, chat history, and activity log — as a single JSON file.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleExportData}
                    disabled={exporting}
                  >
                    {exporting ? <CircularProgress size={24} /> : 'Export my data'}
                  </Button>

                  <ActiveSessions />

                  <Typography variant="h5" gutterBottom sx={{ mt: 6, color: 'error.main' }}>
                    Danger Zone
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Permanently delete your account and all associated data — resumes, analyses, mock
                    interviews, chat history, and activity log. This cannot be undone.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete my account
                  </Button>
                </>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This permanently deletes your account and everything tied to it. This action cannot be
            undone. Enter your password to confirm.
          </DialogContentText>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleting || !deletePassword}
          >
            {deleting ? <CircularProgress size={24} /> : 'Permanently delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 