import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PersonIcon from '@mui/icons-material/Person';
import { keyframes } from '@mui/system';

// Subtle shimmer animation for the gold accents
const shimmer = keyframes`
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
`;

const NavBar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(to right, #1B3D6D, #234B87)',
        borderBottom: '2px solid',
        borderImage: 'linear-gradient(to right, #C5A572, #E6C992, #C5A572) 1',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(197, 165, 114, 0.5), transparent)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Box 
            component={Link} 
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              textDecoration: 'none',
              color: 'inherit',
              position: 'relative',
              '&:hover .icon': {
                transform: 'rotate(-5deg)',
              },
              '&:hover .title': {
                textShadow: '0 0 8px rgba(197, 165, 114, 0.5)',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  right: -8,
                  bottom: -8,
                  background: 'radial-gradient(circle, rgba(197, 165, 114, 0.15), transparent)',
                  borderRadius: '50%',
                  animation: `${shimmer} 3s infinite ease-in-out`,
                },
              }}
            >
              <AutoStoriesIcon 
                className="icon"
                sx={{ 
                  color: '#C5A572',
                  fontSize: { xs: 32, sm: 36 },
                  transition: 'transform 0.3s ease',
                  filter: 'drop-shadow(0 0 4px rgba(197, 165, 114, 0.3))',
                }} 
              />
            </Box>
            <Box>
              <Typography
                className="title"
                variant="h5"
                sx={{
                  fontFamily: '"Lora", serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: '#fff',
                  letterSpacing: '0.03em',
                  transition: 'text-shadow 0.3s ease',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  mb: 0.5,
                }}
              >
                Alexandria's Journal
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: '#C5A572',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 0.9,
                }}
              >
                Wisdom Through Reflection
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {isAuthenticated ? (
              <>
                {!isMobile && (
                  <>
                    <Button
                      component={Link}
                      to="/"
                      sx={{
                        color: '#fff',
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(197, 165, 114, 0.1)',
                        },
                        '&.active': {
                          borderBottom: '2px solid #C5A572',
                        },
                      }}
                    >
                      Daily Question
                    </Button>
                    <Button
                      component={Link}
                      to="/ask"
                      sx={{
                        color: '#fff',
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(197, 165, 114, 0.1)',
                        },
                        '&.active': {
                          borderBottom: '2px solid #C5A572',
                        },
                      }}
                    >
                      Ask a Question
                    </Button>
                  </>
                )}
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    border: '1px solid rgba(197, 165, 114, 0.3)',
                    padding: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(197, 165, 114, 0.1)',
                      border: '1px solid rgba(197, 165, 114, 0.5)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'transparent',
                      color: '#C5A572',
                      width: 32,
                      height: 32,
                    }}
                  >
                    {user?.full_name?.[0] || user?.email?.[0] || <PersonIcon />}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      background: 'linear-gradient(145deg, #1B3D6D, #234B87)',
                      border: '1px solid rgba(197, 165, 114, 0.3)',
                      '& .MuiMenuItem-root': {
                        color: '#fff',
                        fontSize: '0.9rem',
                        py: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(197, 165, 114, 0.1)',
                        },
                      },
                      '& .MuiDivider-root': {
                        borderColor: 'rgba(197, 165, 114, 0.2)',
                      },
                    },
                  }}
                >
                  <MenuItem disabled sx={{ opacity: 0.7 }}>
                    {user?.full_name || user?.email}
                  </MenuItem>
                  <Divider />
                  {isMobile && (
                    <>
                      <MenuItem component={Link} to="/" onClick={handleClose}>
                        Daily Question
                      </MenuItem>
                      <MenuItem component={Link} to="/ask" onClick={handleClose}>
                        Ask a Question
                      </MenuItem>
                      <Divider />
                    </>
                  )}
                  <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/settings" onClick={handleClose}>
                    Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: '#C5A572 !important' }}>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    color: '#fff',
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(197, 165, 114, 0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  sx={{
                    color: '#C5A572',
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    border: '1px solid rgba(197, 165, 114, 0.5)',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(197, 165, 114, 0.1)',
                      borderColor: '#C5A572',
                    },
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
