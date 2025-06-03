import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  TablePagination,
  InputAdornment,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Popover,
  Autocomplete,
  FormControl,
  Select,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { v4 as uuidv4 } from 'uuid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Default admin credentials (these would normally be in .env)
const DEFAULT_ADMIN = {
  email: 'admin@sagradago.com',
  password: 'admin123456'
};

// Define table structures
const TABLE_STRUCTURES = {
  booking_tbl: {
    fields: [
      'booking_sacrament',
      'booking_date',
      'booking_time',
      'booking_pax',
      'booking_transaction',
      'booking_status',
      'user_id'
    ],
    displayName: 'Bookings',
    requiredFields: ['booking_sacrament', 'booking_date', 'booking_time', 'booking_pax', 'booking_status', 'user_id']
  },
  document_tbl: {
    fields: [
      'document_firstname',
      'document_lastname',
      'document_middle',
      'document_gender',
      'document_bday',
      'document_mobile',
      'document_status',
      'document_baptismal',
      'document_confirmation',
      'document_wedding'
    ],
    displayName: 'Documents',
    requiredFields: ['document_firstname', 'document_lastname']
  },
  donation_tbl: {
    fields: [
      'donation_amount',
      'donation_intercession',
      'user_id'
    ],
    displayName: 'Donations',
    requiredFields: ['donation_amount']
  },
  employee_tbl: {
    fields: [
      'employee_email',
      'employee_firstname',
      'employee_lastname',
      'employee_mobile',
      'employee_bday',
      'employee_role'
    ],
    displayName: 'Employees',
    requiredFields: ['employee_email', 'employee_firstname', 'employee_lastname']
  },
  priest_tbl: {
    fields: [
      'priest_name',
      'priest_diocese',
      'priest_parish',
      'priest_availability'
    ],
    displayName: 'Priests',
    requiredFields: ['priest_name']
  },
  request_tbl: {
    fields: [
      'request_baptismcert',
      'request_confirmationcert',
      'user_id',
      'document_id'
    ],
    displayName: 'Requests',
    requiredFields: ['user_id']
  },
  user_tbl: {
    fields: [
      'user_firstname',
      'user_middle',
      'user_lastname',
      'user_gender',
      'user_status',
      'user_mobile',
      'user_bday',
      'user_email',
      'user_image'
    ],
    displayName: 'Users',
    requiredFields: ['user_email', 'user_firstname', 'user_lastname']
  }
};

