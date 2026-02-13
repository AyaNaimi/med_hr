import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, Tabs, Tab, ProgressBar, Table } from 'react-bootstrap';
import {
    Paperclip,
    Eye,
    Search,
    User,
    FileText,
    ChevronRight,
    Activity,
    Heart,
    Scale,
    Stethoscope,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    Plus,
    XCircle,
    Download
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faClose, faFilter, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import GenericSidePanel from '../GenericSidePanel';
import SSTMedicalRecordForm from './SSTMedicalRecordForm';
import ExpandRTable from '../Employe/ExpandRTable';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Swal from "sweetalert2";
import { FaPlusCircle } from "react-icons/fa";
import "../Style.css";

const SSTMedicalRecords = () => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [medicalRecords, setMedicalRecords] = useState([
        {
            id: 'E002',
            name: 'Marie Martin',
            dept: 'Production',
            lastVisit: '2025-12-10',
            status: 'Apte',
            vitals: {
                weight: '65kg',
                height: '168cm',
                bmi: '23.0',
                bp: '12/8',
                pulse: '72',
                statu: 'normal'
            },
            files: [
                { name: 'Bilan sanguin.pdf', date: '2025-12-10', type: 'Laboratoire', size: '1.2 MB' },
                { name: 'Arrêt maladie 2025.pdf', date: '2025-06-15', type: 'Certificat', size: '0.8 MB' },
            ],
            history: [
                { 
                    date: '2025-12-10', 
                    type: 'Visite médicale périodique', 
                    note: 'Examen standard. Tout est normal. Vision ok.', 
                    doctor: 'Dr. Martin',
                    details: {
                        weight: '65',
                        height: '168',
                        bmi: '23.0',
                        bp: '12/8',
                        pulse: '72',
                        temperature: '37.0',
                    },
                    diagnosis: 'Apte au poste. Rien à signaler.',
                    prescription: 'Aucune',
                },
                { 
                    date: '2025-06-15', 
                    type: 'Arrêt maladie', 
                    note: 'Grippe saisonnière severe.', 
                    doctor: 'Dr. Dupont',
                    details: {
                        weight: '64',
                        height: '168',
                        bmi: '22.7',
                        bp: '13/8',
                        pulse: '88',
                        temperature: '39.2',
                    },
                    diagnosis: 'Syndrome grippal avéré.',
                    prescription: 'Paracétamol, Repos 5 jours.',
                },
            ],
            allergies: ['Pénicilline'],
            riskFactors: ['Travail sur écran', 'Stress'],
        },
        {
            id: 'E015',
            name: 'Luc Lefebvre',
            dept: 'Logistique',
            lastVisit: '2026-01-05',
            status: 'Apte avec réserves',
            vitals: {
                weight: '88kg',
                height: '175cm',
                bmi: '28.7',
                bp: '14/9',
                pulse: '78',
                statu: 'warning'
            },
            files: [
                { name: 'Certificat aptitude.pdf', date: '2026-01-05', type: 'Administratif', size: '0.5 MB' },
            ],
            history: [
                { 
                    date: '2026-01-05', 
                    type: 'Visite d\'embauche', 
                    note: 'Restriction port de charges > 10kg.', 
                    doctor: 'Dr. Martin',
                    details: {
                        weight: '88',
                        height: '175',
                        bmi: '28.7',
                        bp: '14/9',
                        pulse: '78',
                        temperature: '36.8',
                    },
                    diagnosis: 'Surpoids modéré, hypertension légère.',
                    prescription: 'Surveillance TA, Régime hyposodé.',
                },
            ],
            allergies: [],
             riskFactors: ['Manutention manuelle', 'bruit'],
        },
    ]);

    const [selected, setSelected] = useState(null);
    const [filteredData, setFilteredData] = useState(medicalRecords);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showForm, setShowForm] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [expandedHistoryItems, setExpandedHistoryItems] = useState([]);

    useEffect(() => {
        if (selected) {
            setExpandedHistoryItems([]);
        }
    }, [selected]);

    const toggleHistoryItem = (index) => {
        setExpandedHistoryItems(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const toggleRowExpansion = (rowId) => {
        setExpandedRows(prev =>
            prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
        );
    };

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
    }, [searchQuery, medicalRecords, mainFilters]);

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

    return (
        <ThemeProvider theme={createTheme()}>
            <Box className="postionPage" sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 0, mt: isMobile ? 8 : 10 }}>
                    <div className={isMobile ? "d-block" : "d-flex h-100"} style={{ position: 'relative', minHeight: 'calc(100vh - 120px)' }}>
                        <div style={{ flex: 1, padding: isMobile ? '12px' : '2rem' }}>
                            <div className="mt-4">
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
                                                Détails Dossiers Médicaux
                                            </span>
                                            <p className="section-description text-muted mb-0">
                                                {medicalRecords.length} dossier{medicalRecords.length > 1 ? 's' : ''} actuellement enregistré{medicalRecords.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon
                                                onClick={() => setFiltersVisible(!filtersVisible)}
                                                icon={filtersVisible ? faClose : faGear}
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: "1.9rem",
                                                    color: filtersVisible ? "#ff4757" : "#2c767c",
                                                    marginRight: "15px",
                                                }}
                                                title="Filtres de dossiers"
                                            />
                                            <Button
                                                onClick={() => setShowForm(true)}
                                                className="btn-primary-custom d-flex align-items-center"
                                                style={{ height: '45px' }}
                                            >
                                                <FaPlusCircle size={20} className="me-2" />
                                                <span>Nouvelle Visite</span>
                                            </Button>
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
                                            className="filters-container mb-4"
                                            style={{
                                                background: '#f8fafc',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                                <FontAwesomeIcon icon={faFilter} className="text-primary" />
                                                <span className="fw-bold text-dark">Filtres de recherche</span>
                                            </div>
                                            <Row className="g-3">
                                                <Col md={3}>
                                                    <Form.Label className="extra-small fw-bold text-muted uppercase">Période du</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        value={mainFilters.startDate}
                                                        onChange={e => setMainFilters({ ...mainFilters, startDate: e.target.value })}
                                                    />
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Label className="extra-small fw-bold text-muted uppercase">Au</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        value={mainFilters.endDate}
                                                        onChange={e => setMainFilters({ ...mainFilters, endDate: e.target.value })}
                                                    />
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Label className="extra-small fw-bold text-muted uppercase">Service</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={mainFilters.dept}
                                                        onChange={e => setMainFilters({ ...mainFilters, dept: e.target.value })}
                                                    >
                                                        <option value="">Tous les services</option>
                                                        <option>Production</option>
                                                        <option>Logistique</option>
                                                        <option>RH</option>
                                                    </Form.Select>
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Label className="extra-small fw-bold text-muted uppercase">Statut d'Aptitude</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={mainFilters.status}
                                                        onChange={e => setMainFilters({ ...mainFilters, status: e.target.value })}
                                                    >
                                                        <option value="">Tous les statuts</option>
                                                        <option value="Apte">Apte</option>
                                                        <option value="Apte avec réserves">Apte avec réserves</option>
                                                        <option value="Inapte">Inapte</option>
                                                    </Form.Select>
                                                </Col>
                                            </Row>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <ExpandRTable
                                columns={columns}
                                data={medicalRecords}
                                filteredData={filteredData}
                                searchTerm={searchQuery}
                                highlightText={(text) => text}
                                selectedItems={selectedItems}
                                selectAll={selectAll}
                                handleSelectAllChange={handleSelectAllChange}
                                handleCheckboxChange={handleCheckboxChange}
                                handleEdit={(item) => setSelected(item)}
                                handleDelete={() => { }}
                                handleDeleteSelected={handleDeleteSelected}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                handleChangePage={(p) => setPage(p)}
                                handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                expandedRows={expandedRows}
                                toggleRowExpansion={toggleRowExpansion}
                                renderExpandedRow={(record) => (
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
                                                                    onClick={() => setSelected(record)}
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
                                )}
                                renderCustomActions={(item) => (
                                    <Button variant="link" className="text-muted p-0 hover-text-primary transition-all" onClick={() => setSelected(item)}>
                                        <Eye size={18} />
                                    </Button>
                                )}
                            />
                        </div>

                        {selected && (
                            <GenericSidePanel
                                isOpen={!!selected}
                                onClose={() => setSelected(null)}
                                title={`Dossier : ${selected.name}`}
                                defaultWidth={40}
                                displayMode="inline"
                            >
                                <div className="p-1">
                                    <div className="d-flex align-items-center gap-4 mb-4 bg-light p-4 rounded-4 border border-secondary border-opacity-10">
                                        <div className="bg-white p-3 rounded-circle shadow-sm" style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={30} className="text-primary" />
                                        </div>
                                        <div className='text-dark'>
                                            <h4 className="fw-black mb-1">{selected.name}</h4>
                                            <div className="d-flex gap-2 align-items-center">
                                                <Badge bg={selected.status === 'Apte' ? 'success' : 'warning'} className="rounded-pill px-2 py-1 uppercase extra-small">{selected.status}</Badge>
                                                <span className="extra-small text-muted fw-bold">ID: {selected.id} • {selected.dept}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Tabs defaultActiveKey="synthesis" className="mb-4 custom-tabs-sst">
                                        <Tab eventKey="synthesis" title="Synthèse" className="pt-3">
                                            <div className="d-flex align-items-center justify-content-between mb-4 bg-light p-3 rounded-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Filter size={14} className="text-muted" />
                                                    <span className="extra-small fw-black text-muted uppercase">Période Historique</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Form.Control type="date" size="sm" className="extra-small fw-bold border-0 bg-white shadow-sm" style={{ width: '120px' }} />
                                                    <Form.Control type="date" size="sm" className="extra-small fw-bold border-0 bg-white shadow-sm" style={{ width: '120px' }} />
                                                </div>
                                            </div>

                                            <Row className="g-3 mb-4">
                                                <Col md={6}>
                                                    <Card className="border-0 bg-light p-3 rounded-4 text-dark h-100">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="extra-small fw-black text-muted uppercase">Constantes</span>
                                                            <Stethoscope size={14} className="text-primary" />
                                                        </div>
                                                        <div className="d-flex flex-column gap-2 text-dark mt-1">
                                                            <div className="d-flex justify-content-between align-items-center small text-dark pb-1 border-bottom border-light">
                                                                <span className="text-muted d-flex align-items-center gap-2"><Scale size={12} /> IMC</span>
                                                                <span className="fw-black bg-white px-2 py-1 rounded shadow-sm">{selected.vitals.bmi}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center small text-dark pb-1 border-bottom border-light">
                                                                <span className="text-muted d-flex align-items-center gap-2"><Heart size={12} /> Tension</span>
                                                                <span className="fw-black bg-white px-2 py-1 rounded shadow-sm">{selected.vitals.bp}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center small text-dark">
                                                                <span className="text-muted d-flex align-items-center gap-2"><Activity size={12} /> Pouls</span>
                                                                <span className="fw-black bg-white px-2 py-1 rounded shadow-sm">{selected.vitals.pulse} <span className="extra-small text-muted fw-normal">BPM</span></span>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </Col>
                                                <Col md={6}>
                                                    <Card className="border-0 bg-light p-3 rounded-4 h-100">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="extra-small fw-black text-muted uppercase">Contexte Médical</span>
                                                            <AlertCircle size={14} className="text-warning" />
                                                        </div>
                                                        <div className="d-flex flex-column gap-2 flex-grow-1 justify-content-center">
                                                            {selected.allergies && selected.allergies.length > 0 && (
                                                                <div className="d-flex align-items-start gap-2">
                                                                     <span className="badge bg-danger bg-opacity-10 text-danger border-0 extra-small mt-1">Allergies</span>
                                                                     <div className="small fw-bold text-dark">{selected.allergies.join(', ')}</div>
                                                                </div>
                                                            )}
                                                            {selected.riskFactors && selected.riskFactors.length > 0 && (
                                                                <div className="d-flex align-items-start gap-2">
                                                                     <span className="badge bg-warning bg-opacity-10 text-warning border-0 extra-small mt-1">Risques</span>
                                                                     <div className="small fw-bold text-dark">{selected.riskFactors.join(', ')}</div>
                                                                </div>
                                                            )}
                                                            {selected.status !== 'Apte' && (
                                                                <div className="d-flex align-items-start gap-2">
                                                                    <span className="badge bg-dark bg-opacity-10 text-dark border-0 extra-small mt-1">Aptitude</span>
                                                                    <div className="extra-small fw-bold text-danger">Restriction : Pas de port de charges.</div>
                                                                </div>
                                                            )}
                                                             {(!selected.allergies?.length && !selected.riskFactors?.length && selected.status === 'Apte') && (
                                                                <div className="extra-small text-muted text-center fst-italic">Aucun antécédent particulier.</div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                </Col>
                                            </Row>
                                            <h6 className="fw-black extra-small uppercase text-muted mb-3 opacity-50">Dernière Observation</h6>
                                            <div className="p-3 rounded-4 bg-white border border-secondary border-opacity-10 shadow-sm">
                                                <p className="small fst-italic text-secondary mb-2">"{selected.history[0]?.note || 'Aucune observation'}"</p>
                                                <div className="extra-small text-muted fw-bold text-end">Par {selected.history[0]?.doctor || 'N/A'} le {selected.history[0]?.date || 'N/A'}</div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="documents" title={`Documents (${selected.files.length})`} className="pt-3">
                                            <div className="d-flex flex-column gap-2">
                                                {selected.files.map((file, idx) => (
                                                    <div key={idx} className="p-3 bg-light rounded-4 d-flex align-items-center justify-content-between hover-bg-white transition-all border border-transparent hover-border-secondary hover-border-opacity-10">
                                                        <div className="d-flex align-items-center gap-3 text-dark">
                                                            <div className="p-2 rounded-3 bg-white shadow-sm "><FileText size={16} /></div>
                                                            <div className='text-dark'>
                                                                <div className="small fw-bold text-dark">{file.name}</div>
                                                                <div className="extra-small text-muted">{file.type} • {file.date}</div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-1">
                                                            <Button variant="light" size="sm" className="text-primary rounded-circle p-2" title="Voir"><Eye size={16} /></Button>
                                                            <Button variant="light" size="sm" className="text-muted rounded-circle p-2" title="Télécharger"><Download size={16} /></Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Tab>
                                        <Tab eventKey="history" title="Historique" className="pt-3">
                                            <div className="d-flex flex-column">
                                                {selected.history.map((h, idx) => {
                                                    const details = h.details || {};
                                                    
                                                    return (
                                                        <div key={idx} className="border-bottom p-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <div className="d-flex flex-column">
                                                                    <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                                                                        {h.date}
                                                                        <Badge bg="light" text="dark" className="border fw-normal extra-small m-0">{h.doctor}</Badge>
                                                                    </span>
                                                                    <span className="extra-small text-muted uppercase tracking-wider">{h.type}</span>
                                                                </div>
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                                    style={{ width: '28px', height: '28px' }}
                                                                    onClick={() => toggleHistoryItem(idx)}
                                                                >
                                                                    <ChevronRight 
                                                                        size={16} 
                                                                        className={`text-muted transition-transform duration-200 ${expandedHistoryItems.includes(idx) ? 'rotate-90' : ''}`}
                                                                        style={{ transform: expandedHistoryItems.includes(idx) ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                                                                    />
                                                                </Button>
                                                            </div>

                                                            {/* Hidden Details Section */}
                                                            {expandedHistoryItems.includes(idx) && (
                                                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                                                <div className="p-3 bg-light rounded-3 border-start border-4 border-primary shadow-sm">
                                                                    <div className="extra-small text-muted fw-bold uppercase mb-2 d-flex justify-content-between align-items-center">
                                                                        <span>Détail de la Visite</span>
                                                                        <FileText size={12} className="text-primary" />
                                                                    </div>
                                                                    {/* Constantes */}
                                                                    <div className="mb-3">
                                                                        <div className="extra-small px-1 mb-1 fw-bold text-secondary text-uppercase d-flex align-items-center gap-2">
                                                                            <Activity size={10} /> Constantes Vitales
                                                                        </div>
                                                                        <div className="bg-white p-2 rounded-3 border border-light">
                                                                        <Row className="g-2 text-center">
                                                                            <Col xs={3} className="border-end border-light">
                                                                                <div className="h-100 d-flex flex-column justify-content-center">
                                                                                    <div className="extra-small text-muted mb-0">Poids</div>
                                                                                    <div className="fw-black text-dark">{details.weight || '-'} <span className="extra-small fw-normal">kg</span></div>
                                                                                </div>
                                                                            </Col>
                                                                            <Col xs={3} className="border-end border-light">
                                                                                <div className="h-100 d-flex flex-column justify-content-center">
                                                                                    <div className="extra-small text-muted mb-0">IMC</div>
                                                                                    <div className="fw-black text-primary">{details.bmi || '-'}</div>
                                                                                </div>
                                                                            </Col>
                                                                            <Col xs={3} className="border-end border-light">
                                                                                <div className="h-100 d-flex flex-column justify-content-center">
                                                                                    <div className="extra-small text-muted mb-0">TA</div>
                                                                                    <div className="fw-black text-dark">{details.bp || '-'}</div>
                                                                                </div>
                                                                            </Col>
                                                                            <Col xs={3}>
                                                                                <div className="h-100 d-flex flex-column justify-content-center">
                                                                                    <div className="extra-small text-muted mb-0">Pouls</div>
                                                                                    <div className="fw-black text-dark">{details.pulse || '-'}</div>
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Detailed Text Sections */}
                                                                    <div className="d-flex flex-column gap-2">
                                                                        {h.diagnosis && (
                                                                            <div className="bg-white p-3 rounded-3 border border-light shadow-sm">
                                                                                <div className="extra-small text-secondary fw-bold mb-1 border-bottom pb-1 text-uppercase d-flex align-items-center gap-2">
                                                                                    <Stethoscope size={10} /> Diagnostic & Conclusions
                                                                                </div>
                                                                                <div className="small text-dark fw-bold mt-2">{h.diagnosis}</div>
                                                                                <div className="extra-small text-muted fst-italic mt-1">{h.note}</div>
                                                                            </div>
                                                                        )}

                                                                        {h.prescription && h.prescription !== 'Aucune' && (
                                                                            <div className="bg-white p-3 rounded-3 border-start border-4 border-warning shadow-sm">
                                                                                 <div className="extra-small text-warning fw-bold mb-1 text-uppercase d-flex align-items-center gap-2">
                                                                                    <FileText size={10} /> Traitement
                                                                                </div>
                                                                                <div className="small text-dark mt-1">{h.prescription}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </div>
                            </GenericSidePanel>
                        )}

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => setShowForm(false)}
                            title="Nouvelle Visite Médicale"
                            displayMode="inline"
                            showHeader={false}
                        >
                            <SSTMedicalRecordForm
                                onSubmit={(data) => {
                                    console.log("Visite programmée:", data);
                                    setShowForm(false);
                                    Swal.fire("Succès", "Visite programmée avec succès.", "success");
                                }}
                                onCancel={() => setShowForm(false)}
                            />
                        </GenericSidePanel>
                    </div>
                </Box>
            </Box>
            <style>
                {`
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.7rem; }
                .badge { font-weight: 700; letter-spacing: 0.05em; }
                .custom-tabs-sst .nav-link { 
                    border: none; 
                    font-weight: 900; 
                    text-transform: uppercase; 
                    font-size: 0.7rem; 
                    letter-spacing: 1px;
                    color: #94a3b8;
                    padding: 1rem 1.5rem;
                }
                .custom-tabs-sst .nav-link.active { 
                    background: transparent; 
                    color: #2c767c; 
                    border-bottom: 3px solid #2c767c; 
                }

                .section-header {
                    border-bottom: none;
                    padding-bottom: 15px;
                    margin: 0.5% 1% 1%;
                }

                .section-title {
                    color: #2c3e50;
                    font-weight: 600;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    font-size: 19px;
                }

                .section-title i {
                    color: rgba(8, 179, 173, 0.02) !important;
                    background: #3a8a90 !important;
                    padding: 6px !important;
                    border-radius: 60% !important;
                    margin-right: 10px !important;
                }

                .section-description {
                    color: #6c757d;
                    font-size: 16px;
                    margin-bottom: 0;
                }

                /* Custom Button Styles */
                .btn-primary-custom {
                    background-color: #00afaa !important;
                    border: 1px solid #00afaa !important;
                    color: white !important;
                    padding: 0.75rem 1.5rem !important;
                    border-radius: 6px !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                .btn-primary-custom:hover {
                    background-color: #009691 !important;
                }

                .expanded-row-container {
                    padding: 20px;
                    background-color: #f8fbfa;
                    border-bottom: 2px solid #e0e6e9;
                }

                .sub-table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .sub-table-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                }

                .sub-table-badge {
                    background-color: #e8f4f4;
                    color: #3a8a90;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .main-sub-table {
                    background: white;
                    border: 1px solid #edf2f7;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .main-sub-table thead th {
                    background-color: #f1f5f9 !important;
                    color: #64748b !important;
                    font-size: 11px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    font-weight: 700 !important;
                    padding: 12px 15px !important;
                    border: none !important;
                }

                .main-sub-table tbody td {
                    padding: 12px 15px !important;
                    vertical-align: middle !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    font-size: 13px !important;
                }

                .main-sub-table tbody tr:hover {
                    background-color: #f8fafc !important;
                }

                .backe {
                    background-color: #f1f5f9 !important;
                }
                
                .btn-secondary-custom {
                    background-color: #f3f4f6 !important;
                    border: 1px solid #d1d5db !important;
                    color: #4b5563 !important;
                    padding: 0.75rem 1.5rem !important;
                    border-radius: 6px !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                .btn-secondary-custom:hover {
                    background-color: #e5e7eb !important;
                }
                
                /* Override DynamicForm button styles if needed */
                .btn-submit-dynamic {
                    background-color: #00afaa !important;
                    border: none !important;
                }
                `}
            </style>
        </ThemeProvider>
    );
};

export default SSTMedicalRecords;
