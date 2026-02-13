import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar, Table, Form, Tabs, Tab } from 'react-bootstrap';
import {
    Calendar,
    User,
    MapPin,
    Briefcase,
    Clock,
    Download,
    Trash2,
    Edit2,
    CheckCircle,
    AlertCircle,
    Filter as FilterIcon,
    Users,
    XCircle,
    Plus,
    Minus,
    Stethoscope,
    Dna,
    FileText,
    ArrowRight,
    Search as SearchIcon,
    History,
    CalendarDays,
    Activity
} from 'lucide-react';
import {
    faFilter,
    faClose,
    faGear,
    faCheck,
    faCalendarWeek
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from 'framer-motion';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import GenericSidePanel from '../GenericSidePanel';
import SSTVisitForm from './SSTVisitForm';
import SSTExaminationPanel from './SSTExaminationPanel';
import SSTPatientDossierPanel from './SSTPatientDossierPanel';
import ExpandRTable from '../Employe/ExpandRTable';
import Swal from "sweetalert2";
import { FaPlusCircle } from "react-icons/fa";
import "../Style.css";

const SSTVisits = () => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [visitsData, setVisitsData] = useState([
        {
            id: 'VST-001',
            date: '2026-02-15',
            doctor: 'Dr. Martin',
            department: 'Production',
            location: 'Cabinet Mobile A',
            progress: 0,
            status: 'planifiée',
            employees: [
                { id: 'E001', name: 'Jean Dupont', department: 'Production', status: 'Inscrit' },
                { id: 'E005', name: 'Alain Bernard', department: 'Production', status: 'Inscrit' }
            ]
        },
        {
            id: 'VST-002',
            date: '2026-02-14',
            doctor: 'Dr. Dupont',
            department: 'Logistique',
            location: 'Infirmerie Centrale',
            progress: 45,
            status: 'en_cours',
            employees: [
                { id: 'E002', name: 'Marie Dubois', department: 'Logistique', status: 'Complété' },
                { id: 'E015', name: 'Luc Lefebvre', department: 'Logistique', status: 'En attente' }
            ]
        },
        {
            id: 'VST-003',
            date: '2026-02-14',
            doctor: 'Dr. Martin',
            department: 'RH',
            location: 'Infirmerie Centrale',
            progress: 100,
            status: 'terminée',
            employees: [
                { id: 'E003', name: 'Pierre Martin', department: 'RH', status: 'Complété' }
            ]
        },
    ]);

    const [expandedRows, setExpandedRows] = useState({});

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [innerSearch, setInnerSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingVisit, setEditingVisit] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);

    const handleFiltersToggle = (isVisible) => {
        setFiltersVisible(isVisible);
    };

    // Mock employees for selection
    const employees = [
        { id: 'E001', name: 'Jean Dupont', department: 'Production', status: 'Inscrit', type: 'Normal' },
        { id: 'E002', name: 'Marie Dubois', department: 'Logistique', status: 'Nouveau', type: 'Urgent' },
        { id: 'E003', name: 'Pierre Martin', department: 'RH', status: 'Inscrit', type: 'Normal' },
        { id: 'E004', name: 'Sophie Laurent', department: 'IT', status: 'Nouveau', type: 'Urgent' },
        { id: 'E005', name: 'Alain Bernard', department: 'Production', status: 'Inscrit', type: 'Normal' },
    ];

    const [patientFilters, setPatientFilters] = useState({
        dept: '',
        status: '',
        urgent: 'all',
        decision: '' // New: Filter by aptitude result
    });

    const [visitFilters, setVisitFilters] = useState({
        startDate: '',
        endDate: '',
        doctor: '',
        status: ''
    });

    const [showExaminePanel, setShowExaminePanel] = useState(false);
    const [selectedEmployeeForExam, setSelectedEmployeeForExam] = useState(null);
    const [showDossierPanel, setShowDossierPanel] = useState(false);
    const [selectedEmployeeForDossier, setSelectedEmployeeForDossier] = useState(null);

    const [biometrics, setBiometrics] = useState({
        weight: '75', height: '175', pulse: '72', bp_systolic: '120', bp_diastolic: '80',
        temperature: '36.6', glycemia: '0.95', vision_right: '10', vision_left: '10',
        spo2: '98', waist: '90', hearing_right: 'Normal', hearing_left: 'Normal'
    });

    const [clinicalNotes, setClinicalNotes] = useState({
        subjective: '', objective: '', assessment: '', plan: ''
    });

    const [aptitude, setAptitude] = useState(null);

    const processedVisits = useMemo(() => {
        return visitsData.map(visit => {
            const employees = visit.employees || [];
            const total = employees.length;
            const completed = employees.filter(e => e.status === 'Complété' || e.status === 'Terminée').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            let status = 'planifiée';
            if (progress === 100) status = 'terminée';
            else if (progress > 0) status = 'en_cours';
            
            return {
                ...visit,
                progress,
                status
            };
        });
    }, [visitsData]);

    const [filteredData, setFilteredData] = useState(processedVisits);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(v => v.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: "Supprimer la sélection ?",
            text: `Vous allez supprimer ${selectedItems.length} visites.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setVisitsData(visitsData.filter(v => !selectedItems.includes(v.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les visites ont été supprimées.", "success");
            }
        });
    };


    useEffect(() => {
        setTitle("Visites Médicales");
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions]);


    useEffect(() => {
        let filtered = [...processedVisits];

        // Header Filters
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                (item.doctor?.toLowerCase().includes(query)) ||
                (item.department?.toLowerCase().includes(query)) ||
                (item.id?.toLowerCase().includes(query))
            );
        }

        if (visitFilters.startDate) {
            filtered = filtered.filter(v => v.date >= visitFilters.startDate);
        }
        if (visitFilters.endDate) {
            filtered = filtered.filter(v => v.date <= visitFilters.endDate);
        }
        if (visitFilters.doctor) {
            filtered = filtered.filter(v => v.doctor === visitFilters.doctor);
        }
        if (visitFilters.status) {
            filtered = filtered.filter(v => v.status === visitFilters.status);
        }

        setFilteredData(filtered);
    }, [searchQuery, processedVisits, visitFilters]);

    const handleCreateVisit = (formData) => {
        if (editingVisit) {
            setVisitsData(visitsData.map(v => v.id === editingVisit.id ? { ...v, ...formData } : v));
            Swal.fire("Mis à jour", "La visite a été mis à jour avec succès.", "success");
        } else {
            const newVisit = {
                id: `VST-00${visitsData.length + 1}`,
                ...formData,
                progress: 0,
                status: 'planifiée'
            };
            setVisitsData([newVisit, ...visitsData]);
            Swal.fire("Succès", "La visite a été programmée avec succès.", "success");
        }
        setShowForm(false);
        setEditingVisit(null);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Cette action est irréversible !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler"
        }).then((result) => {
            if (result.isConfirmed) {
                setVisitsData(visitsData.filter(v => v.id !== id));
                Swal.fire("Supprimé !", "La visite a été supprimée.", "success");
            }
        });
    };

    const handleDownload = (visit) => {
        Swal.fire({
            title: 'Génération du rapport...',
            html: `Préparation du rapport pour le département <b>${visit.department}</b>`,
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
            }
        }).then(() => {
            Swal.fire("Téléchargé", `Le rapport ${visit.id}.pdf a été généré.`, "success");
        });
    };

    const openEdit = (visit) => {
        setEditingVisit(visit);
        setShowForm(true);
    };

    const handleExamine = (employee, visitId) => {
        setSelectedEmployeeForExam({ ...employee, visitId });
        setShowExaminePanel(true);
    };

    const handleOpenDossier = (employee) => {
        setSelectedEmployeeForDossier(employee);
        setShowDossierPanel(true);
    };

    const columns = [
        {
            key: 'expand',
            label: '',
            render: (item) => (
                <div
                    onClick={(e) => { e.stopPropagation(); toggleRowExpansion(item.id); }}
                    style={{ cursor: 'pointer' }}
                    className="text-primary d-flex align-items-center justify-content-center"
                >
                    {expandedRows[item.id] ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            )
        },
        {
            key: 'id',
            label: 'ID Visite',
            render: (item) => (
                <Badge bg="light" text="dark" className="border rounded-2 fw-black font-mono extra-small">{item.id}</Badge>
            )
        },
        {
            key: 'date',
            label: 'Date & Heure',
            render: (item) => (
                <div>
                    <div className="fw-bold small text-dark">{item.date}</div>
                    <div className="extra-small text-muted">09:00</div>
                </div>
            )
        },
        {
            key: 'doctor',
            label: 'Médecin',
            render: (item) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                        <User size={14} />
                    </div>
                    <span className="fw-bold small">{item.doctor}</span>
                </div>
            )
        },
        
        {
            key: 'type',
            label: 'Type',
            render: (item) => (
                <Badge 
                    bg={
                        item.type === 'Embauche' ? 'info' : 
                        item.type === 'Reprise' ? 'warning' : 'primary'
                    } 
                    className="rounded-pill px-3 py-2 text-uppercase extra-small"
                >
                    {item.type || 'Périodique'}
                </Badge>
            )
        },
        {
            key: 'location',
            label: 'Lieu',
            render: (item) => (
                <div className="small text-muted d-flex align-items-center gap-2">
                    <MapPin size={14} /> {item.lieu || item.location}
                </div>
            )
        },
        {
            key: 'progress',
            label: 'Progression',
            render: (item) => (
                <div style={{ minWidth: '120px' }}>
                    <div className="d-flex justify-content-between extra-small fw-bold mb-1 text-muted">
                        <span>{item.progress}%</span>
                    </div>
                    <ProgressBar
                        now={item.progress}
                        variant={item.progress === 100 ? 'success' : 'primary'}
                        style={{ height: '6px' }}
                        className="rounded-pill bg-light"
                    />
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (item) => (
                <Badge
                    bg={item.status === 'planifiée' ? 'info' : item.status === 'en_cours' ? 'warning' : 'success'}
                    className="rounded-pill uppercase px-3 py-2 bg-opacity-75"
                    style={{ fontSize: '0.65rem' }}
                >
                    {item.status.replace('_', ' ')}
                </Badge>
            )
        }
    ];

    const renderExpandedRow = (visit) => (
        <div className="expanded-row-container">
            <div className="sub-table-header">
                <div className="sub-table-title">
                    <FontAwesomeIcon icon={faCalendarWeek} style={{ color: '#3a8a90' }} />
                    <span>Détails de la visite - {visit.id}</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex gap-2">
                        <Form.Select
                            size="sm"
                            className="extra-small fw-bold border-0 bg-white shadow-sm"
                            style={{ width: '160px', borderRadius: '8px' }}
                            value={patientFilters.dept}
                            onChange={e => setPatientFilters({ ...patientFilters, dept: e.target.value })}
                        >
                            <option value="">Tous les services</option>
                            <option>Production</option>
                            <option>Logistique</option>
                            <option>RH</option>
                        </Form.Select>
                        <Form.Select
                            size="sm"
                            className="extra-small fw-bold border-0 bg-white shadow-sm"
                            style={{ width: '160px', borderRadius: '8px' }}
                            value={patientFilters.decision}
                            onChange={e => setPatientFilters({ ...patientFilters, decision: e.target.value })}
                        >
                            <option value="">Toutes décisions</option>
                            <option value="Apte">Apte</option>
                            <option value="Inapte">Inapte</option>
                            <option value="A revoir">À revoir</option>
                        </Form.Select>
                    </div>
                    <div className="sub-table-badge">
                        {(visit.employees || []).length} COLLABORATEURS
                    </div>
                </div>
            </div>

            <div className="main-sub-table">
                <Table className="mb-0">
                    <thead style={{ backgroundColor: '#f8fbfa' }}>
                        <tr>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Collaborateur</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Service</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase">Résultat / Statut</th>
                            <th className="border-0 extra-small fw-black text-muted text-uppercase text-end px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const filteredEmployees = (visit.employees || [])
                                .filter(emp => !patientFilters.dept || emp.department === patientFilters.dept)
                                .filter(emp => !patientFilters.decision || emp.status === patientFilters.decision);

                            if (filteredEmployees.length > 0) {
                                return filteredEmployees.map(emp => (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid #eef2f1' }}>
                                        <td className="border-0 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                                                     style={{ width: '36px', height: '36px', fontSize: '12px', background: 'rgba(58, 138, 144, 0.1)', color: '#3a8a90' }}>
                                                    {emp.name?.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark small">{emp.name}</div>
                                                    <div className="extra-small text-muted">{emp.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border-0 py-3 align-middle">
                                            <span className="text-muted small fw-bold">{emp.department}</span>
                                        </td>
                                        <td className="border-0 py-3 align-middle">
                                            <Badge style={{ 
                                                backgroundColor: emp.status === 'Apte' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 165, 2, 0.1)',
                                                color: emp.status === 'Apte' ? '#2ed573' : '#ffa502',
                                                border: 'none',
                                                padding: '6px 12px',
                                                fontSize: '10px',
                                                fontWeight: 800
                                            }} className="rounded-pill text-uppercase">
                                                {emp.status}
                                            </Badge>
                                        </td>
                                        <td className="border-0 py-3 align-middle text-end px-4">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="rounded-3 border-0 extra-small fw-bold d-flex align-items-center gap-2"
                                                    style={{ background: '#f8f9fa', color: '#3a8a90' }}
                                                    onClick={() => handleOpenDossier(emp)}
                                                >
                                                    <FileText size={14} /> Dossier
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="btn-primary-teal border-0 rounded-3 extra-small fw-bold d-flex align-items-center gap-2 px-3"
                                                    onClick={() => handleExamine(emp, visit.id)}
                                                >
                                                    <Stethoscope size={14} /> Examen
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            }
                            return (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 border-0">
                                        <div className="text-muted extra-small fw-bold uppercase">Aucun collaborateur trouvé</div>
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </Table>
            </div>
        </div>
    );

    return (
        <ThemeProvider theme={createTheme()}>
            <Box className="postionPage" sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 0, mt: isMobile ? 8 : 10 }}>
                    <style>{`
                        .container3 {
                            padding: ${isMobile ? '12px' : '24px'} !important;
                            border: none !important;
                            border-radius: 12px !important;
                            background-color: #fff !important;
                            box-shadow: 0 6px 20px rgba(8, 179, 173, 0.08) !important;
                            transition: all 0.3s ease-in-out !important;
                            min-height: ${isMobile ? 'auto' : 'calc(100vh - 180px)'} !important;
                            height: ${isMobile ? 'auto' : 'calc(100vh - 180px)'} !important;
                            flex: 1 !important;
                            position: relative !important;
                            overflow: ${isMobile ? 'visible' : 'hidden'} !important;
                        }

                        .fw-black { font-weight: 900; }
                        .extra-small { font-size: 0.7rem; }
                        
                        .btn-primary-teal {
                            background-color: #3a8a90 !important;
                            border-color: #3a8a90 !important;
                            color: white !important;
                            transition: all 0.2s ease !important;
                            font-weight: 900 !important;
                            letter-spacing: 0.5px !important;
                        }

                        .btn-primary-teal:hover {
                            background-color: #2c767c !important;
                            border-color: #2c767c !important;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(58, 138, 144, 0.2);
                        }

                        .text-primary-teal {
                            color: #3a8a90 !important;
                        }

                        .filter-icon-btn {
                            width: 35px;
                            height: 35px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.2s;
                            background: #f8f9fa;
                            color: #3a8a90;
                            border: 1px solid #eee;
                        }

                        .filter-icon-btn:hover {
                            background: #3a8a90;
                            color: white;
                        }

                        .expanded-row-container {
                            padding: 24px;
                            background-color: #f8fbfa;
                            border-bottom: 2px solid #eef2f1;
                        }

                        .sub-table-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                        }

                        .sub-table-title {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            font-weight: 800;
                            color: #2c767c;
                            font-size: 0.95rem;
                        }

                        .sub-table-badge {
                            background-color: rgba(58, 138, 144, 0.1);
                            color: #3a8a90;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 800;
                            text-transform: uppercase;
                        }

                        .main-sub-table {
                            background: white !important;
                            border: 1px solid #eef2f1 !important;
                            border-radius: 8px !important;
                            overflow: hidden !important;
                        }
                    `}</style>
                    <div className="d-flex" style={{ width: '100%', padding: '0 20px' }}>
                        <div className="container3 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3a8a90' }}></div>
                                        <h4 className="fw-black text-dark mb-0" style={{ fontSize: '1.1rem' }}>Planning des Visites Médicales</h4>
                                    </div>
                                    <p className="text-muted extra-small mb-0 ms-3">
                                        {visitsData.length} visite{visitsData.length > 1 ? 's' : ''} programmée{visitsData.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div 
                                        className="filter-icon-btn shadow-sm"
                                        onClick={() => setFiltersVisible(!filtersVisible)}
                                        style={{ border: filtersVisible ? '1px solid #ff4757' : '1px solid #eee', color: filtersVisible ? '#ff4757' : '#3a8a90' }}
                                    >
                                        <FontAwesomeIcon icon={filtersVisible ? faClose : faGear} />
                                    </div>
                                    <Button
                                        onClick={() => { setEditingVisit(null); setShowForm(true); }}
                                        className="btn-primary-teal d-flex align-items-center rounded-3 border-0 py-2 px-4 shadow-sm"
                                        style={{ height: '42px' }}
                                    >
                                        <FaPlusCircle size={20} className="me-2" />
                                        <span className="extra-small fw-black text-uppercase">Programmer</span>
                                    </Button>
                                    {selectedItems.length > 0 && (
                                        <Button
                                            variant="danger"
                                            className="rounded-3 border-0 py-2 px-4 shadow-sm"
                                            onClick={handleDeleteSelected}
                                            style={{ height: '42px' }}
                                        >
                                            <Trash2 size={16} className="me-2" />
                                            <span className="extra-small fw-black text-uppercase">Supprimer</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {filtersVisible && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-3 bg-light rounded-3 mb-4 border"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <Row className="g-3">
                                            <Col md={3}>
                                                <Form.Label className="extra-small fw-bold text-muted uppercase">Période du</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    size="sm"
                                                    className="rounded-3"
                                                    value={visitFilters.startDate}
                                                    onChange={e => setVisitFilters({ ...visitFilters, startDate: e.target.value })}
                                                />
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="extra-small fw-bold text-muted uppercase">Au</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    size="sm"
                                                    className="rounded-3"
                                                    value={visitFilters.endDate}
                                                    onChange={e => setVisitFilters({ ...visitFilters, endDate: e.target.value })}
                                                />
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="extra-small fw-bold text-muted uppercase">Médecin</Form.Label>
                                                <Form.Select
                                                    size="sm"
                                                    className="rounded-3"
                                                    value={visitFilters.doctor}
                                                    onChange={e => setVisitFilters({ ...visitFilters, doctor: e.target.value })}
                                                >
                                                    <option value="">Tous les médecins</option>
                                                    <option>Dr. Martin</option>
                                                    <option>Dr. Dupont</option>
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="extra-small fw-bold text-muted uppercase">Statut</Form.Label>
                                                <Form.Select
                                                    size="sm"
                                                    className="rounded-3"
                                                    value={visitFilters.status}
                                                    onChange={e => setVisitFilters({ ...visitFilters, status: e.target.value })}
                                                >
                                                    <option value="">Tous les statuts</option>
                                                    <option value="planifiée">Planifiée</option>
                                                    <option value="en_cours">En cours</option>
                                                    <option value="terminée">Terminée</option>
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="mt-2" style={{ flex: 1, overflow: 'auto' }}>
                                <ExpandRTable
                                    columns={columns}
                                    data={visitsData}
                                    filteredData={filteredData}
                                    searchTerm={searchQuery}
                                    highlightText={(text) => text}
                                    selectedItems={selectedItems}
                                    handleSelectAllChange={handleSelectAllChange}
                                    handleCheckboxChange={handleCheckboxChange}
                                    handleEdit={openEdit}
                                    handleDelete={handleDelete}
                                    handleDeleteSelected={handleDeleteSelected}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    handleChangePage={(p) => setPage(p)}
                                    handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                    expandedRows={expandedRows}
                                    renderExpandedRow={renderExpandedRow}
                                    renderCustomActions={(item) => (
                                        <div className="d-flex gap-2">
                                            <Button variant="light" size="sm" className="rounded-circle" onClick={() => handleDownload(item)}>
                                                <Download size={14} className="text-primary-teal" />
                                            </Button>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => setShowForm(false)}
                            title="Programmation de Visite"
                            displayMode="inline"
                            showHeader={false}
                        >
                            <SSTVisitForm
                                initialData={editingVisit}
                                onSubmit={handleCreateVisit}
                                onCancel={() => { setShowForm(false); setEditingVisit(null); }}
                            />
                        </GenericSidePanel>

                        {/* Side Panel EXAMEN MEDICAL */}
                        {showExaminePanel && (
                            <GenericSidePanel
                                isOpen={showExaminePanel}
                                onClose={() => setShowExaminePanel(false)}
                                displayMode="inline"
                                showHeader={false}
                                defaultWidth={60}
                            >
                                <SSTExaminationPanel
                                    employee={selectedEmployeeForExam}
                                    onValidate={(data) => {
                                        // Update employee status in visitsData
                                        setVisitsData(prev => prev.map(v => {
                                            if (v.id === selectedEmployeeForExam.visitId) {
                                                return {
                                                    ...v,
                                                    employees: v.employees.map(e => 
                                                        e.id === selectedEmployeeForExam.id ? { ...e, status: 'Complété' } : e
                                                    )
                                                };
                                            }
                                            return v;
                                        }));

                                        setShowExaminePanel(false);
                                        Swal.fire({
                                            title: "Examen validé",
                                            text: "Les informations ont été enregistrées avec succès.",
                                            icon: "success",
                                            confirmButtonColor: "#3a8a90"
                                        });
                                    }}
                                    onCancel={() => setShowExaminePanel(false)}
                                />
                            </GenericSidePanel>
                        )}

                        {/* Side Panel DOSSIER MEDICAL */}
                        {showDossierPanel && (
                            <GenericSidePanel
                                isOpen={showDossierPanel}
                                onClose={() => setShowDossierPanel(false)}
                                displayMode="inline"
                                showHeader={false}
                                defaultWidth={40}
                            >
                                <SSTPatientDossierPanel
                                    employee={selectedEmployeeForDossier}
                                    onClose={() => setShowDossierPanel(false)}
                                />
                            </GenericSidePanel>
                        )}
                    </div>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default SSTVisits;
