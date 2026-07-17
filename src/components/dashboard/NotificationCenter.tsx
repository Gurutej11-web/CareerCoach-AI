import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { formatDistanceToNow } from 'date-fns';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  AppNotification,
} from '../../services/notificationService';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const refresh = () => {
    getNotifications().then(setNotifications);
  };

  useEffect(() => {
    refresh();
    // Poll periodically so a new achievement/streak notification shows up
    // without requiring a full page reload.
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      refresh();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    refresh();
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpen} aria-label="Open notifications">
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, maxHeight: 420 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">You're all caught up.</Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 15).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                bgcolor: notification.is_read ? 'transparent' : 'action.hover',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="bold">{notification.title}</Typography>
                <Typography variant="body2" color="text.secondary">{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
