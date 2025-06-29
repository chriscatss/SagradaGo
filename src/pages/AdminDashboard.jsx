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
  Autocomplete,
  FormControl,
  Select,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { ChurchOutlined, DisplaySettings, TableChart } from '@mui/icons-material';
import { applyFilters } from '../utils/admin-functions/applyFilters';
import { handleChangeRowsPerPage, handleColumnClick, handleColumnToggle, handleFilterClick } from '../utils/admin-functions/handleFilterOptions';
import exportToCSV from '../utils/admin-functions/exportToCSV';
import AdminSacramentDialog from '../components/dialog/AdminSacramentDialog';
import { handleSacramentSave, handleSave } from '../utils/admin-functions/handleSave';
import getDisplaySacrament from '../utils/admin-functions/displaySacrament';
import { BarChartLegend, PieChartLegend } from '../components/ChartLegends';
import { handleAdd, handleSacramentAdd } from '../utils/admin-functions/handleAdd';
import { handleEdit, handleSacramentEdit } from '../utils/admin-functions/handleEdit';
import { handleCloseDialog, handleCloseSacramentDialog } from '../utils/admin-functions/handleCloseDialog';
import { formatDisplayValue } from '../utils/admin-functions/formatDatabaseValue';
import SacramentFormCard from '../components/SacramentForms';
import fetchSacramentForms from '../utils/admin-functions/fetch-documents/fetchSacramentForms';
import BaptismSacramentForm from '../components/sacramentFormsSpecific/BaptismSacramentForm';
import BurialSacramentForm from '../components/sacramentFormsSpecific/BurialSacramentForm';
import deleteSacramentDocuments from '../utils/admin-functions/delete-documents/deleteSacramentDocuments';
import restoreSacramentDocuments from '../utils/admin-functions/delete-documents/restoreSacramentDocuments';
import permanentlyDeleteSacramentDocuments from '../utils/admin-functions/delete-documents/permanentlyDeleteSacramentDocuments';
import WeddingSacramentForm from '../components/sacramentFormsSpecific/WeddingSacramentForm';


const COMMON_BOOKING_STRUCTURE = {
  fields: [
    'user_firstname',
    'user_lastname', 
    'booking_status',
    'booking_date',
    'booking_time',
    'booking_pax',
    'booking_transaction',
    'price',
    'paid',
    'form',
  ],
  requiredFields: ['booking_date', 'booking_time', 'booking_pax', 'booking_status', 'user_id']
};

const BOOKING_TABLE_STRUCTURES = {
  wedding: {
    ...COMMON_BOOKING_STRUCTURE,
    displayName: 'Wedding'
  },
  baptism: {
    ...COMMON_BOOKING_STRUCTURE,
    displayName: 'Baptism',
  },
  confession: {
    ...COMMON_BOOKING_STRUCTURE,
    displayName: 'Confession'
  },
  anointing: {
    ...COMMON_BOOKING_STRUCTURE,
    displayName: 'Anointing'
  },
  communion: {
    ...COMMON_BOOKING_STRUCTURE,
    displayName: 'First Communion'
  },
  burial: {
    ...COMMON_BOOKING_STRUCTURE,
    displayName: 'Burial',
  }
};

