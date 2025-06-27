import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { User } from '../types';
import { authAPI } from '../services/api';

interface UserManagementProps {
  onError: (message: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onError }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers({ limit: 100 });
      setUsers(response.data.users);
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await authAPI.updateUserRole(userId, role);
      fetchUsers();
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authAPI.deleteUser(userId);
        fetchUsers();
      } catch (err: any) {
        onError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await authAPI.getUsers({ limit: 1000 });
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email,Role,Joined\n" +
        response.data.users.map((user: User) => 
          `${user.name},${user.email},${user.role},${user.lastLogin || ''}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `users-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to export users');
    }
  };

  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'admin' ? 'secondary' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Joined', 
      width: 120,
      renderCell: (params) => formatDate(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
            <Select
              value={params.row.role}
              onChange={(e) => handleUpdateUserRole(params.row._id, e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <IconButton
            onClick={() => handleDeleteUser(params.row._id)}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">User Management</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportUsers}
        >
          Export Users
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 }
            }
          }}
          pageSizeOptions={[25, 50, 100]}
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default UserManagement;
