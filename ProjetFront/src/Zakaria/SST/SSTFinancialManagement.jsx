import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import {
    Users,
    Download,
    Wallet,
    Stethoscope,
    FileText,
    Building2,
    Calendar,
    Upload,
} from 'lucide-react';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { FaPlusCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { faFilter, faGear, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from 'framer-motion';
import ExpandRTable from '../Employe/ExpandRTable';
import GenericSidePanel from '../GenericSidePanel';
import "../Style.css";

const SSTFinancialManagement = () => {
    const { setTitle, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();
    const [activeTab, setActiveTab] = useState('doctors');
    const [showForm, setShowForm] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        doctor: '',
        status: '',
        contractType: '',
        department: ''
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedItems, setSelectedItems] = useState([]);

    // --- DATA ---
    const [doctors, setDoctors] = useState([
        {
            id: 'DOC-001',
            name: 'Dr. Jean Martin',
            contract: 'CDI (Salarié)',
            payment: '4 500 DH / Virement',
            cnss: '23456789 (Part Patr. incl.)',
            service: 'Pôle Médical Casablanca',
            employeesCount: 450,
            sites: 'Casablanca, Rabat'
        },
        {
            id: 'DOC-002',
            name: 'Dr. Sarah Dupont',
            contract: 'Prestation externe',
            payment: '1 500 DH / Visite',
            cnss: '--',
            service: 'Cabinet Externe',
            employeesCount: 120,
            sites: 'Tanger'
        }
    ]);

    const [visitCosts, setVisitCosts] = useState([
        { id: 'VST-101', doctor: 'Dr. Jean Martin', date: '2026-02-15', employees: 12, totalCost: '1 800 DH', status: 'Validé', department: 'Production' },
        { id: 'VST-102', doctor: 'Dr. Sarah Dupont', date: '2026-02-14', employees: 8, totalCost: '1 200 DH', status: 'En attente', department: 'Logistique' },
        { id: 'VST-103', doctor: 'Dr. Jean Martin', date: '2026-02-10', employees: 15, totalCost: '2 250 DH', status: 'Payé', department: 'RH' },
    ]);

    const filteredDoctors = doctors.filter(doc => {
        if (filters.contractType && !doc.contract.includes(filters.contractType)) return false;
        if (filters.department && doc.service !== filters.department) return false;
        return true;
    });

    const filteredVisitCosts = visitCosts.filter(v => {
        if (filters.doctor && v.doctor !== filters.doctor) return false;
        if (filters.status && v.status !== filters.status) return false;
        if (filters.startDate && new Date(v.date) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(v.date) > new Date(filters.endDate)) return false;
        return true;
    });

    useEffect(() => {
        setTitle("Suivi RH & Budget SST");
        return () => clearActions();
    }, [setTitle, clearActions]);

    // --- HANDLERS ---
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3a8a90',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                if (activeTab === 'doctors') {
                    setDoctors(prev => prev.filter(d => d.id !== id));
                } else {
                    setVisitCosts(prev => prev.filter(v => v.id !== id));
                }
                Swal.fire('Supprimé !', 'L\'élément a été supprimé.', 'success');
            }
        });
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditMode(true);
        setShowForm(true);
    };

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        contract: '',
        payment: '',
        service: '',
        amount: 0,
        nbVisits: 0,
        ratePerVisit: 150,
        isFixedRate: false
    });

    const [selectedVisits, setSelectedVisits] = useState([]);
    const [sideFilters, setSideFilters] = useState({
        start: '',
        end: '',
        dept: ''
    });

    const [editMode, setEditMode] = useState(false);

    const handleNewOperation = (doc) => {
        // Extraction du tarif depuis la chaîne (ex: "1 500 DH / Visite" -> 1500)
        const rateMatch = doc.payment.match(/(\d[\d\s]*)/);
        const defaultRate = rateMatch ? parseInt(rateMatch[0].replace(/\s/g, '')) : 150;

        setFormData({
            ...formData,
            doctor: doc.name,
            contract: doc.contract,
            id: `VST-${Math.floor(Math.random() * 1000)}`,
            amount: doc.contract.includes('CDI') ? defaultRate : 0,
            nbVisits: 0,
            ratePerVisit: defaultRate
        });
        setSelectedVisits([]);
        setSideFilters({ start: '', end: '', dept: '' });
        setEditMode(false);
        setShowForm(true);
    };

    const toggleVisitSelection = (v) => {
        setSelectedVisits(prevSelection => {
            const isSelected = prevSelection.find(item => item.id === v.id);
            const newSelection = isSelected
                ? prevSelection.filter(item => item.id !== v.id)
                : [...prevSelection, v];

            // Mise à jour synchrone du formulaire
            setFormData(prevForm => {
                const nb = newSelection.length;

                // Calcul de la somme réelle des coûts des visites sélectionnées
                const totalCalculated = newSelection.reduce((acc, v) => {
                    const price = parseInt(v.totalCost.replace(/[^\d]/g, '')) || 0;
                    return acc + price;
                }, 0);

                return {
                    ...prevForm,
                    nbVisits: nb,
                    amount: totalCalculated
                };
            });
            return newSelection;
        });
    };

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            const allIds = activeTab === 'doctors' ? doctors.map(d => d.id) : visitCosts.map(v => v.id);
            setSelectedItems(allIds);
        } else {
            setSelectedItems([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // --- COLUMNS ---
    const doctorColumns = [
        {
            key: 'name',
            label: 'Médecin',
            render: (doc) => (
                <div className="d-flex align-items-center gap-2 text-dark">
                    <div className="bg-light p-2 rounded-circle text-primary"><Users size={16} /></div>
                    <span className="fw-bold">{doc.name}</span>
                </div>
            )
        },
        { key: 'contract', label: 'Type de contrat' },
        { key: 'payment', label: 'Rémunération' },
        { key: 'service', label: 'Affectation' },

        {
            key: 'actions_custom',
            label: 'Opérations',
            render: (doc) => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-3 d-flex align-items-center gap-1"
                    onClick={() => handleNewOperation(doc)}
                    style={{ fontSize: '0.7rem', fontWeight: '800' }}
                >
                    <FaPlusCircle size={12} /> OPÉRATION
                </Button>
            )
        }
    ];

    const visitColumns = [
        { key: 'id', label: 'Réf.', render: (v) => <span className="text-primary fw-bold">{v.id}</span> },
        { key: 'doctor', label: 'Médecin' },
        { key: 'date', label: 'Date' },
        { key: 'employees', label: 'Effectif', align: 'center' },
        { key: 'totalCost', label: 'Coût', render: (v) => <span className="fw-bold">{v.totalCost}</span> },
        { key: 'status', label: 'Statut', render: (v) => <Badge bg={v.status === 'Payé' ? 'success' : v.status === 'Validé' ? 'info' : 'warning'}>{v.status}</Badge> }
    ];

    return (
        <ThemeProvider theme={createTheme()}>
            <Box className="postionPage" sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: 0, mt: isMobile ? 8 : 10 }}>
                    <div className={isMobile ? "d-block" : "d-flex"} style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                        <div className="scrollbar-teal" style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: isMobile ? '12px' : '2rem'
                        }}>

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
                                            Suivi RH & Budget SST
                                        </span>
                                        <p className="section-description text-muted mb-0">Aperçu simplifié des coûts et contrats</p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <div
                                            className="filter-icon-btn shadow-sm d-flex align-items-center justify-content-center bg-white border cursor-pointer rounded-3"
                                            onClick={() => setFiltersVisible(!filtersVisible)}
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                color: filtersVisible ? '#ff4757' : '#3a8a90',
                                                borderColor: filtersVisible ? '#ff4757' : '#eef2f6'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={filtersVisible ? faClose : faFilter} />
                                        </div>
                                        
                                        <Button variant="outline-secondary" className="bg-white rounded-3 d-flex align-items-center" style={{ height: '45px' }}>
                                            <Download size={18} className="me-2" /> <span>Exporter</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {filtersVisible && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-3 bg-white rounded-4 shadow-sm mb-4 border"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <Row className="g-3">
                                            {activeTab === 'doctors' ? (
                                                <Row className="g-3">
                                                    <Col md={6}>
                                                        <Form.Label className="extra-small fw-bold text-muted uppercase">Type de Contrat</Form.Label>
                                                        <Form.Select
                                                            size="sm"
                                                            className="rounded-3"
                                                            value={filters.contractType}
                                                            onChange={e => setFilters({ ...filters, contractType: e.target.value })}
                                                        >
                                                            <option value="">Tous les contrats</option>
                                                            <option value="CDI">CDI</option>
                                                            <option value="Prestation">Prestation</option>
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Label className="extra-small fw-bold text-muted uppercase">Département</Form.Label>
                                                        <Form.Select
                                                            size="sm"
                                                            className="rounded-3"
                                                            value={filters.department}
                                                            onChange={e => setFilters({ ...filters, department: e.target.value })}
                                                        >
                                                            <option value="">Tous les départements</option>
                                                            {Array.from(new Set(doctors.map(d => d.service))).map(s => <option key={s} value={s}>{s}</option>)}
                                                        </Form.Select>
                                                    </Col>
                                                </Row>
                                            ) : (
                                                <>
                                                    <Col md={3}>
                                                        <Form.Label className="extra-small fw-bold text-muted uppercase">Du</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            size="sm"
                                                            className="rounded-3"
                                                            value={filters.startDate}
                                                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Label className="extra-small fw-bold text-muted uppercase">Au</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            size="sm"
                                                            className="rounded-3"
                                                            value={filters.endDate}
                                                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Label className="extra-small fw-bold text-muted uppercase">Médecin</Form.Label>
                                                        <Form.Select
                                                            size="sm"
                                                            className="rounded-3"
                                                            value={filters.doctor}
                                                            onChange={e => setFilters({ ...filters, doctor: e.target.value })}
                                                        >
                                                            <option value="">Tous les médecins</option>
                                                            {Array.from(new Set(visitCosts.map(v => v.doctor))).map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Label className="extra-small fw-bold text-muted uppercase">Statut</Form.Label>
                                                        <Form.Select
                                                            size="sm"
                                                            className="rounded-3"
                                                            value={filters.status}
                                                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                                                        >
                                                            <option value="">Tous les statuts</option>
                                                            <option value="Payé">Payé</option>
                                                            <option value="Validé">Validé</option>
                                                            <option value="En attente">En attente</option>
                                                        </Form.Select>
                                                    </Col>
                                                </>
                                            )}
                                        </Row>
                                        <div className="d-flex justify-content-end mt-3 border-top pt-2">
                                            <Button
                                                variant="link"
                                                className="text-muted extra-small p-0 fw-bold text-decoration-none"
                                                onClick={() => setFilters({ startDate: '', endDate: '', doctor: '', status: '', contractType: '', department: '' })}
                                            >
                                                Réinitialiser les filtres
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Card className="border-0 shadow-sm rounded-4 p-4 text-dark mb-5">
                                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-tabs-teal">
                                    <Tab eventKey="doctors" title={<span><Users size={16} className="me-2" />Médecins & Contrats</span>}>
                                        <ExpandRTable
                                            columns={doctorColumns}
                                            data={doctors}
                                            filteredData={filteredDoctors}
                                            searchTerm={searchQuery}
                                            page={page}
                                            rowsPerPage={rowsPerPage}
                                            handleChangePage={setPage}
                                            handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                            selectedItems={selectedItems}
                                            handleSelectAllChange={handleSelectAllChange}
                                            handleCheckboxChange={handleCheckboxChange}
                                            handleEdit={handleEdit}
                                            handleDelete={handleDelete}
                                            highlightText={(t) => t}
                                            canEdit={true}
                                            canDelete={true}
                                        />
                                    </Tab>
                                    <Tab eventKey="visits" title={<span><FileText size={16} className="me-2" />Coûts des Visites</span>}>
                                        <ExpandRTable
                                            columns={visitColumns}
                                            data={visitCosts}
                                            filteredData={filteredVisitCosts}
                                            searchTerm={searchQuery}
                                            page={page}
                                            rowsPerPage={rowsPerPage}
                                            handleChangePage={setPage}
                                            handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                            selectedItems={selectedItems}
                                            handleSelectAllChange={handleSelectAllChange}
                                            handleCheckboxChange={handleCheckboxChange}
                                            handleEdit={handleEdit}
                                            handleDelete={handleDelete}
                                            highlightText={(t) => t}
                                            canEdit={true}
                                            canDelete={true}
                                        />
                                    </Tab>
                                    <Tab eventKey="docs" title={<span><Upload size={16} className="me-2" />Justificatifs</span>}>
                                        <div className="p-5 text-center border-2 border-dashed rounded-4 bg-light">
                                            <Upload size={40} className="text-muted mb-3 opacity-25" />
                                            <h6 className="fw-bold">Documents & Factures</h6>
                                            <Button variant="outline-primary" size="sm" className="mt-2 rounded-3">Parcourir les fichiers</Button>
                                        </div>
                                        <div className="mt-4 row g-2">
                                            {['Contrat_Dr_Martin.pdf', 'Facture_Fev_2026.pdf'].map((doc, i) => (
                                                <div key={i} className="col-md-6">
                                                    <div className="p-3 border rounded-3 d-flex align-items-center gap-3 bg-white">
                                                        <FileText size={20} className="text-primary" />
                                                        <div className="extra-small text-truncate fw-bold">{doc}</div>
                                                        <Download size={14} className="ms-auto text-muted cursor-pointer" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Tab>
                                </Tabs>
                            </Card>
                        </div>

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => { setShowForm(false); setEditMode(false); }}
                            title={editMode ? (formData.id ? "Modifier les informations" : "Nouveau Médecin") : `Gestion Paiement : ${formData.doctor}`}
                            displayMode="inline"
                            showHeader={false}
                            footer={
                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="light" className="rounded-3 extra-small fw-bold" onClick={() => { setShowForm(false); setEditMode(false); }}>
                                        Annuler
                                    </Button>
                                    <Button variant="primary" className="rounded-3 extra-small fw-bold px-4" onClick={() => {
                                        setShowForm(false);
                                        setEditMode(false);
                                        Swal.fire('Succès', editMode ? 'Modifié avec succès' : 'Opération enregistrée', 'success');
                                    }}>
                                        {editMode ? "Enregistrer" : "Confirmer le règlement"}
                                    </Button>
                                </div>
                            }
                        >
                            <div className="p-4 text-dark h-100 d-flex flex-column">
                                <div className="mb-4 pb-3 border-bottom">
                                    <h5 className="fw-black mb-1">{editMode ? "Édition des données" : "Nouvelle Opération Financière"}</h5>
                                    <p className="extra-small text-muted mb-0">Remplissez les informations ci-dessous pour valider l'opération.</p>
                                </div>

                                {!editMode && (
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="small fw-bold text-muted uppercase extra-small mb-0 d-flex align-items-center gap-2">
                                                <Calendar size={14} /> Sélection des visites
                                            </h6>
                                            <Badge bg="primary" className="rounded-pill px-2">{selectedVisits.length} sélectionnée(s)</Badge>
                                        </div>

                                        {/* Mini Filtres Interne */}
                                        <div className="bg-light p-2 rounded-3 mb-3 border border-dashed">
                                            <Row className="g-1">
                                                <Col xs={4}>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        className="extra-small border-0"
                                                        value={sideFilters.start}
                                                        onChange={e => setSideFilters({ ...sideFilters, start: e.target.value })}
                                                    />
                                                </Col>
                                                <Col xs={4}>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        className="extra-small border-0"
                                                        value={sideFilters.end}
                                                        onChange={e => setSideFilters({ ...sideFilters, end: e.target.value })}
                                                    />
                                                </Col>
                                                <Col xs={4}>
                                                    <Form.Select
                                                        size="sm"
                                                        className="extra-small border-0"
                                                        value={sideFilters.dept}
                                                        onChange={e => setSideFilters({ ...sideFilters, dept: e.target.value })}
                                                    >
                                                        <option value="">Tous dépts</option>
                                                        {Array.from(new Set(visitCosts.map(v => v.department))).filter(d => d).map(d => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="visits-scroller scrollbar-teal pe-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                            {visitCosts.filter(v => {
                                                if (v.doctor !== formData.doctor) return false;
                                                if (sideFilters.start && new Date(v.date) < new Date(sideFilters.start)) return false;
                                                if (sideFilters.end && new Date(v.date) > new Date(sideFilters.end)) return false;
                                                if (sideFilters.dept && v.department !== sideFilters.dept) return false;
                                                return true;
                                            }).length > 0 ? (
                                                visitCosts.filter(v => {
                                                    if (v.doctor !== formData.doctor) return false;
                                                    if (sideFilters.start && new Date(v.date) < new Date(sideFilters.start)) return false;
                                                    if (sideFilters.end && new Date(v.date) > new Date(sideFilters.end)) return false;
                                                    if (sideFilters.dept && v.department !== sideFilters.dept) return false;
                                                    return true;
                                                }).map(v => (
                                                    <div
                                                        key={v.id}
                                                        className={`p-2 mb-2 border rounded-3 cursor-pointer transition-all d-flex justify-content-between align-items-center ${selectedVisits.find(item => item.id === v.id) ? 'bg-primary bg-opacity-10 border-primary' : 'bg-white'}`}
                                                        onClick={() => toggleVisitSelection(v)}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Form.Check
                                                                type="checkbox"
                                                                size="sm"
                                                                checked={!!selectedVisits.find(item => item.id === v.id)}
                                                                readOnly
                                                            />
                                                            <div>
                                                                <div className="extra-small fw-bold">{v.id} - {v.date}</div>
                                                                <div className="extra-small text-muted">{v.department} • {v.employees} salariés • {v.totalCost}</div>
                                                            </div>
                                                        </div>
                                                        <Badge bg={v.status === 'Payé' ? 'success' : v.status === 'Validé' ? 'info' : 'warning'} className="extra-small">
                                                            {v.status}
                                                        </Badge>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center p-3 border border-dashed rounded-3 text-muted extra-small">
                                                    Aucune visite trouvée avec ces filtres
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Form className="flex-grow-1">
                                    {editMode ? (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Nom du Médecin</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="rounded-3"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Type de Contrat</Form.Label>
                                                <Form.Select
                                                    value={formData.contract}
                                                    onChange={e => setFormData({ ...formData, contract: e.target.value })}
                                                    className="rounded-3"
                                                >
                                                    <option>CDI (Salarié)</option>
                                                    <option>Prestation externe</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Affectation / Service</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.service}
                                                    onChange={e => setFormData({ ...formData, service: e.target.value })}
                                                    className="rounded-3"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Rémunération par défaut</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.payment}
                                                    onChange={e => setFormData({ ...formData, payment: e.target.value })}
                                                    className="rounded-3"
                                                    placeholder="Ex: 1 500 DH / Visite"
                                                />
                                            </Form.Group>

                                            {formData.contract && formData.contract.includes('Prestation') && (
                                                <div className="mb-3 p-3 bg-light rounded-3 border">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Tarif fixe par visite ?"
                                                        checked={formData.isFixedRate}
                                                        onChange={e => setFormData({ ...formData, isFixedRate: e.target.checked })}
                                                        className="small fw-bold mb-2 text-dark"
                                                    />
                                                    {formData.isFixedRate ? (
                                                        <Form.Group className="mt-2">
                                                            <Form.Label className="extra-small text-muted">Montant du Tarif (DH)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                value={formData.ratePerVisit}
                                                                onChange={e => setFormData({ ...formData, ratePerVisit: e.target.value })}
                                                                className="rounded-3"
                                                                size="sm"
                                                            />
                                                        </Form.Group>
                                                    ) : (
                                                        <div className="extra-small text-muted fst-italic">
                                                            Le tarif sera calculé selon la grille des actes (Par défaut: {formData.ratePerVisit} DH)
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Médecin concerné</Form.Label>
                                                <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                                    <span className="small">{formData.doctor}</span>
                                                    <Badge bg="info" className="extra-small">{formData.contract}</Badge>
                                                </div>
                                            </Form.Group>

                                            {formData.contract && formData.contract.includes('Prestation') ? (
                                                <Row className="g-2 mb-3">
                                                    <Col xs={12}>
                                                        <div className="p-3 bg-light rounded-4 border mb-2 d-flex justify-content-between align-items-center">
                                                            <span className="small fw-bold text-muted">Sessions sélectionnées :</span>
                                                            <Badge bg="dark" className="px-3 rounded-pill">{formData.nbVisits} visites</Badge>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} className="mt-2 text-dark font-black">
                                                        <div className="p-3 bg-primary bg-opacity-10 rounded-4 text-center border border-primary border-opacity-25 shadow-sm">
                                                            <span className="extra-small fw-bold text-primary text-uppercase d-block mb-1">Montant Cumulé à régler</span>
                                                            <span className="h4 fw-black text-primary mb-0">{formData.amount} DH</span>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            ) : (
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small fw-bold">Salaire Fixe (DH)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={formData.amount}
                                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                        className="rounded-3 px-3 py-2 fw-bold text-primary"
                                                    />
                                                </Form.Group>
                                            )}

                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Type de Paiement</Form.Label>
                                                <Form.Select className="rounded-3">
                                                    <option>Virement Bancaire</option>
                                                    <option>Chèque</option>
                                                    <option>Mise à disposition</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </>
                                    )}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold">Note / Commentaire</Form.Label>
                                        <Form.Control as="textarea" rows={3} placeholder="Observations particulières..." className="rounded-3 small" />
                                    </Form.Group>
                                </Form>
                            </div>
                        </GenericSidePanel>
                    </div>
                </Box>
            </Box>

            <style>
                {`
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.7rem; }
                .cursor-pointer { cursor: pointer; }
                
                .custom-tabs-teal .nav-link {
                    color: #6c757d;
                    border: none;
                    font-weight: 600;
                    padding: 10px 20px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }

                .custom-tabs-teal .nav-link.active {
                    background-color: #00afaa !important;
                    color: white !important;
                    box-shadow: 0 4px 10px rgba(0, 175, 170, 0.2);
                }

                .section-header { margin-bottom: 25px; }

                .section-title {
                    color: #2c3e50;
                    font-weight: 700;
                    font-size: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-primary-custom {
                    background-color: #00afaa;
                    border: none;
                    font-weight: 600;
                    padding: 10px 20px;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .btn-primary-custom:hover {
                    background-color: #008f8a;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 175, 170, 0.3);
                }
                `}
            </style>
        </ThemeProvider>
    );
};

export default SSTFinancialManagement;