const AdminDashboard = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openLogsDialog, setOpenLogsDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalDonations: 0,
    recentTransactions: []
  });
  const [transactionLogs, setTransactionLogs] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [openDeletedDialog, setOpenDeletedDialog] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [tableStats, setTableStats] = useState({});
  const [users, setUsers] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeFilters, setActiveFilters] = useState({});
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, logout, adminData } = useAdminAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading) {
        if (isAdmin || window.location.pathname.startsWith('/admin')) {
          await fetchTables();
          await fetchStats();
          await fetchUsers();
        } else {
          navigate('/admin/login', { replace: true });
        }
      }
    };
    checkAuth();
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('user_tbl')
        .select('*', { count: 'exact' });

      // Fetch total documents
      const { count: totalDocuments } = await supabase
        .from('document_tbl')
        .select('*', { count: 'exact' });

      // Fetch pending bookings
      const { count: pendingBookings } = await supabase
        .from('booking_tbl')
        .select('*', { count: 'exact' })
        .eq('booking_status', 'pending');

      // Fetch approved bookings
      const { count: approvedBookings } = await supabase
        .from('booking_tbl')
        .select('*', { count: 'exact' })
        .eq('booking_status', 'approved');

      // Fetch total donations
      const { count: totalDonations } = await supabase
        .from('donation_tbl')
        .select('*', { count: 'exact' });

      // Fetch recent transactions
      const { data: recentTransactions } = await supabase
        .from('transaction_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      setStats({
        totalUsers,
        totalDocuments,
        pendingBookings,
        approvedBookings,
        totalDonations,
        recentTransactions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTables = async () => {
    try {
      setTables(Object.keys(TABLE_STRUCTURES));
      setLoading(false);
    } catch (error) {
      setError('Error fetching tables: ' + error.message);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_tbl')
        .select('id, user_firstname, user_lastname, user_email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users: ' + error.message);
    }
  };

  const handleTableSelect = async (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      let query = supabase.from(tableName).select('*');
      
      // Apply default sorting based on table type
      if (tableName === 'booking_tbl') {
        query = query.order('booking_date', { ascending: false })
                    .order('booking_time', { ascending: false });
      } else if (tableName === 'document_tbl') {
        query = query.order('document_bday', { ascending: false });
      } else if (tableName === 'user_tbl') {
        query = query.order('user_bday', { ascending: false });
      } else if (tableName === 'employee_tbl') {
        query = query.order('employee_bday', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setTableData(data || []);
      setFilteredData(data || []);
      setSearchQuery('');
      
      // Set initial sort config based on table type
      if (tableName === 'booking_tbl') {
        setSortConfig({ key: 'booking_date', direction: 'desc' });
      } else if (tableName === 'document_tbl') {
        setSortConfig({ key: 'document_bday', direction: 'desc' });
      } else if (tableName === 'user_tbl') {
        setSortConfig({ key: 'user_bday', direction: 'desc' });
      } else if (tableName === 'employee_tbl') {
        setSortConfig({ key: 'employee_bday', direction: 'desc' });
      } else {
        setSortConfig({ key: null, direction: 'desc' });
      }
      
      setPage(0);
    } catch (error) {
      setError('Error fetching table data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const generateTransactionId = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `TRX-${timestamp}-${random}`;
  };

  const handleAdd = () => {
    if (selectedTable === 'booking_tbl') {
      const transactionId = generateTransactionId();
      setFormData({
        booking_status: 'pending',
        booking_transaction: transactionId
      });
    } else {
      setFormData({});
    }
    setEditingRecord(null);
    setOpenDialog(true);
  };

  const handleEdit = (record) => {
    setFormData(record);
    setEditingRecord(record.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        // Get the record to be deleted
        const recordToDelete = tableData.find(r => r.id === id);
        console.log('Record to delete:', recordToDelete);
        
        // Store in deleted_records table
        const { data: insertData, error: insertError } = await supabase
          .from('deleted_records')
          .insert({
            original_table: selectedTable,
            record_id: id,
            record_data: recordToDelete,
            deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
            deleted_by_email: adminData?.email || 'Unknown'
          })
          .select();

        if (insertError) {
          console.error('Error inserting into deleted_records:', {
            error: insertError,
            data: {
              original_table: selectedTable,
              record_id: id,
              record_data: recordToDelete,
              deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              deleted_by_email: adminData?.email || 'Unknown'
            }
          });
          throw insertError;
        }

        console.log('Successfully inserted into deleted_records:', insertData);

        // Log the deletion with admin info
        await supabase
          .from('transaction_logs')
          .insert({
            table_name: selectedTable,
            action: 'DELETE',
            record_id: id,
            old_data: recordToDelete,
            new_data: null,
            performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
            performed_by_email: adminData?.email || 'Unknown'
          });

        // Delete from original table
        const { error: deleteError } = await supabase
          .from(selectedTable)
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting from original table:', deleteError);
          throw deleteError;
        }

        setSuccess('Record moved to trash');
        handleTableSelect(selectedTable);
        fetchStats();
      } catch (error) {
        console.error('Error in handleDelete:', error);
        setError('Error deleting record: ' + error.message);
      }
    }
  };

  const handleViewDeleted = async () => {
    try {
      console.log('Fetching deleted records...');
      const { data, error } = await supabase
        .from('deleted_records')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error('Error fetching deleted records:', error);
        throw error;
      }

      console.log('Fetched deleted records:', data);
      setDeletedRecords(data || []);
      setOpenDeletedDialog(true);
    } catch (error) {
      console.error('Error in handleViewDeleted:', error);
      setError('Error fetching deleted records: ' + error.message);
    }
  };

  const handleRestore = async (record) => {
    try {
      console.log('Attempting to restore record:', record);
      
      // Get the record data from the record_data field
      let recordToRestore;
      try {
        // If record_data is a string, parse it
        if (typeof record.record_data === 'string') {
          recordToRestore = JSON.parse(record.record_data);
        } else {
          recordToRestore = record.record_data;
        }
      } catch (parseError) {
        console.error('Error parsing record_data:', parseError);
        throw new Error('Invalid record data format');
      }

      console.log('Parsed record data:', recordToRestore);
      
      // Remove any fields that shouldn't be in the insert
      delete recordToRestore.id; // Remove the old ID to let the database generate a new one
      
      // Ensure we have a valid object
      if (!recordToRestore || typeof recordToRestore !== 'object') {
        throw new Error('Invalid record data structure');
      }

      console.log('Record to restore:', recordToRestore);
      console.log('Target table:', record.original_table);

      // Insert the record back into its original table
      const { data: restoredData, error: restoreError } = await supabase
        .from(record.original_table)
        .insert([recordToRestore])
        .select();

      if (restoreError) {
        console.error('Error restoring record:', restoreError);
        throw restoreError;
      }

      console.log('Successfully restored record:', restoredData);

      // Delete from deleted_records
      const { error: deleteError } = await supabase
        .from('deleted_records')
        .delete()
        .eq('id', record.id);

      if (deleteError) {
        console.error('Error removing from deleted_records:', deleteError);
        throw deleteError;
      }

      // Log the restoration
      await supabase
        .from('transaction_logs')
        .insert({
          table_name: record.original_table,
          action: 'RESTORE',
          record_id: record.record_id,
          old_data: null,
          new_data: recordToRestore,
          performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
          performed_by_email: adminData?.email || 'Unknown'
        });

      setSuccess('Record restored successfully');
      handleViewDeleted();
      handleTableSelect(record.original_table);
      fetchStats();
    } catch (error) {
      console.error('Error in handleRestore:', error);
      setError('Error restoring record: ' + error.message);
    }
  };

  const handlePermanentDelete = async (record) => {
    if (window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('deleted_records')
          .delete()
          .eq('id', record.id);

        if (error) throw error;

        setSuccess('Record permanently deleted');
        handleViewDeleted();
      } catch (error) {
        setError('Error permanently deleting record: ' + error.message);
      }
    }
  };

  const handleSave = async () => {
    try {
      // Add password validation for user creation
      if (selectedTable === 'user_tbl' && !editingRecord) {
        if (formData.password !== formData.confirmPassword) {
          setError('Password and Confirm Password do not match');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
      }

      const requiredFields = TABLE_STRUCTURES[selectedTable].requiredFields;
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Booking conflict logic
      if (selectedTable === 'booking_tbl') {
        // Only check for conflicts on create or if date/time changed on edit
        const bookingDate = formData.booking_date;
        const bookingTime = formData.booking_time;
        if (bookingDate && bookingTime) {
          // Fetch approved bookings for the same date
          const { data: approvedBookings, error: conflictError } = await supabase
            .from('booking_tbl')
            .select('*')
            .eq('booking_date', bookingDate)
            .eq('booking_status', 'approved');
          if (conflictError) {
            setError('Error checking for booking conflicts.');
            return;
          }
          // Convert booking time to minutes
          const [h, m] = bookingTime.split(':');
          const bookingMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
          // Check for conflicts within 1 hour (60 minutes)
          const hasConflict = approvedBookings.some(b => {
            if (editingRecord && b.id === editingRecord) return false; // skip self when editing
            const [bh, bm] = (b.booking_time || '').split(':');
            if (!bh || !bm) return false;
            const bMinutes = parseInt(bh, 10) * 60 + parseInt(bm, 10);
            return Math.abs(bMinutes - bookingMinutes) < 60;
          });
          if (hasConflict) {
            setError('There is already an approved booking within 1 hour of the selected time. Please choose a different time.');
            return;
          }
        }
      }

      if (editingRecord) {
        // Handle updates
        console.log('Editing record:', editingRecord);
        console.log('Current form data:', formData);
        
        // Log the update
        const oldRecord = tableData.find(r => r.id === editingRecord);
        console.log('Found old record:', oldRecord);
        
        if (!oldRecord) {
          console.error('Could not find old record for ID:', editingRecord);
          setError('Error: Could not find the record to update');
          return;
        }

        // Update the record first
        const { error: updateError } = await supabase
          .from(selectedTable)
          .update(formData)
          .eq('id', editingRecord);

        if (updateError) {
          console.error('Error updating record:', updateError);
          throw updateError;
        }

        // Then log the transaction with admin info
        try {
          const { error: logError } = await supabase
            .from('transaction_logs')
            .insert({
              table_name: selectedTable,
              action: 'UPDATE',
              record_id: editingRecord,
              old_data: oldRecord,
              new_data: formData,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              performed_by_email: adminData?.email || 'Unknown'
            });
            
          if (logError) {
            console.error('Error logging transaction:', logError);
            throw logError;
          }
          console.log('Successfully logged transaction');
        } catch (logError) {
          console.error('Failed to log transaction:', logError);
          throw logError;
        }

        setSuccess('Record updated successfully');
      } else {
        // Handle new record creation
        if (selectedTable === 'user_tbl') {
          // Create new user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.user_email,
            password: formData.password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (authError) {
            console.error('Auth error:', authError);
            throw authError;
          }

          if (!authData?.user?.id) {
            throw new Error('No user ID returned from auth signup');
          }

          // Create user profile in user_tbl
          const userProfile = {
            id: authData.user.id,
            user_firstname: formData.user_firstname,
            user_middle: formData.user_middle || null,
            user_lastname: formData.user_lastname,
            user_gender: formData.user_gender,
            user_status: formData.user_status,
            user_mobile: formData.user_mobile,
            user_bday: formData.user_bday,
            user_email: formData.user_email,
          };

          console.log('Creating user profile:', userProfile);

          // Insert into user_tbl
          const { error: profileError } = await supabase
            .from('user_tbl')
            .insert([userProfile]);

          if (profileError) {
            console.error('Profile error:', profileError);
            // If profile creation fails, try to clean up the auth user
            try {
              await supabase.auth.admin.deleteUser(authData.user.id);
            } catch (deleteError) {
              console.error('Failed to clean up auth user:', deleteError);
            }
            throw profileError;
          }

          // Log the creation with admin info
          await supabase
            .from('transaction_logs')
            .insert({
              table_name: selectedTable,
              action: 'CREATE',
              record_id: authData.user.id,
              old_data: null,
              new_data: userProfile,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              performed_by_email: adminData?.email || 'Unknown'
            });

          setSuccess('User created successfully. Please check email for verification.');
        } else {
          // Handle other tables
          const { error: insertError } = await supabase
            .from(selectedTable)
            .insert([formData]);

          if (insertError) throw insertError;

          // Log the creation with admin info
          await supabase
            .from('transaction_logs')
            .insert({
              table_name: selectedTable,
              action: 'CREATE',
              record_id: formData.id,
              old_data: null,
              new_data: formData,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              performed_by_email: adminData?.email || 'Unknown'
            });

          setSuccess('Record added successfully');
        }
      }

      setOpenDialog(false);
      handleTableSelect(selectedTable);
      fetchStats();
    } catch (error) {
      console.error('Error in handleSave:', error);
      setError('Error saving record: ' + error.message);
    }
  };

  const handleViewLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transaction_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100); // Limit to last 100 logs for performance

      if (error) throw error;
      
      // Format the logs data for better display
      const formattedLogs = data.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp).toLocaleString(),
        changes: log.action === 'CREATE' ? log.new_data :
                log.action === 'UPDATE' ? {
                  old: log.old_data,
                  new: log.new_data
                } : log.old_data
      }));

      setTransactionLogs(formattedLogs);
      setOpenLogsDialog(true);
    } catch (error) {
      console.error('Error fetching transaction logs:', error);
      setError('Error fetching transaction logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const handleOpenDialog = (dialogType) => {
    setActiveDialog(dialogType);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
    setEditingRecord(null);
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev].slice(0, 5));
    }
    
    applyFilters();
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      
      // Handle date fields
      if (key.includes('date') || key.includes('bday') || key.includes('time')) {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'desc' ? dateB - dateA : dateA - dateB;
      }
      
      // Handle numeric fields
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return direction === 'desc' ? b[key] - a[key] : a[key] - b[key];
      }
      
      // Handle text fields
      const valueA = String(a[key]).toLowerCase();
      const valueB = String(b[key]).toLowerCase();
      return direction === 'desc' 
        ? valueB.localeCompare(valueA)
        : valueA.localeCompare(valueB);
    });

    setFilteredData(sortedData);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleColumnClick = (event) => {
    setColumnAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleColumnClose = () => {
    setColumnAnchorEl(null);
  };

  const handleColumnToggle = (field) => {
    setVisibleColumns(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleFilterChange = (field, value, type = 'contains') => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: { value, type }
    }));
    applyFilters();
  };

  const applyFilters = () => {
    let filtered = [...tableData];
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply active filters
    Object.entries(activeFilters).forEach(([field, { value, type }]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const cellValue = String(row[field]).toLowerCase();
          const filterValue = String(value).toLowerCase();
          
          switch (type) {
            case 'contains':
              return cellValue.includes(filterValue);
            case 'equals':
              return cellValue === filterValue;
            case 'starts':
              return cellValue.startsWith(filterValue);
            case 'ends':
              return cellValue.endsWith(filterValue);
            case 'greater':
              return Number(cellValue) > Number(filterValue);
            case 'less':
              return Number(cellValue) < Number(filterValue);
            case 'older_to_newer':
              return true; // Handled in sorting
            case 'newer_to_older':
              return true; // Handled in sorting
            default:
              return cellValue.includes(filterValue);
          }
        });
      }
    });

    // Apply sorting if active
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
        
        // Handle date fields
        if (sortConfig.key.includes('date') || sortConfig.key.includes('bday') || sortConfig.key.includes('time')) {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'desc' ? dateB - dateA : dateA - dateB;
        }
        
        // Handle numeric fields
        if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
          return sortConfig.direction === 'desc' ? b[sortConfig.key] - a[sortConfig.key] : a[sortConfig.key] - b[sortConfig.key];
        }
        
        // Handle text fields
        const valueA = String(a[sortConfig.key]).toLowerCase();
        const valueB = String(b[sortConfig.key]).toLowerCase();
        return sortConfig.direction === 'desc'
          ? valueB.localeCompare(valueA)
          : valueA.localeCompare(valueB);
      });
    }

    setFilteredData(filtered);
    calculateTableStats(filtered);
  };

  const calculateTableStats = (data) => {
    const stats = {};
    TABLE_STRUCTURES[selectedTable]?.fields.forEach(field => {
      if (typeof data[0]?.[field] === 'number') {
        stats[field] = {
          min: Math.min(...data.map(row => row[field])),
          max: Math.max(...data.map(row => row[field])),
          avg: data.reduce((sum, row) => sum + row[field], 0) / data.length
        };
      }
    });
    setTableStats(stats);
  };

  const exportToCSV = (data, filename) => {
    const headers = {
      transaction_logs: ['Timestamp', 'Table', 'Action', 'Record ID', 'Performed By', 'Performed By Email', 'Old Data', 'New Data'],
      deleted_records: ['Deleted At', 'Table', 'Record ID', 'Deleted By', 'Deleted By Email', 'Record Data']
    };

    const formatData = {
      transaction_logs: (log) => [
        new Date(log.timestamp).toLocaleString(),
        log.table_name,
        log.action,
        log.record_id,
        log.performed_by,
        log.performed_by_email,
        JSON.stringify(log.old_data),
        JSON.stringify(log.new_data)
      ],
      deleted_records: (record) => [
        new Date(record.deleted_at).toLocaleString(),
        record.original_table,
        record.record_id,
        record.deleted_by,
        record.deleted_by_email,
        JSON.stringify(record.record_data)
      ]
    };

    const csvContent = [
      headers[filename].join(','),
      ...data.map(formatData[filename]).map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin && !window.location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={handleViewLogs}
            sx={{ mr: 2 }}
          >
            View Logs
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteForeverIcon />}
            onClick={handleViewDeleted}
            sx={{ mr: 2 }}
          >
            View Trash
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/approved-calendar')}
            sx={{ mr: 2 }}
          >
            Approved Bookings Calendar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Documents
              </Typography>
              <Typography variant="h4">
                {stats.totalDocuments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Bookings
              </Typography>
              <Typography variant="h4">
                {stats.pendingBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Bookings
              </Typography>
              <Typography variant="h4">
                {stats.approvedBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Donations
              </Typography>
              <Typography variant="h4">
                {stats.totalDonations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300
          }}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2}>
        <Paper sx={{ p: 2, width: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Tables
          </Typography>
          {tables.map((table) => (
            <Button
              key={table}
              fullWidth
              variant={selectedTable === table ? 'contained' : 'text'}
              onClick={() => handleTableSelect(table)}
              sx={{ justifyContent: 'flex-start', mb: 1 }}
            >
              {TABLE_STRUCTURES[table]?.displayName || table}
            </Button>
          ))}
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : selectedTable ? (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {TABLE_STRUCTURES[selectedTable]?.displayName || selectedTable}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleFilterClick}
                    sx={{ mr: 1 }}
                  >
                    Filters
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ViewColumnIcon />}
                    onClick={handleColumnClick}
                    sx={{ mr: 1 }}
                  >
                    Columns
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SaveAltIcon />}
                    onClick={() => exportToCSV(filteredData, selectedTable)}
                    sx={{ mr: 1 }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                  >
                    Add New
                  </Button>
                </Box>
              </Box>

              {/* Table Statistics */}
              {Object.keys(tableStats).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Statistics</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(tableStats).map(([field, stats]) => (
                      <Grid item xs={12} sm={4} key={field}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                            <Typography variant="body2">
                              Min: {stats.min.toFixed(2)} | Max: {stats.max.toFixed(2)} | Avg: {stats.avg.toFixed(2)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Search with Autocomplete */}
              <Autocomplete
                freeSolo
                options={recentSearches}
                value={searchQuery}
                onChange={(event, newValue) => {
                  setSearchQuery(newValue);
                  applyFilters();
                }}
                onInputChange={(event, newValue) => {
                  setSearchQuery(newValue);
                  applyFilters();
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    placeholder="Search..."
                    sx={{ mb: 2 }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Active Filters Display */}
              {Object.entries(activeFilters).some(([_, filter]) => filter.value) && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(activeFilters).map(([field, { value, type }]) => (
                    value && (
                      <Chip
                        key={field}
                        label={`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value} (${type})`}
                        onDelete={() => {
                          setActiveFilters(prev => {
                            const newFilters = { ...prev };
                            delete newFilters[field];
                            return newFilters;
                          });
                          applyFilters();
                        }}
                        color="primary"
                        variant="outlined"
                      />
                    )
                  ))}
                </Box>
              )}

              {/* Filter Menu */}
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
                PaperProps={{
                  style: {
                    maxHeight: 400,
                    width: '300px',
                  },
                }}
              >
                {TABLE_STRUCTURES[selectedTable]?.fields.map((field) => (
                  <Box key={field} sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeFilters[field]?.value || ''}
                      onChange={(e) => handleFilterChange(field, e.target.value)}
                      placeholder="Filter value..."
                    />
                    <Box sx={{ mt: 1 }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={activeFilters[field]?.type || 'contains'}
                          onChange={(e) => handleFilterChange(field, activeFilters[field]?.value || '', e.target.value)}
                          size="small"
                        >
                          <MenuItem value="contains">Contains</MenuItem>
                          <MenuItem value="equals">Equals</MenuItem>
                          <MenuItem value="starts">Starts with</MenuItem>
                          <MenuItem value="ends">Ends with</MenuItem>
                          {(field.includes('date') || field.includes('bday') || field.includes('timestamp')) && (
                            <>
                              <MenuItem value="older_to_newer">Older to Newer</MenuItem>
                              <MenuItem value="newer_to_older">Newer to Older</MenuItem>
                            </>
                          )}
                          {typeof tableData[0]?.[field] === 'number' && (
                            <>
                              <MenuItem value="greater">Greater than</MenuItem>
                              <MenuItem value="less">Less than</MenuItem>
                            </>
                          )}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                ))}
              </Menu>

              {/* Column Visibility Menu */}
              <Menu
                anchorEl={columnAnchorEl}
                open={Boolean(columnAnchorEl)}
                onClose={handleColumnClose}
              >
                {TABLE_STRUCTURES[selectedTable]?.fields.map((field) => (
                  <MenuItem key={field}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns[field] !== false}
                          onChange={() => handleColumnToggle(field)}
                        />
                      }
                      label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  </MenuItem>
                ))}
              </Menu>

              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {TABLE_STRUCTURES[selectedTable]?.fields
                        .filter(field => visibleColumns[field] !== false)
                        .map((field) => (
                          <TableCell 
                            key={field}
                            onClick={() => handleSort(field)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                            }}
                          >
                            <Box display="flex" alignItems="center">
                              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              {sortConfig.key === field && (
                                <Box component="span" ml={1}>
                                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        ))}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={index}>
                          {TABLE_STRUCTURES[selectedTable]?.fields
                            .filter(field => visibleColumns[field] !== false)
                            .map((field) => (
                              <TableCell key={field}>
                                {formatValue(row[field])}
                              </TableCell>
                            ))}
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEdit(row)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDelete(row.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Select a table to view its data
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Deleted Records Dialog */}
      <Dialog 
        open={openDeletedDialog} 
        onClose={() => setOpenDeletedDialog(false)}
        maxWidth="md" 
        fullWidth
        keepMounted={false}
        disableEnforceFocus
      >
        <DialogTitle>Deleted Records</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="All" />
            {tables.map((table) => (
              <Tab key={table} label={TABLE_STRUCTURES[table]?.displayName || table} />
            ))}
          </Tabs>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Deleted At</TableCell>
                  <TableCell>Table</TableCell>
                  <TableCell>Record ID</TableCell>
                  <TableCell>Deleted By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deletedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No deleted records found
                    </TableCell>
                  </TableRow>
                ) : (
                  deletedRecords
                    .filter(record => activeTab === 0 || record.original_table === tables[activeTab - 1])
                    .map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.deleted_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.original_table}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.record_id}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{record.deleted_by}</div>
                          <div className="text-xs text-gray-400">{record.deleted_by_email}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRestore(record)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                            title="Restore record"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(record.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Permanently delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeletedDialog(false)}
            aria-label="Close dialog"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingRecord ? 'Edit Record' : 'Add New Record'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {selectedTable === 'user_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.user_firstname || ''}
                    onChange={(e) => setFormData({ ...formData, user_firstname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    value={formData.user_middle || ''}
                    onChange={(e) => setFormData({ ...formData, user_middle: e.target.value })}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.user_lastname || ''}
                    onChange={(e) => setFormData({ ...formData, user_lastname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.user_email || ''}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    value={formData.user_mobile || ''}
                    onChange={(e) => setFormData({ ...formData, user_mobile: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Birthday"
                    type="date"
                    value={formData.user_bday || ''}
                    onChange={(e) => setFormData({ ...formData, user_bday: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Gender"
                    value={formData.user_gender || ''}
                    onChange={(e) => setFormData({ ...formData, user_gender: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Gender</option>
                    <option value="m">Male</option>
                    <option value="f">Female</option>
                    <option value="rather not to tell">Rather not to tell</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={formData.user_status || ''}
                    onChange={(e) => setFormData({ ...formData, user_status: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widow">Widow</option>
                  </TextField>
                </Grid>
                {!editingRecord && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword || ''}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {selectedTable === 'booking_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="User"
                    value={formData.user_id || ''}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                    disabled={editingRecord}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.user_firstname} {user.user_lastname} ({user.user_email})
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Sacrament"
                    value={formData.booking_sacrament || ''}
                    onChange={(e) => setFormData({ ...formData, booking_sacrament: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                    disabled={editingRecord}
                  >
                    <option value="">Select Sacrament</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Baptism">Baptism</option>
                    <option value="Confession">Confession</option>
                    <option value="Anointing of the Sick">Anointing of the Sick</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.booking_date || ''}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    disabled={editingRecord}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={formData.booking_time || ''}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    disabled={editingRecord}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of People"
                    type="number"
                    value={formData.booking_pax || ''}
                    onChange={(e) => setFormData({ ...formData, booking_pax: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    disabled={editingRecord}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={formData.booking_status || (editingRecord ? '' : 'pending')}
                    onChange={(e) => setFormData({ ...formData, booking_status: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Transaction ID"
                    value={formData.booking_transaction || ''}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    disabled
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#000000',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {selectedTable === 'document_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.document_firstname || ''}
                    onChange={(e) => setFormData({ ...formData, document_firstname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    value={formData.document_middle || ''}
                    onChange={(e) => setFormData({ ...formData, document_middle: e.target.value })}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.document_lastname || ''}
                    onChange={(e) => setFormData({ ...formData, document_lastname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Gender"
                    value={formData.document_gender || ''}
                    onChange={(e) => setFormData({ ...formData, document_gender: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Gender</option>
                    <option value="m">Male</option>
                    <option value="f">Female</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Birthday"
                    type="date"
                    value={formData.document_bday || ''}
                    onChange={(e) => setFormData({ ...formData, document_bday: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    value={formData.document_mobile || ''}
                    onChange={(e) => setFormData({ ...formData, document_mobile: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={formData.document_status || ''}
                    onChange={(e) => setFormData({ ...formData, document_status: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Baptismal Certificate"
                    value={formData.document_baptismal || ''}
                    onChange={(e) => setFormData({ ...formData, document_baptismal: e.target.value })}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Status</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Confirmation Certificate"
                    value={formData.document_confirmation || ''}
                    onChange={(e) => setFormData({ ...formData, document_confirmation: e.target.value })}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Status</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Wedding Certificate"
                    value={formData.document_wedding || ''}
                    onChange={(e) => setFormData({ ...formData, document_wedding: e.target.value })}
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Status</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {selectedTable === 'donation_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.donation_amount || ''}
                    onChange={(e) => setFormData({ ...formData, donation_amount: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Intercession"
                    value={formData.donation_intercession || ''}
                    onChange={(e) => setFormData({ ...formData, donation_intercession: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            {selectedTable === 'employee_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.employee_email || ''}
                    onChange={(e) => setFormData({ ...formData, employee_email: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.employee_firstname || ''}
                    onChange={(e) => setFormData({ ...formData, employee_firstname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.employee_lastname || ''}
                    onChange={(e) => setFormData({ ...formData, employee_lastname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    value={formData.employee_mobile || ''}
                    onChange={(e) => setFormData({ ...formData, employee_mobile: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Birthday"
                    type="date"
                    value={formData.employee_bday || ''}
                    onChange={(e) => setFormData({ ...formData, employee_bday: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    value={formData.employee_role || ''}
                    onChange={(e) => setFormData({ ...formData, employee_role: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {selectedTable === 'priest_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.priest_name || ''}
                    onChange={(e) => setFormData({ ...formData, priest_name: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diocese"
                    value={formData.priest_diocese || ''}
                    onChange={(e) => setFormData({ ...formData, priest_diocese: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parish"
                    value={formData.priest_parish || ''}
                    onChange={(e) => setFormData({ ...formData, priest_parish: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Availability"
                    value={formData.priest_availability || ''}
                    onChange={(e) => setFormData({ ...formData, priest_availability: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Availability</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {selectedTable === 'request_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Baptism Certificate"
                    value={formData.request_baptismcert || ''}
                    onChange={(e) => setFormData({ ...formData, request_baptismcert: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Confirmation Certificate"
                    value={formData.request_confirmationcert || ''}
                    onChange={(e) => setFormData({ ...formData, request_confirmationcert: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </TextField>
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            aria-label="Save changes"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Logs Dialog */}
      <Dialog 
        open={openLogsDialog} 
        onClose={() => setOpenLogsDialog(false)} 
        maxWidth="md" 
        fullWidth
        keepMounted={false}
        disableEnforceFocus
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Transaction Logs</Typography>
            <Button
              variant="outlined"
              startIcon={<SaveAltIcon />}
              onClick={() => exportToCSV(transactionLogs, 'transaction_logs')}
            >
              Export Logs
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Table</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Record ID</TableCell>
                    <TableCell>Performed By</TableCell>
                    <TableCell>Changes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No transaction logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactionLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>{TABLE_STRUCTURES[log.table_name]?.displayName || log.table_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            color={
                              log.action === 'CREATE' ? 'success' :
                              log.action === 'UPDATE' ? 'primary' :
                              log.action === 'DELETE' ? 'error' :
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.record_id}</TableCell>
                        <TableCell>
                          <div>{log.performed_by}</div>
                          <div className="text-xs text-gray-400">{log.performed_by_email}</div>
                        </TableCell>
                        <TableCell>
                          <pre style={{ maxHeight: '100px', overflow: 'auto' }}>
                            {log.action === 'CREATE' ? (
                              <span className="text-green-600">+ {JSON.stringify(log.new_data, null, 2)}</span>
                            ) : log.action === 'UPDATE' ? (
                              <>
                                <span className="text-red-600">- {JSON.stringify(log.old_data, null, 2)}</span>
                                <br />
                                <span className="text-green-600">+ {JSON.stringify(log.new_data, null, 2)}</span>
                              </>
                            ) : (
                              <span className="text-red-600">- {JSON.stringify(log.old_data, null, 2)}</span>
                            )}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenLogsDialog(false)}
            aria-label="Close logs"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
