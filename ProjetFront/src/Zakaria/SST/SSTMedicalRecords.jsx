import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Button, Card, Tab, Tabs, Table, Modal, Form, Row, Col, Badge, Dropdown } from 'react-bootstrap';
import { faEdit, faTrash, faFilePdf, faFileExcel, faPrint, faSliders, faChevronDown, faChevronUp, faSearch, faCalendarAlt, faClipboardCheck, faIdCard, faFilter, faClose, faGear, faCalendarWeek } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Trash2, Edit2, Plus, Check, X, Eye, FileText, ChevronRight, Activity, Heart, Scale, Stethoscope, AlertCircle, Download, User, Settings, Filter as FilterIcon } from 'lucide-react';
import { FaPlus, FaPlusCircle } from "react-icons/fa";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { TextField } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import "../Style.css";
import ExpandRTable from "../Employe/ExpandRTable";
import { motion, AnimatePresence } from 'framer-motion';
import GenericSidePanel from '../GenericSidePanel';
import SSTVisitForm from './SSTVisitForm';
import { useOpen } from "../../Acceuil/OpenProvider";
import { useHeader } from "../../Acceuil/HeaderContext";
// import PremiumFilters from '../Components/PremiumFilters';

const SSTMedicalRecords = React.forwardRef(({
    departementId,
    departementName,
    includeSubDepartments,
    getSubDepartmentIds,
    departements,
    onClose,
    isAddingVisit,
    setIsAddingVisit,
    filtersVisible: externalFiltersVisible,
    handleFiltersToggle
}, ref) => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [medicalRecords, setMedicalRecords] = useState([]);

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filteredData, setFilteredData] = useState(medicalRecords);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showForm, setShowForm] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [localFiltersVisible, setLocalFiltersVisible] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [expandedHistoryItems, setExpandedHistoryItems] = useState([]);
    const [showActions, setShowActions] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const filtersVisible = externalFiltersVisible !== undefined ? externalFiltersVisible : localFiltersVisible;

    // Initial column visibility
    const getInitialColumnVisibility = () => {
        const storedVisibility = localStorage.getItem('medicalRecordsColumnVisibility');
        return storedVisibility ? JSON.parse(storedVisibility) : {
            name: true,
            dept: true,
            lastVisit: true,
            status: true,
        };
    };

    const [columnVisibility, setColumnVisibility] = useState(getInitialColumnVisibility());

    useEffect(() => {
        setTitle("Dossiers Médicaux");
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions]);

    const [mainFilters, setMainFilters] = useState({
        dept: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        let filtered = [...medicalRecords];

        // Filter by departement hierarchy if departementId is provided
        if (departementId) {
            let targetDeptIds = [departementId];
            if (includeSubDepartments && getSubDepartmentIds && departements) {
                targetDeptIds = getSubDepartmentIds(departements, departementId);
            }
            // In a real app, you would filter by dept id. 
            // Here we'll just mock it with dept name for consistency with the mock data
            if (departementName) {
                filtered = filtered.filter(emp => emp.dept === departementName);
            }
        }

        if (searchQuery) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (mainFilters.dept) {
            filtered = filtered.filter(emp => emp.dept === mainFilters.dept);
        }

        if (mainFilters.status) {
            filtered = filtered.filter(emp => emp.status === mainFilters.status);
        }

        if (mainFilters.startDate) {
            filtered = filtered.filter(emp => emp.lastVisit >= mainFilters.startDate);
        }

        if (mainFilters.endDate) {
            filtered = filtered.filter(emp => emp.lastVisit <= mainFilters.endDate);
        }

        setFilteredData(filtered);
    }, [searchQuery, medicalRecords, mainFilters, departementId, includeSubDepartments, departementName, departements, getSubDepartmentIds]);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(r => r.id));
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
        if (selectedItems.length === 0) return;
        Swal.fire({
            title: "Supprimer la sélection ?",
            text: `Vous allez supprimer ${selectedItems.length} dossiers.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setMedicalRecords(medicalRecords.filter(r => !selectedItems.includes(r.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les dossiers ont été supprimés.", "success");
            }
        });
    };

    const handleDeleteRecord = (id) => {
        Swal.fire({
            title: "Supprimer ce dossier ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setMedicalRecords(prev => prev.filter(r => r.id !== id));
                Swal.fire("Supprimé", "Le dossier a été supprimé.", "success");
            }
        });
    };

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleHistoryItem = (index) => {
        setExpandedHistoryItems(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    // Exports
    const exportToPDF = useCallback(() => {
        const doc = new jsPDF();
        const tableColumn = ["ID", "Collaborateur", "Département", "Dernière Visite", "Statut"];
        const tableRows = filteredData.map(r => [r.id, r.name, r.dept, r.lastVisit, r.status]);
        doc.autoTable({ head: [tableColumn], body: tableRows });
        doc.save("dossiers_medicaux.pdf");
    }, [filteredData]);

    const exportToExcel = useCallback(() => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dossiers");
        XLSX.writeFile(wb, "dossiers_medicaux.xlsx");
    }, [filteredData]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
        exportToPDF,
        exportToExcel,
        handlePrint
    }));

    // Set header actions
    useEffect(() => {
        setOnPrint(() => handlePrint);
        setOnExportPDF(() => exportToPDF);
        setOnExportExcel(() => exportToExcel);
    }, [setOnPrint, setOnExportPDF, setOnExportExcel, handlePrint, exportToPDF, exportToExcel]);

    const columns = [
        {
            key: 'name',
            label: 'Collaborateur',
            render: (item) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '35px', height: '35px', fontSize: '12px' }}>
                        {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="fw-bold small">{item.name}</div>
                        <div className="extra-small text-muted">{item.id}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'dept',
            label: 'Département',
            render: (item) => (
                <Badge bg="light" text="secondary" className="border-0 uppercase extra-small tracking-tighter fw-black">{item.dept}</Badge>
            )
        },
        {
            key: 'lastVisit',
            label: 'Dernière Visite',
            render: (item) => <span className="small text-muted">{item.lastVisit}</span>
        },
        {
            key: 'status',
            label: 'Aptitude',
            render: (item) => (
                <Badge bg={item.status === 'Apte' ? 'success' : 'warning'} className="rounded-pill px-3 py-2 uppercase extra-small">
                    {item.status}
                </Badge>
            )
        }
    ];

    const renderExpandedRow = (record) => (
        <div className="expanded-row-container">
            <div className="sub-table-header">
                <div className="sub-table-title">
                    <FontAwesomeIcon icon={faCalendarWeek} className="text-primary me-2" />
                    <span>Historique des Examens - {record.name}</span>
                </div>
                <div className="sub-table-badge">
                    {(record.history || []).length} Visites enregistrées
                </div>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Table className="main-sub-table">
                    <thead>
                        <tr>
                            <th className="backe">Date</th>
                            <th className="backe">Type de Visite</th>
                            <th className="backe">Médecin</th>
                            <th className="backe">Observation</th>
                            <th className="backe text-end px-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(record.history || []).map((h, idx) => (
                            <tr key={idx}>
                                <td className="fw-bold">{h.date}</td>
                                <td>{h.type}</td>
                                <td>
                                    <Badge bg="info" className="bg-opacity-10 text-info border-0 extra-small">
                                        {h.doctor}
                                    </Badge>
                                </td>
                                <td style={{ maxWidth: '300px' }} className="text-truncate">
                                    <span className="small text-muted fst-italic">{h.note}</span>
                                </td>
                                <td className="text-end px-4">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="rounded-3 extra-small fw-bold px-3 py-1"
                                        onClick={() => setSelectedRecord(record)}
                                    >
                                        Détails
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );

    const iconButtonStyle = {
        backgroundColor: "#f9fafb",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "13px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    useEffect(() => {
        if (isAddingVisit) {
            setShowForm(true);
        }
    }, [isAddingVisit]);

    return (
        <div
            style={{
                flex: 1,
                display: isMobile ? 'block' : 'flex',
                height: isMobile ? 'auto' : 'calc(100vh - 165px)',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    flex: 1,
                    padding: isMobile ? '15px' : '25px 35px',
                    overflowY: isMobile ? 'visible' : 'auto',
                    overflowX: 'hidden',
                    minWidth: 0
                }}
                className="scrollbar-teal"
            >
                <div className="mt-2">
                    <div className="section-header mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="section-title mb-1">
                                    <span style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#3a8a90',
                                        borderRadius: '50%',
                                        marginRight: '12px'
                                    }}></span>
                                    Détails Dossiers Médicaux {departementName ? `- ${departementName}` : ''}
                                </span>
                                <p className="section-description text-muted mb-0">
                                    {filteredData.length} dossier{filteredData.length > 1 ? 's' : ''} actuellement enregistré{filteredData.length > 1 ? 's' : ''}
                                    {departementName && ` dans ${departementName}`}
                                </p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                {selectedItems.length > 0 && (
                                    <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
                                        <Trash2 size={16} className="me-2" />
                                        Supprimer ({selectedItems.length})
                                    </Button>
                                )}



                                <FontAwesomeIcon
                                    onClick={() => handleFiltersToggle ? handleFiltersToggle(!filtersVisible) : setLocalFiltersVisible(!localFiltersVisible)}
                                    icon={filtersVisible ? faClose : faFilter}
                                    color={filtersVisible ? 'green' : ''}
                                    style={{
                                        cursor: "pointer",
                                        fontSize: "1.9rem",
                                        color: "#2c767c",
                                        marginTop: "1.3%",
                                        marginRight: "8px",
                                    }}
                                />

                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {filtersVisible && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="filters-container"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    padding: '16px 20px',
                                    minHeight: 0
                                }}
                            >
                                {/* Ligne 1: Icône et titre */}
                                <div className="filters-icon-section" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    justifyContent: 'center',
                                    marginLeft: '-8px',
                                    marginRight: '14%',
                                }}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#4a90a4"
                                        strokeWidth="2"
                                        className="filters-icon"
                                    >
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                    </svg>
                                    <span className="filters-title">Filtres</span>
                                </div>

                                {/* Ligne 2: Tous les filtres */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    marginLeft: '10.2%'
                                }}>
                                    {[
                                        {
                                            key: 'startDate',
                                            label: 'Du',
                                            value: mainFilters.startDate,
                                            type: 'date'
                                        },
                                        {
                                            key: 'endDate',
                                            label: 'Au',
                                            value: mainFilters.endDate,
                                            type: 'date'
                                        },
                                        {
                                            key: 'dept',
                                            label: 'Service',
                                            value: mainFilters.dept,
                                            type: 'select',
                                            options: [
                                                { label: 'Production', value: 'Production' },
                                                { label: 'Logistique', value: 'Logistique' }
                                            ],
                                            placeholder: 'Tous les services'
                                        },
                                        {
                                            key: 'status',
                                            label: 'Aptitude',
                                            value: mainFilters.status,
                                            type: 'select',
                                            options: [
                                                { label: 'Apte', value: 'Apte' },
                                                { label: 'Apte avec réserves', value: 'Apte avec réserves' }
                                            ],
                                            placeholder: 'Toutes les aptitudes'
                                        }
                                    ].map((filter, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            margin: 0,
                                            marginRight: '46px'
                                        }}>
                                            <label className="filter-label" style={{
                                                fontSize: '0.9rem',
                                                margin: 0,
                                                marginRight: '-44px',
                                                whiteSpace: 'nowrap',
                                                minWidth: 'auto',
                                                fontWeight: 600,
                                                color: '#2c3e50'
                                            }}>
                                                {filter.label}
                                            </label>

                                            {filter.type === 'select' ? (
                                                <select
                                                    value={filter.value}
                                                    onChange={(e) => setMainFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                                    className="filter-input"
                                                    style={{
                                                        minWidth: 80,
                                                        maxWidth: 110,
                                                        height: 30,
                                                        fontSize: '0.9rem',
                                                        padding: '2px 6px',
                                                        borderRadius: 6
                                                    }}
                                                >
                                                    <option value="">{filter.placeholder}</option>
                                                    {filter.options?.map((option, optIndex) => (
                                                        <option key={optIndex} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="date"
                                                    value={filter.value}
                                                    onChange={(e) => setMainFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                                    className="filter-input"
                                                    style={{
                                                        minWidth: 120,
                                                        height: 30,
                                                        fontSize: '0.9rem',
                                                        padding: '2px 6px',
                                                        borderRadius: 6
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <ExpandRTable
                        columns={columns}
                        data={medicalRecords}
                        filteredData={filteredData}
                        searchTerm={searchQuery}
                        highlightText={(t) => t}
                        selectedItems={selectedItems}
                        selectAll={selectAll}
                        handleSelectAllChange={handleSelectAllChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleEdit={(item) => setSelectedRecord(item)}
                        handleDelete={handleDeleteRecord}
                        rowsPerPage={rowsPerPage}
                        page={currentPage}
                        handleChangePage={(p) => setCurrentPage(p)}
                        handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                        expandedRows={expandedRows}
                        toggleRowExpansion={toggleRowExpansion}
                        renderExpandedRow={renderExpandedRow}
                        renderCustomActions={(item) => (
                            <Button variant="link" className="text-muted p-0" onClick={() => setSelectedRecord(item)}>
                                <Eye size={18} />
                            </Button>
                        )}
                    />
                </div>
            </div>

            {selectedRecord && (
                <GenericSidePanel
                    isOpen={!!selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                    title={`Dossier : ${selectedRecord.name}`}
                    defaultWidth={40}
                    displayMode="inline"
                >
                    <div className="p-3">
                        <div className="d-flex align-items-center gap-4 mb-4 bg-light p-4 rounded-4">
                            <div className="bg-white p-3 rounded-circle shadow-sm">
                                <User size={30} className="text-primary" />
                            </div>
                            <div>
                                <h4 className="fw-black mb-1">{selectedRecord.name}</h4>
                                <Badge bg={selectedRecord.status === 'Apte' ? 'success' : 'warning'}>{selectedRecord.status}</Badge>
                            </div>
                        </div>

                        <Tabs defaultActiveKey="synthesis" className="custom-tabs-sst">
                            <Tab eventKey="synthesis" title="Synthèse" className="pt-3">
                                <Row className="g-3 mb-4">
                                    <Col md={12}>
                                        <Card className="border-0 bg-light p-3 rounded-4">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="extra-small fw-black uppercase">Constantes</span>
                                                <Stethoscope size={14} className="text-primary" />
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                                <div className="d-flex justify-content-between small">
                                                    <span>IMC</span>
                                                    <span className="fw-black">{selectedRecord.vitals.bmi}</span>
                                                </div>
                                                <div className="d-flex justify-content-between small">
                                                    <span>Tension</span>
                                                    <span className="fw-black">{selectedRecord.vitals.bp}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                                <div className="p-3 rounded-4 bg-white border">
                                    <p className="small fst-italic">"{selectedRecord.history[0]?.note}"</p>
                                </div>
                            </Tab>
                            <Tab eventKey="history" title="Historique" className="pt-3">
                                {selectedRecord.history.map((h, idx) => (
                                    <div key={idx} className="border-bottom p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold small">{h.date}</div>
                                                <div className="extra-small text-muted">{h.type}</div>
                                            </div>
                                            <Button variant="light" size="sm" onClick={() => toggleHistoryItem(idx)}>
                                                <ChevronRight size={16} style={{ transform: expandedHistoryItems.includes(idx) ? 'rotate(90deg)' : 'none' }} />
                                            </Button>
                                        </div>
                                        {expandedHistoryItems.includes(idx) && (
                                            <div className="mt-2 p-3 bg-light rounded shadow-sm small">
                                                <div className="fw-bold mb-1">Diagnostic:</div>
                                                <div>{h.diagnosis}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </Tab>
                        </Tabs>
                    </div>
                </GenericSidePanel>
            )}

            <GenericSidePanel
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    if (setIsAddingVisit) setIsAddingVisit(false);
                }}
                title="Nouvelle Visite"
                displayMode="inline"
                showHeader={false}
            >
                <SSTVisitForm
                    onSubmit={(data) => {
                        console.log("Visit created:", data);
                        Swal.fire({
                            title: 'Succès !',
                            text: 'La visite a été programmée pour le ' + data.date + ' à ' + data.time,
                            icon: 'success',
                            confirmButtonColor: '#3a8a90'
                        });
                        setShowForm(false);
                        if (setIsAddingVisit) setIsAddingVisit(false);
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        if (setIsAddingVisit) setIsAddingVisit(false);
                    }}
                />
            </GenericSidePanel>
            <style>
                {`
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.7rem; }
                .custom-tabs-sst .nav-link { font-weight: 900; font-size: 0.7rem; color: #94a3b8; }
                .custom-tabs-sst .nav-link.active { color: #2c767c; border-bottom: 3px solid #2c767c; }
                .section-header { margin: 1%; }
                .section-title { font-size: 19px; font-weight: 600; }
                .btn-primary-custom { background-color: #00afaa; color: white; border-radius: 6px; }
                .main-sub-table th { background-color: #f5f5f5; font-size: 13px; }
                .backe { background-color: #f8f9fa !important; }
                .scrollbar-teal::-webkit-scrollbar { width: 5px; }
                .scrollbar-teal::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .scrollbar-teal::-webkit-scrollbar-thumb { background: #3a8a90; border-radius: 10px; }
                `}
            </style>
        </div>
    );
});

export default SSTMedicalRecords;