// Define table structures
const TABLE_STRUCTURES = {
  booking_tbl: {
    fields: [
      // 'user_id',
      'user_firstname',
      'user_lastname',
      'booking_status',
      'booking_sacrament',
      'booking_date',
      'booking_time',
      'booking_pax',
      'booking_transaction',
      'price',
      'paid',
    ],
    displayName: 'All Sacrament Bookings',
    requiredFields: ['booking_sacrament', 'booking_date', 'booking_time', 'booking_pax', 'booking_status', 'user_id']
  },
  document_tbl: {
    fields: [
      'document_firstname',
      'document_middle',
      'document_lastname',
      'document_gender',
      'document_mobile',
      'document_bday',
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
      // 'user_id',
      'user_firstname',
      'user_lastname',
      'donation_amount',
      'donation_intercession',
      'date_created',
    ],
    displayName: 'Donations',
    requiredFields: ['donation_amount']
  },
  request_tbl: {
    fields: [
      // 'user_id',
      'user_firstname',
      'user_lastname',
      'request_baptismcert',
      'request_confirmationcert',
      'document_id'
    ],
    displayName: 'Requests',
    requiredFields: ['user_id']
  },
  admin_tbl: {
    fields: [
      'admin_firstname',
      'admin_lastname',
      'admin_email',
      'admin_mobile',
      'admin_bday',
    ],
    displayName: 'Admins',
    requiredFields: ['admin_email', 'admin_firstname', 'admin_lastname']
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
  user_tbl: {
    fields: [
      'user_firstname',
      'user_middle',
      'user_lastname',
      'user_gender',
      // 'user_status',
      'user_email',
      'user_mobile',
      'user_bday',
      // 'user_image'
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
    totalAdmins: 0,
    totalPriests: 0,
    availablePriests: 0,
    genderCounts: [],
    pendingBySacrament: [],
    documentByStatusCounts: [],
    monthlyDonations: [],
    donationSummary: {
      today: 0,
      lastWeek: 0,
      thisMonth: 0,
      average: 0,
      yearTotal: 0,
    },
    mostCommonSacraments: '',
    recentTransactions: []
  });
  const [transactionLogs, setTransactionLogs] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [openDeletedDialog, setOpenDeletedDialog] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [tableStats, setTableStats] = useState({});
  const [users, setUsers] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, logout, adminData } = useAdminAuth();
  const CHART_COLORS = ['#0088FE', '#FF6B6B', '#FFBB28', '#FF8042', '#8884D8', '#00C49F'];
  
  const [bookingTables, setBookingTables] = useState(Object.keys(BOOKING_TABLE_STRUCTURES));
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  const [openSacramentDialog, setOpenSacramentDialog] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [sacramentSortConfig, setSacramentSortConfig] = useState({ key: null, direction: 'desc' });
  const [sacramentTableData, setSacramentTableData] = useState([]);
  const [sacramentFilteredData, setSacramentFilteredData] = useState([]);
  const [sacramentTableStats, setSacramentTableStats] = useState({});
  const [sacramentSearchQuery, setSacramentSearchQuery] = useState('');
  const [sacramentActiveFilters, setSacramentActiveFilters] = useState({});
  const [sacramentVisibleColumns, setSacramentVisibleColumns] = useState({});
  const [sacramentFilterAnchorEl, setSacramentFilterAnchorEl] = useState(null);
  const [sacramentColumnAnchorEl, setSacramentColumnAnchorEl] = useState(null);
  const [sacramentPage, setSacramentPage] = useState(0);
  const [sacramentRowsPerPage, setSacramentRowsPerPage] = useState(10);

  // for dispplaying sacrament forms
  const [cardOpen, setCardOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardContent, setCardContent] = useState(null);

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

      // Fetch total admins
      const { count: totalAdmins } = await supabase
        .from('admin_tbl')
        .select('*', { count: 'exact' });

      // Fetch total priests
      const { count: totalPriests } = await supabase
        .from('priest_tbl')
        .select('*', { count: 'exact' });

      const { count: availablePriests } = await supabase
        .from('priest_tbl')
        .select('*', { count: 'exact' })
        .eq('priest_availability', 'Yes');

      const { data: genders } = await supabase
        .from('user_tbl')
        .select('user_gender');
      const genderCounts = [
        { name: 'Male', value: genders.filter(g => g.user_gender === 'm').length },
        { name: 'Female', value: genders.filter(g => g.user_gender === 'f').length },
        { name: 'Rather Not Say', value: genders.filter(g => !['m', 'f'].includes(g.user_gender)).length }
      ];

      // Pending bookings by sacrament
      const { data: pendingSacraments } = await supabase
        .from('booking_tbl')
        .select('booking_sacrament')
        .eq('booking_status', 'pending');
      
      // Create the Sacrament Map
      const sacramentMap = {};
      pendingSacraments.forEach((sacrament) => {
        sacramentMap[sacrament.booking_sacrament] = (sacramentMap[sacrament.booking_sacrament] || 0) + 1;
      });

      const pendingBySacrament = Object.entries(sacramentMap).map(([sacrament, count]) => ({
        sacrament, count
      }));

      // Most common sacrament
      const { data: allSacraments } = await supabase
        .from('booking_tbl')
        .select('booking_sacrament');


      const countSac = {};
      allSacraments.forEach((sacrament) => {
        countSac[sacrament.booking_sacrament] = (countSac[sacrament.booking_sacrament] || 0) + 1;
      });

      const mostCommonSacraments = Object.entries(countSac).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      // Donations (last 6 months)
      let lastSixMonths = new Date();
      lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);
      const { data: donationsData } = await supabase
        .from('donation_tbl')
        .select('*')
        .gte('date_created', lastSixMonths.toISOString());
      const donations = donationsData.map(d => ({
        ...d,
        date: new Date(d.date_created),
      }));
      const monthlyDonations = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const label = d.toLocaleString('default', { month: 'short' });
        const total = donations
          .filter(entry => entry.date.getMonth() === d.getMonth() && entry.date.getFullYear() === d.getFullYear())
          .reduce((acc, curr) => acc + (curr.donation_amount || 0), 0);

        return { month: label, amount: total };
      });

      // Donation summary
      const today = new Date();
      const todayDonations = donations
        .filter(d => d.date.toDateString() === today.toDateString())
        .reduce((a, b) => a + b.donation_amount, 0);

      const lastWeekTotal = donations
        .filter(d => d.date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000))
        .reduce((a, b) => a + b.donation_amount, 0);

      const thisMonthTotal = donations
        .filter(d => d.date.getMonth() === today.getMonth() && d.date.getFullYear() === today.getFullYear())
        .reduce((a, b) => a + b.donation_amount, 0);

      const yearTotal = donations
        .filter(d => d.date.getFullYear() === today.getFullYear())
        .reduce((a, b) => a + b.donation_amount, 0);

      const averageDonation = donations.length ? yearTotal / donations.length : 0;

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
        totalAdmins,
        totalPriests,
        availablePriests,
        genderCounts,
        pendingBySacrament,
        monthlyDonations,
        donationSummary: {
          today: todayDonations,
          lastWeek: lastWeekTotal,
          thisMonth: thisMonthTotal,
          average: Math.round(averageDonation),
          yearTotal
        },
        mostCommonSacraments,
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
      setBookingLoading(false);
    } catch (error) {
      setError('Error fetching tables: ' + error.message);
      setLoading(false);
      setBookingLoading(false);
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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSacramentTableSelect = async (sacrament) => {
    setSelectedSacrament(sacrament);
    setBookingLoading(true);
    console.log("sacrament", sacrament);
    try {
      let query = supabase
          .from('booking_tbl')
          .select(`*, user_tbl:user_id(user_firstname, user_lastname)`)
          .order('booking_date', { ascending: false })
          .order('booking_time', { ascending: false });
      if (sacrament === 'wedding') {
        // query = supabase
        //   .from('booking_tbl')
        //   .select(`*, user_tbl:user_id(user_firstname, user_lastname), booking_wedding_docu_tbl:wedding_docu_id(groom_fullname, bride_fullname, groom_1x1, bride_1x1)`)
        //   .order('booking_date', { ascending: false })
        //   .order('booking_time', { ascending: false })
        //   .eq('booking_sacrament', 'Wedding');
        query = query.eq('booking_sacrament', 'Wedding')
      } else if (sacrament === 'baptism') {
        query = query.eq('booking_sacrament', 'Baptism');
      } else if (sacrament === 'confession')  {
        query = query.eq('booking_sacrament', 'Confession');
      } else if (sacrament === 'anointing') {
        query = query.eq('booking_sacrament', 'Anointing of the Sick');
      } else if (sacrament === 'communion') {
        query = query.eq('booking_sacrament', 'First Communion');
      } else if (sacrament === 'burial') {
        query = query.eq('booking_sacrament', 'Burial');  
      }

      let { data, error } = await query;
      
      console.log("Sacrament Data fetched:", data);
      if (error) throw error;

      let transformedData = [];
      transformedData = data.map((record) => {
        let newrecord = {
          ...record,
          user_firstname: record.user_tbl ? record.user_tbl.user_firstname : '',
          user_lastname: record.user_tbl ? record.user_tbl.user_lastname : '',
        };
        delete newrecord.user_tbl; // Remove the user_tbl object
        if (newrecord.booking_wedding_docu_tbl) {
          newrecord.groom_fullname = newrecord.booking_wedding_docu_tbl.groom_fullname || '';
          newrecord.bride_fullname = newrecord.booking_wedding_docu_tbl.bride_fullname || '';
          newrecord.groom_1x1 = newrecord.booking_wedding_docu_tbl.groom_1x1 || '';
          newrecord.bride_1x1 = newrecord.booking_wedding_docu_tbl.bride_1x1 || '';
          delete newrecord.booking_wedding_docu_tbl; // Remove the wedding document object
        }
        return newrecord;
      })

      setSacramentTableData(transformedData || []);
      setSacramentFilteredData(transformedData || []);
      setSacramentSearchQuery('');
      // Set initial sort config based on table type
      setSacramentSortConfig({ key: 'booking_date', direction: 'desc' });
      setSacramentPage(0);
    } catch (error) {
      setError('Error fetching table data: ' + error.message);
    } finally {
      setBookingLoading(false);
    }

    setBookingLoading(false);

  }

  const handleTableSelect = async (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      let query = supabase.from(tableName).select('*');
      
      // Apply default sorting based on table type
      if (tableName === 'booking_tbl') {
        query = supabase.from(tableName)
          .select(`*, user_tbl:user_id(user_firstname, user_lastname)`)
          .order('booking_date', { ascending: false })
          .order('booking_time', { ascending: false });
      } else if (tableName === 'document_tbl') {
        query = query.order('document_bday', { ascending: false });
      } else if (tableName === 'user_tbl') {
        query = query.order('user_bday', { ascending: false });
      } else if (tableName === 'admin_tbl') {
        query = query.order('admin_bday', { ascending: false });
      } else if (tableName === 'donation_tbl') {
        query = supabase.from(tableName)
          .select(`*, user_tbl:user_id(user_firstname, user_lastname)`)
          .order('date_created', { ascending: false });
      } else if (tableName === 'request_tbl') {
        query = supabase.from(tableName)
          .select(`*, user_tbl:user_id(user_firstname, user_lastname)`)
          .order('date_created', { ascending: false });
      }


      let { data, error } = await query;
      console.log("Data fetched for table:", tableName, data);
      if (error) throw error;

      let transformedData = [];
      if (tableName === 'booking_tbl' || tableName === 'donation_tbl' || tableName === 'request_tbl') {
        transformedData = data.map((record) => {
          let newrecord = {
            ...record,
            user_firstname: record.user_tbl ? record.user_tbl.user_firstname : '',
            user_lastname: record.user_tbl ? record.user_tbl.user_lastname : '',
          };
          delete newrecord.user_tbl; // Remove the user_tbl object
          return newrecord;
        })
      } else {
        transformedData = data;
      }
      console.log("transformedData", transformedData);

      setTableData(transformedData || []);
      setFilteredData(transformedData || []);
      setSearchQuery('');
      
      // Set initial sort config based on table type
      if (tableName === 'booking_tbl') {
        setSortConfig({ key: 'booking_date', direction: 'desc' });
      } else if (tableName === 'document_tbl') {
        setSortConfig({ key: 'document_bday', direction: 'desc' });
      } else if (tableName === 'user_tbl') {
        setSortConfig({ key: 'user_bday', direction: 'desc' });
      } else if (tableName === 'admin_tbl') {
        setSortConfig({ key: 'admin_bday', direction: 'desc' });
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

  const handleSacramentDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        // Get the record to be deleted
        const recordToDelete = sacramentTableData.find(r => r.id === id);
        console.log('Record to delete:', recordToDelete);
        const bookingSacrament = recordToDelete.booking_sacrament;
        const specificId = bookingSacrament === 'Wedding' 
          ? recordToDelete.wedding_docu_id 
          : bookingSacrament === 'Baptism'
            ? recordToDelete.baptism_docu_id  
            : bookingSacrament === 'Burial'
              ? recordToDelete.burial_docu_id
              : null;
        // Store in deleted_records table
        const { data: insertData, error: insertError } = await supabase
          .from('deleted_records')
          .insert({
            original_table: 'booking_tbl',
            record_id: id,
            record_data: recordToDelete,
            deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
            deleted_by_email: adminData?.email || 'Unknown'
          })
          .select();

        let specificInsertData = null;
        let specificTable = null;
        if (specificId) {
          if (bookingSacrament === 'Wedding') {
            // Remove the other columns in recordToDelete
            // const columnsToRemove = ['groom_fullname', 'bride_fullname', 'groom_1x1', 'bride_1x1'];
            // columnsToRemove.forEach(col => {
            //   delete recordToDelete[col];
            // });
            
            
            // Delete the wedding document if it exists
            specificTable = 'booking_wedding_docu_tbl';
          } else if (bookingSacrament === 'Baptism') {
            // Delete the Baptism document if it exists
            specificTable = 'booking_baptism_docu_tbl';
            
          } else if (bookingSacrament === 'Burial') {
            // Delete the Burial document if it exists
            specificTable = 'booking_burial_docu_tbl';
          }

          if (specificTable) {
            deleteSacramentDocuments({
                table: specificTable,
                sacrament: bookingSacrament,
                specificId: specificId,
                adminData,
            });
          }
        }

        if (insertError) {
          console.error('Error inserting into deleted_records:', {
            error: insertError,
            data: {
              original_table: 'booking_tbl',
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
            table_name: 'booking_tbl',
            action: 'DELETE',
            record_id: id,
            old_data: recordToDelete,
            new_data: null,
            performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
            performed_by_email: adminData?.email || 'Unknown'
          });

        // Delete from original table
        const { error: deleteError } = await supabase
          .from('booking_tbl')
          .delete()
          .eq('id', id);
        
        if (specificId && specificTable) {
          // Delete the wedding document if it exists
          const { error: specificDeleteError } = await supabase
            .from(specificTable)
            .delete()
            .eq('id', specificId);
          if (specificDeleteError) {
            console.error('Error deleting specific document:', specificDeleteError);
            throw specificDeleteError;
          }
        }

        if (deleteError) {
          console.error('Error deleting from original table:', deleteError);
          throw deleteError;
        }

        setSuccess('Record moved to trash');
        handleSacramentTableSelect(selectedSacrament);
        fetchStats();
      } catch (error) {
        console.error('Error in handleSacramentDelete:', error);
        setError('Error deleting record: ' + error.message);
      }
    }
  }

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

      // remnove user_firstname and user_lastname if the original table is not user_tbl
      if (record.original_table != 'user_tbl') {
        if ('user_firstname' in recordToRestore) {
          delete recordToRestore.user_firstname;
        }
        if ('user_lastname' in recordToRestore) {
          delete recordToRestore.user_lastname;
        }
      }
      console.log('Parsed record data:', recordToRestore);
    
      // Remove any fields that shouldn't be in the insert
      delete recordToRestore.id; // Remove the old ID to let the database generate a new one
      
      // Ensure we have a valid object
      if (!recordToRestore || typeof recordToRestore !== 'object') {
        throw new Error('Invalid record data structure');
      }
      // if booking table, handle specific document restoration first
      if (record.original_table === 'booking_tbl') {
        // Restore first the specific document tables to ensure foreign key integrity
        if (recordToRestore.booking_sacrament === 'Wedding' && recordToRestore.wedding_docu_id) {
          
          const specificId = await restoreSacramentDocuments({
            original_table: 'booking_wedding_docu_tbl',
            record_id: recordToRestore.wedding_docu_id,
            sacrament: recordToRestore.booking_sacrament,
          });
          recordToRestore.wedding_docu_id = specificId;
          
        } else if (recordToRestore.booking_sacrament === 'Baptism' && recordToRestore.baptism_docu_id) {
          // Restore baptism document
          const specificId = await restoreSacramentDocuments({
            original_table: 'booking_baptism_docu_tbl',
            record_id: recordToRestore.baptism_docu_id,
            sacrament: recordToRestore.booking_sacrament,
          });
          recordToRestore.baptism_docu_id = specificId;
          
        } else if (recordToRestore.booking_sacrament === 'Burial' && recordToRestore.burial_docu_id) {
          // Restore burial document
          const specificId = await restoreSacramentDocuments({
            original_table: 'booking_burial_docu_tbl',
            record_id: recordToRestore.burial_docu_id,
            sacrament: recordToRestore.booking_sacrament,
          });
          recordToRestore.burial_docu_id = specificId;
        }
      }

      // ----------------------------------
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
      if (record.original_table === 'booking_tbl') {
        handleSacramentTableSelect(selectedSacrament);
      } else {
        handleTableSelect(record.original_table);
      }
      fetchStats();
    } catch (error) {
      console.error('Error in handleRestore:', error);
      setError('Error restoring record: ' + error.message);
    }
  };

  const handlePermanentDelete = async (record) => {
    if (window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
      try {
        // If booking sacrament, delete the specific document as well
        if (record.original_table === 'booking_tbl') {
          const { data: originalData, error: originalError } = await supabase
            .from('deleted_records')
            .select('*')
            .eq('id', record.id);
          if (originalError) {
            console.error('Error fetching original record data:', originalError);
            throw originalError;
          }
          if (originalData.length === 0) {
            console.error('Original record not found in deleted records:', record.id);
            throw new Error('Original record not found in deleted records');
          }
          const originalRecord = JSON.parse(originalData[0].record_data);

          console.log('Parsed original record:', originalRecord);

          if (originalRecord.booking_sacrament === 'Wedding') {
            await permanentlyDeleteSacramentDocuments({
              original_table: 'booking_wedding_docu_tbl',
              record_id: originalRecord.wedding_docu_id,
            });
            // const { data: weddingData, error: weddingError } = await supabase
            //   .from('deleted_records')
            //   .select("*")
            //   .eq('original_table', 'booking_wedding_docu_tbl')
            //   .eq('record_id', originalRecord.wedding_docu_id);
            // if (weddingError) {
            //   console.error('Error fetching wedding document from deleted records:', weddingError);
            //   throw weddingError;
            // }

            // if (weddingData.length === 0) {
            // }
            // // Deelte the record as well
            // const weddingDoc = weddingData[0];
            // const { error: weddingDeleteError } = await supabase
            //   .from('deleted_records')
            //   .delete()
            //   .eq('id', weddingDoc.id);
            // if (weddingDeleteError) {
            //   console.error('Error deleting wedding document from deleted records:', weddingDeleteError);
            //   throw weddingDeleteError;
            // }
          } else if (originalRecord.booking_sacrament === 'Baptism') {
            await permanentlyDeleteSacramentDocuments({
              original_table: 'booking_baptism_docu_tbl',
              record_id: originalRecord.baptism_docu_id,
            });
          } else if (originalRecord.booking_sacrament === 'Burial') {
            await permanentlyDeleteSacramentDocuments({
              original_table: 'booking_burial_docu_tbl',
              record_id: originalRecord.burial_docu_id,
            });
          }
        }
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

  const handleSacramentSort = (key) => {
    let direction = 'desc';
    if (sacramentSortConfig.key === key && sacramentSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSacramentSortConfig({ key, direction });

    const sortedData = [...sacramentFilteredData].sort((a, b) => {
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

    setSacramentFilteredData(sortedData);
  }

  const handleFilterChange = (isSacrament = false, field, value, type = 'contains') => {
    let newFilter = isSacrament ? { ...sacramentActiveFilters } : { ...activeFilters };

    newFilter = {
      ...newFilter,
      [field]: { value, type }
    };
    if (isSacrament) {
      setSacramentActiveFilters(newFilter);
      applyFilters({
        tableData: sacramentTableData,
        searchQuery: sacramentSearchQuery,
        activeFilters: newFilter,
        sortConfig: sacramentSortConfig,
        setFilteredData: setSacramentFilteredData,
        calculateTableStats: sacramentCalculateTableStats,
      });
    } else {
      setActiveFilters(newFilter);
      applyFilters({
        tableData,
        searchQuery,
        activeFilters: newFilter,
        sortConfig,
        setFilteredData,
        calculateTableStats,
      });
    }
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

  const sacramentCalculateTableStats = (data) => {
    const stats = {};
    BOOKING_TABLE_STRUCTURES[selectedSacrament]?.fields.forEach(field => {
      if (typeof data[0]?.[field] === 'number') {
        stats[field] = {
          min: Math.min(...data.map(row => row[field])),
          max: Math.max(...data.map(row => row[field])),
          avg: data.reduce((sum, row) => sum + row[field], 0) / data.length
        };
      }
    });
    setSacramentTableStats(stats);
  }

  const displaySacramentForm = async (title, id, selectedSacrament) => {
    console.log("Selected Sacrament: ", selectedSacrament);
    setCardOpen(!cardOpen);
    setCardTitle(title);
    setCardContent(await fetchSacramentForms(id, selectedSacrament));
  }                                    


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
            sx={{ mr: 2, color: '#6B5F32' }}
          >
            View Logs
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteForeverIcon />}
            onClick={handleViewDeleted}
            sx={{ mr: 2, color: '#6B5F32' }}
          >
            View Trash
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/approved-calendar')}
            sx={{ mr: 2, color: '#6B5F32' }}
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
                Total Admins
              </Typography>
              <Typography variant="h4">
                {stats.totalAdmins}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Priests
              </Typography>
              <Typography variant="h4">
                {stats.totalPriests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available Priests
              </Typography>
              <Typography variant="h4">
                {stats.availablePriests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Most Common Sacrament
              </Typography>
              <Typography variant="h4">
                {stats.mostCommonSacraments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Analytics */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Data Analytics
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-5">
        {/* Gender Pie Chart */}
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">User Gender Distribution</h3>
          <PieChart width={250} height={250} className='mx-auto'>
            <Pie
              data={stats.genderCounts}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              
            >
              {stats.genderCounts.map((_, idx) => (
                <Cell key={`${_.name}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {/* <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => `${value}: ${entry.payload.value}`}
            /> */}
          </PieChart>
          <PieChartLegend data={stats.genderCounts} colors={CHART_COLORS} />
        </div>

        {/* Pending Bookings by Sacrament */}
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Pending Bookings by Sacrament</h3>
          <BarChart width={250} height={250} data={stats.pendingBySacrament} className='mx-auto'>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sacrament" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count">
              {stats.pendingBySacrament.map((entry, index) => (
                <Cell key={`cell-${entry.sacrament}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
          <BarChartLegend data={stats.pendingBySacrament} colors={CHART_COLORS} />
        </div>

        {/* Monthly Donations Line Chart */}
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Monthly Donations (Last 6 Months)</h3>
          <LineChart width={250} height={250} data={stats.monthlyDonations} className='mx-auto'>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" />
          </LineChart>
        </div>

        {/* Donation Summary */}
        <div className='bg-white p-4 rounded-2xl shadow text-center'>
          <h3 className="text-xl font-semibold mb-2">Donation Summary</h3>
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 rounded-2xl overflow-hidden shadow-sm'>
              <thead className='bg-gray-100'>
                <th className="px-4 py-2 border text-left">Donation Period</th>
                <th className="px-4 py-2 border">Amount</th>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border text-left">Today</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.today}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">Past 7 Days</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.lastWeek}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">This Month</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.thisMonth}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">Monthly Average</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.average}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">Year-to-Date Total</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.yearTotal}</td>
                </tr>
              </tbody>
            </table>

          </div>


        </div>
      </div>


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

      {/* --- Sacrament Service Tables --------------------------------------------------------------------- */}
      {/* --- Sacrament Service Tables --------------------------------------------------------------------- */}
      {/* --- Sacrament Service Tables --------------------------------------------------------------------- */}
      {/* --- Sacrament Service Tables --------------------------------------------------------------------- */}
      {/* --- Sacrament Service Tables --------------------------------------------------------------------- */}
      <div className='mb-4'>
        <Box display="flex" gap={2}>
          {/* Tables Sidebar */}
          <Paper sx={{ p: 2, width: '200px' }} >
            <Typography variant="h6" gutterBottom>
              Sacrament Bookings
            </Typography>
            {bookingTables.map((sacrament) => {
              return (
                <>
                  <Button
                    key={sacrament}
                    fullWidth
                    variant={selectedSacrament === sacrament ? 'contained' : 'text'}
                    onClick={() => handleSacramentTableSelect(sacrament)}
                    
                    sx={{ justifyContent: 'flex-center', mb: 1 }}
                  >
                    <span className='text-[#6B5F32] font-bold'>
                      {BOOKING_TABLE_STRUCTURES[sacrament]?.displayName || sacrament}
                    </span>
                  </Button>
                </>
              );
            }
            )}
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            {bookingLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : selectedSacrament ? (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {getDisplaySacrament(selectedSacrament)}
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      onClick={(e) => handleFilterClick(e, setSacramentFilterAnchorEl)}
                      sx={{ mr: 1, color: '#6B5F32' }}
                    >
                      Filters
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ViewColumnIcon />}
                      onClick={(e) => handleColumnClick(e, setSacramentColumnAnchorEl)}
                      sx={{ mr: 1, color: '#6B5F32' }}
                    >
                      Columns
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SaveAltIcon />}
                      onClick={() => exportToCSV(sacramentFilteredData, selectedSacrament)}
                      sx={{ mr: 1,  color: '#6B5F32' }}
                    >
                      Export
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleSacramentAdd({
                        selectedSacrament, 
                        setFormData, 
                        setEditingRecord, 
                        setOpenSacramentDialog
                      })}
                    >
                      Add New
                    </Button>
                  </Box>
                </Box>
                {/* Table Statistics */}
                {Object.keys(sacramentTableStats).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Statistics</Typography>
                    <Grid container spacing={2}>
                      {Object.entries(sacramentTableStats).map(([field, stats]) => (
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
                  options={[]}
                  value={sacramentSearchQuery}
                  onChange={(event, newValue) => {
                    setSacramentSearchQuery(newValue);
                    applyFilters({
                      tableData: sacramentTableData,
                      searchQuery: newValue,
                      activeFilters: sacramentActiveFilters,
                      sortConfig: sacramentSortConfig,
                      setFilteredData: setSacramentFilteredData,
                      calculateTableStats: sacramentCalculateTableStats,
                    });
                  }}
                  onInputChange={(event, newValue) => {
                    setSacramentSearchQuery(newValue);
                    applyFilters({
                      tableData: sacramentTableData,
                      searchQuery: newValue,
                      activeFilters: sacramentActiveFilters,
                      sortConfig: sacramentSortConfig,
                      setFilteredData: setSacramentFilteredData,
                      calculateTableStats: sacramentCalculateTableStats,
                    });
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
                {Object.entries(sacramentActiveFilters).some(([_, filter]) => filter.value) && (
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(sacramentActiveFilters).map(([field, { value, type }]) => (
                      value && (
                        <Chip
                          key={field}
                          label={`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value} (${type})`}
                          onDelete={() => {
                            const newFilters = { ...sacramentActiveFilters };
                            delete newFilters[field];
                            setSacramentActiveFilters(newFilters);
                            applyFilters({
                              tableData: sacramentTableData,
                              searchQuery: sacramentSearchQuery,
                              activeFilters: newFilters,
                              sortConfig: sacramentSortConfig,
                              setFilteredData: setSacramentFilteredData,
                              calculateTableStats: sacramentCalculateTableStats,
                            });
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
                  anchorEl={sacramentFilterAnchorEl}
                  open={Boolean(sacramentFilterAnchorEl)}
                  onClose={() => setSacramentFilterAnchorEl(null)}
                  PaperProps={{
                    style: {
                      maxHeight: 400,
                      width: '300px',
                    },
                  }}
                >
                  {BOOKING_TABLE_STRUCTURES[selectedSacrament]?.fields.map((field) => (
                    <Box key={field} sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={sacramentActiveFilters[field]?.value || ''}
                        onChange={(e) => handleFilterChange(true, field, e.target.value)}
                        placeholder="Filter value..."
                      />
                      <Box sx={{ mt: 1 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={sacramentActiveFilters[field]?.type || 'contains'}
                            onChange={(e) => handleFilterChange(true, field, sacramentActiveFilters[field]?.value || '', e.target.value)}
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
                            {typeof sacramentTableData[0]?.[field] === 'number' && (
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
                  anchorEl={sacramentColumnAnchorEl}
                  open={Boolean(sacramentColumnAnchorEl)}
                  onClose={() => setSacramentColumnAnchorEl(null)}
                >
                  {BOOKING_TABLE_STRUCTURES[selectedSacrament]?.fields.map((field) => (
                    <MenuItem key={field}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={sacramentVisibleColumns[field] !== false}
                            onChange={() => handleColumnToggle({setVisibleColumns: setSacramentVisibleColumns, field})}
                          />
                        }
                        label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      />
                    </MenuItem>
                  ))}
                </Menu>


                {/* TABLE CONTENTS */}
                <TableContainer sx={{ maxHeight: 440, overflow:'auto' }} className='rounded-2xl overflow-hidden shadow-lg'>
                  <Table stickyHeader>
                    <TableHead className='hover:bg-[#E1D5B8]'>
                      <TableRow>
                        {BOOKING_TABLE_STRUCTURES[selectedSacrament]?.fields
                          .filter(field => sacramentVisibleColumns[field] !== false)
                          .map((field) => (

                            <TableCell 
                              key={field}
                              onClick={() => handleSacramentSort(field)}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                              }}
                            >
                              <Box display="flex" alignItems="center">
                                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                {sacramentSortConfig.key === field && (
                                  <Box component="span" ml={1}>
                                    {sacramentSortConfig.direction === 'asc' ? '↑' : '↓'}
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                          ))}
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sacramentFilteredData
                        .slice(sacramentPage * sacramentRowsPerPage, sacramentPage * sacramentRowsPerPage + sacramentRowsPerPage)
                        .map((row, index) => (
                          <TableRow key={index} className='hover:bg-[#F5F0E2]'>
                            {BOOKING_TABLE_STRUCTURES[selectedSacrament]?.fields
                              .filter(field => sacramentVisibleColumns[field] !== false)
                              .map((field) => (
                                <TableCell key={field}>
                                  {field === 'form' ? 
                                    selectedSacrament === 'baptism' ?
                                      (<Button
                                        onClick={() => { displaySacramentForm('Baptism Form', sacramentFilteredData[index].baptism_docu_id, selectedSacrament); }}
                                        sx={{ color: '#6B5F32', '&:hover': { backgroundColor: '#E1D5B8', color: 'black' } }}>
                                        View Form
                                      </Button>)  
                                    : selectedSacrament === 'burial' ?
                                      (<Button
                                        onClick={() => { displaySacramentForm('Burial Form', sacramentFilteredData[index].burial_docu_id, selectedSacrament); }}
                                        sx={{ color: '#6B5F32', '&:hover': { backgroundColor: '#E1D5B8', color: 'black' } }}>
                                        View Form
                                      </Button>)  
                                      : selectedSacrament === 'wedding' ?
                                        (<Button
                                          onClick={() => { displaySacramentForm('Wedding Form', sacramentFilteredData[index].wedding_docu_id, selectedSacrament); }}
                                          sx={{ color: '#6B5F32', '&:hover': { backgroundColor: '#E1D5B8', color: 'black' } }}>
                                          View Form
                                        </Button>)
                                        : formatDisplayValue(field, row[field])  
                                  : formatDisplayValue(field, row[field])  
                                  }
                                </TableCell>
                              ))}
                            <TableCell>
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleSacramentEdit({
                                  record: row,
                                  setFormData,
                                  setEditingRecord,
                                  setOpenSacramentDialog,
                                })}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton onClick={() => handleSacramentDelete(row.id)}>
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
                  count={sacramentFilteredData.length}
                  page={sacramentPage}
                  onPageChange={(e, newPage) => setSacramentPage(newPage)}
                  rowsPerPage={sacramentRowsPerPage}
                  onRowsPerPageChange={(e) => handleChangeRowsPerPage(e, setSacramentRowsPerPage, setSacramentPage)}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            ) : (
              <div className='text-center flex flex-col items-center justify-center h-full'>
                <ChurchOutlined sx={{ mb: 2, fontSize: 64 }} className='text-[#E1D5B8]' />
                <Typography variant="h5" color="text.secondary">
                  Select a sacrament to view the user booking records 
                </Typography>
              </div>
            )}
          </Paper>
        </Box>
      </div>

      {/* --- Database Tables --- */}
      {/* --- Database Tables --- */}
      {/* --- Database Tables --- */}
      {/* --- Database Tables --- */}
      {/* --- Database Tables --- */}
      <Box display="flex" gap={2}>
        {/* Tables Sidebar */}
        <Paper sx={{ p: 2, width: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Management
          </Typography>
          {tables.map((table) => {
            return (
              <>
                <Button
                  key={table}
                  fullWidth
                  variant={selectedTable === table ? 'contained' : 'text'}
                  onClick={() => handleTableSelect(table)}
                  sx={{ justifyContent: 'flex-center', mb: 1 }}
                >
                   <span className='text-[#6B5F32] font-bold'>
                    {TABLE_STRUCTURES[table]?.displayName || table}
                   </span>
                </Button>
                {table === 'request_tbl' && (
                  <Divider sx={{ my: 1 }} />
                )}
              </>
            );
          }
          )}
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
                    onClick={(e) => handleFilterClick(e, setFilterAnchorEl)}
                    sx={{ mr: 1, color: '#6B5F32' }}
                  >
                    Filters
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ViewColumnIcon />}
                    onClick={(e) => handleColumnClick(e, setColumnAnchorEl)}
                    sx={{ mr: 1, color: '#6B5F32' }}
                  >
                    Columns
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SaveAltIcon />}
                    onClick={() => exportToCSV(filteredData, selectedTable)}
                    sx={{ mr: 1, color: '#6B5F32' }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleAdd({
                      selectedTable, 
                      setFormData, 
                      setEditingRecord, 
                      setOpenDialog
                    })}
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
                options={[]}
                value={searchQuery}
                onChange={(event, newValue) => {
                  setSearchQuery(newValue);
                  applyFilters({
                    tableData,
                    searchQuery: newValue,
                    activeFilters,
                    sortConfig,
                    setFilteredData,
                    calculateTableStats,
                  });
                }}
                onInputChange={(event, newValue) => {
                  setSearchQuery(newValue);
                  applyFilters({
                    tableData,
                    searchQuery: newValue,
                    activeFilters,
                    sortConfig,
                    setFilteredData,
                    calculateTableStats,
                  });
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
                          const newFilters = { ...activeFilters };
                          delete newFilters[field];
                          setActiveFilters(newFilters);
                          applyFilters({
                            tableData,
                            searchQuery,
                            activeFilters: newFilters,
                            sortConfig,
                            setFilteredData,
                            calculateTableStats,
                          });
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
                onClose={() => setFilterAnchorEl(null)}
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
                      onChange={(e) => handleFilterChange(false, field, e.target.value)}
                      placeholder="Filter value..."
                    />
                    <Box sx={{ mt: 1 }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={activeFilters[field]?.type || 'contains'}
                          onChange={(e) => handleFilterChange(false, field, activeFilters[field]?.value || '', e.target.value)}
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
                onClose={() => setColumnAnchorEl(null)}
              >
                {TABLE_STRUCTURES[selectedTable]?.fields.map((field) => (
                  <MenuItem key={field}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns[field] !== false}
                          onChange={() => handleColumnToggle({setVisibleColumns, field})}
                        />
                      }
                      label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  </MenuItem>
                ))}
              </Menu>


              {/* TABLE CONTENTS */}
              <TableContainer sx={{ maxHeight: 440, overflow:'auto' }} className='rounded-2xl shadow-lg'>
                <Table stickyHeader>
                  <TableHead className='hover:bg-[#E1D5B8]'>
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
                        <TableRow key={index} className='hover:bg-[#F5F0E2]'>
                          {TABLE_STRUCTURES[selectedTable]?.fields
                            .filter(field => visibleColumns[field] !== false)
                            .map((field) => (
                              <TableCell key={field}>
                                {formatDisplayValue(field, row[field])}
                              </TableCell>
                            ))}
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEdit({
                                record: row,
                                setFormData,
                                setEditingRecord,
                                setOpenDialog,
                              })}>
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
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => handleChangeRowsPerPage(e, setRowsPerPage, setPage)}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          ) : (
            <div className='text-center flex flex-col items-center justify-center h-full'>
              <TableChart sx={{ mb: 2, fontSize: 64 }} className='text-[#E1D5B8]' />
              <Typography variant="h5" color="text.secondary">
                Select a table to view its data
              </Typography>
            </div>
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
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}
            variant="scrollable"
            scrollButtons="auto"
            
          >
            <Tab label="All" sx={{ color: '#000'}} />
            {tables.map((table) => (
              <Tab key={table} label={TABLE_STRUCTURES[table]?.displayName || table} sx={{ color: '#000'}} />
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
                    .filter(record => record.original_table !== 'booking_wedding_docu_tbl') // Filter out tables that are just for booking documents
                    .filter(record => record.original_table !== 'booking_burial_docu_tbl') // Filter out tables that are just for booking documents
                    .filter(record => record.original_table !== 'booking_baptism_docu_tbl') // Filter out tables that are just for booking documents
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
                            onClick={() => handlePermanentDelete(record)}
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
            className='hover:text-black'
            sx={{ color: '#6B5F32' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sacrament Form Dialogs */}
      <SacramentFormCard
        cardOpen={cardOpen}
        setCardOpen={setCardOpen}
        title={cardTitle}
      >
        {cardTitle === 'Baptism Form' && (
          <BaptismSacramentForm data={cardContent} />
        )}
        {cardTitle === 'Burial Form' && (
          <BurialSacramentForm data={cardContent} /> 
        )}
        {cardTitle === 'Wedding Form' && (
          <WeddingSacramentForm data={cardContent} />
        )}
      </SacramentFormCard>


      <AdminSacramentDialog 
        openDialog = {openSacramentDialog}
        editingRecord={editingRecord}
        error={error}
        sacrament={selectedSacrament}
        formData={formData}
        setFormData={setFormData}
        users={users}
        handleCloseDialog={() => handleCloseSacramentDialog({
          setOpenSacramentDialog,
          setFormData,
          setEditingRecord,
        })}
        handleSave={() => handleSacramentSave({
          BOOKING_TABLE_STRUCTURES,
          selectedSacrament,
          formData,
          editingRecord,
          sacramentTableData,
          adminData,
          setError,
          setSuccess,
          setOpenSacramentDialog,
          handleSacramentTableSelect,
          fetchStats,
        })}
      />
      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => handleCloseDialog({
          setOpenDialog,
          setFormData,
          setEditingRecord,
        })} 
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
                {/* <Grid item xs={12} sm={6}>
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
                </Grid> */}
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
                    <option value="First Communion">First Communion</option>
                    <option value="Burial">Burial</option>
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
                {editingRecord && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            select
                            label="Is Service Fee Paid?"
                            value={formData.paid || (editingRecord ? '' : false)}
                            onChange={(e) => setFormData({ ...formData, paid: e.target.value === 'true' })}
                            required
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            SelectProps={{ native: true }}
                            >
                            <option value="">Select Payment Status</option>
                            <option value="true">Paid</option>
                            <option value="false">Not Yet Paid</option>
                        </TextField>
                    </Grid>
                )}
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
              <>
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
                </Grid>
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
              </>
            )}

            {selectedTable === 'admin_tbl' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.admin_email || ''}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.admin_firstname || ''}
                    onChange={(e) => setFormData({ ...formData, admin_firstname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.admin_lastname || ''}
                    onChange={(e) => setFormData({ ...formData, admin_lastname: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    value={formData.admin_mobile || ''}
                    onChange={(e) => setFormData({ ...formData, admin_mobile: e.target.value })}
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
                    value={formData.admin_bday || ''}
                    onChange={(e) => setFormData({ ...formData, admin_bday: e.target.value })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/* <Grid item xs={12} sm={6}>
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
                </Grid> */}
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
                    value={formData.priest_availability === null ? '' : formData.priest_availability ? 'Available' : 'Unavailable'}
                    onChange={(e) => setFormData({ ...formData, priest_availability: e.target.value === 'Available' ? true : false })}
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Availability</option>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {selectedTable === 'request_tbl' && (
              <>
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
                      label="Document ID"
                      value={formData.document_id || ''}
                      onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                      // required
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                      >
                    </TextField>
                  </Grid>
                </Grid>
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
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleCloseDialog({
              setOpenDialog,
              setFormData,
              setEditingRecord,
            })}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSave({
              TABLE_STRUCTURES,
              selectedTable,
              tableData,
              formData,
              editingRecord,
              adminData,
              setError,
              setSuccess,
              setOpenDialog,
              handleTableSelect,
              fetchStats,
            })} 
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
              sx={{ color: '#6B5F32' }}
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
            className=' hover:text-black'
            sx={{ color: '#6B5F32' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
