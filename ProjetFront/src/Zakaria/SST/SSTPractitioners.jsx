import React, { useState, useEffect } from 'react';
import { Button, Badge, Form, Row, Col } from 'react-bootstrap';
import { User, Mail, Phone, Stethoscope, Briefcase, PlusCircle, UserPlus, FileText, Filter } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faClose, faFilter } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import ExpandRTable from "../Employe/ExpandRTable";
import GenericSidePanel from '../GenericSidePanel';
import SSTPractitionerForm from './SSTPractitionerForm';
import Swal from "sweetalert2";
import { FaPlusCircle } from "react-icons/fa";
import "../Style.css";

const SSTPractitioners = () => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const [practitioners, setPractitioners] = useState([
        { id: 1, name: "Tazi", firstName: "Amine", type: "Externe", specialty: "Généraliste", phone: "06 61 23 45 67", email: "amine.tazi@med.com", status: "Actif", diplome: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { id: 2, name: "Benali", firstName: "Sarah", type: "Employé", specialty: "Travail", phone: "06 63 98 76 54", email: "s.benali@usine.com", status: "Actif" },
        { id: 3, name: "Idrissi", firstName: "Karim", type: "Externe", specialty: "Cardiologue", phone: "06 61 12 12 12", email: "k.idrissi@med.com", status: "En attente" },
    ]);

    const [filteredData, setFilteredData] = useState(practitioners);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showForm, setShowForm] = useState(false);
    const [editingPractitioner, setEditingPractitioner] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [practitionerFilters, setPractitionerFilters] = useState({
        type: '',
        specialty: '',
        status: ''
    });

    // Dynamic configuration of form fields

    useEffect(() => {
        setTitle("Corps Médical & Praticiens");
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions]);

    useEffect(() => {
        let filtered = [...practitioners];

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (practitionerFilters.type) {
            filtered = filtered.filter(p => p.type === practitionerFilters.type);
        }
        if (practitionerFilters.specialty) {
            filtered = filtered.filter(p => p.specialty === practitionerFilters.specialty);
        }
        if (practitionerFilters.status) {
            filtered = filtered.filter(p => p.status === practitionerFilters.status);
        }

        setFilteredData(filtered);
    }, [searchQuery, practitioners, practitionerFilters]);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(p => p.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleEdit = (practitioner) => {
        setEditingPractitioner(practitioner);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Supprimer ce praticien ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler"
        }).then((result) => {
            if (result.isConfirmed) {
                setPractitioners(practitioners.filter(p => p.id !== id));
                Swal.fire("Supprimé !", "Le praticien a été supprimé.", "success");
            }
        });
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: "Supprimer la sélection ?",
            text: `Vous allez supprimer ${selectedItems.length} praticiens.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setPractitioners(practitioners.filter(p => !selectedItems.includes(p.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les praticiens ont été supprimés.", "success");
            }
        });
    };

    const handleSubmit = (formData) => {
        if (editingPractitioner) {
            setPractitioners(practitioners.map(p => p.id === editingPractitioner.id ? { ...p, ...formData } : p));
            Swal.fire("Succès !", "Praticien modifié avec succès.", "success");
        } else {
            const newPractitioner = {
                id: practitioners.length + 1,
                ...formData,
                status: 'En attente'
            };
            setPractitioners([...practitioners, newPractitioner]);
            Swal.fire("Succès !", "Praticien ajouté avec succès.", "success");
        }
        setShowForm(false);
        setEditingPractitioner(null);
    };

    const columns = [
        {
            key: 'practitioner',
            label: 'Praticien',
            render: (item) => (
                <div className="d-flex align-items-center gap-3">
                    {item.photo ? (
                        <img 
                            src={typeof item.photo === 'string' ? item.photo : URL.createObjectURL(item.photo)} 
                            alt={`${item.firstName} ${item.name}`}
                            className="rounded-circle object-fit-cover"
                            style={{ width: '38px', height: '38px' }}
                        />
                    ) : (
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px', backgroundColor: '#e6f4f4', color: '#2c767c' }}>
                            {item.firstName[0]}{item.name[0]}
                        </div>
                    )}
                    <div>
                        <div className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>Dr. {item.firstName} {item.name}</div>
                        <div className="text-muted extra-small">{item.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            render: (item) => (
                <Badge bg={item.type === 'Employé' ? 'info' : 'warning'} className="rounded-pill px-3 py-2 text-uppercase extra-small">
                    {item.type}
                </Badge>
            )
        },
        { key: 'specialty', label: 'Spécialité' },
        { key: 'phone', label: 'Contact' },
        {
            key: 'documents',
            label: 'Documents',
            render: (item) => {
                const otherDocs = Array.isArray(item.otherDocs) ? item.otherDocs : (item.otherDocs ? [item.otherDocs] : []);
                return (
                    <div className="d-flex flex-wrap gap-2">
                        {item.diplome && (
                            <Button 
                                variant="outline-info" 
                                size="sm"
                                className="px-2 py-1 d-flex align-items-center gap-1"
                                title="Voir le diplôme"
                                onClick={() => window.open(typeof item.diplome === 'string' ? item.diplome : URL.createObjectURL(item.diplome), '_blank')}
                            >
                                <FileText size={14} /> <span className="extra-small fw-bold">DIPLÔME</span>
                            </Button>
                        )}
                        {otherDocs.map((doc, index) => (
                            <Button 
                                key={index}
                                variant="outline-secondary" 
                                size="sm"
                                className="px-2 py-1 d-flex align-items-center gap-1"
                                title={`Document ${index + 1}`}
                                onClick={() => window.open(typeof doc === 'string' ? doc : URL.createObjectURL(doc), '_blank')}
                            >
                                <Briefcase size={14} /> <span className="extra-small fw-bold">DOC {index + 1}</span>
                            </Button>
                        ))}
                        {!item.diplome && otherDocs.length === 0 && <span className="text-muted extra-small">Aucun document</span>}
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Statut',
            render: (item) => (
                <Badge bg={item.status === 'Actif' ? 'success' : 'secondary'} className="rounded-pill px-3 py-2 text-uppercase extra-small">
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
                                                Détails Corps Médical
                                            </span>
                                            <p className="section-description text-muted mb-0">
                                                {practitioners.length} praticien{practitioners.length > 1 ? 's' : ''} actuellement référencé{practitioners.length > 1 ? 's' : ''}
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
                                                title="Filtres praticiens"
                                            />
                                            <Button
                                                onClick={() => { setEditingPractitioner(null); setShowForm(true); }}
                                                className="btn-primary-custom d-flex align-items-center"
                                                style={{ height: '45px' }}
                                            >
                                                <FaPlusCircle size={20} className="me-2" />
                                                <span>Ajouter un praticien</span>
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
                                                <Col md={4}>
                                                    <Form.Label className="extra-small fw-bold text-muted uppercase">Type</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={practitionerFilters.type}
                                                        onChange={e => setPractitionerFilters({ ...practitionerFilters, type: e.target.value })}
                                                    >
                                                        <option value="">Tous les types</option>
                                                        <option value="Employé">Employé</option>
                                                        <option value="Externe">Externe</option>
                                                    </Form.Select>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Label className="extra-small fw-bold text-muted uppercase">Spécialité</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={practitionerFilters.specialty}
                                                        onChange={e => setPractitionerFilters({ ...practitionerFilters, specialty: e.target.value })}
                                                    >
                                                        <option value="">Toutes les spécialités</option>
                                                        <option>Généraliste</option>
                                                        <option>Travail</option>
                                                        <option>Cardiologue</option>
                                                    </Form.Select>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Label className="extra-small fw-bold text-muted uppercase">Statut</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={practitionerFilters.status}
                                                        onChange={e => setPractitionerFilters({ ...practitionerFilters, status: e.target.value })}
                                                    >
                                                        <option value="">Tous les statuts</option>
                                                        <option>Actif</option>
                                                        <option>Inactif</option>
                                                        <option>En attente</option>
                                                    </Form.Select>
                                                </Col>
                                            </Row>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <ExpandRTable
                                columns={columns}
                                data={practitioners}
                                filteredData={filteredData}
                                searchTerm={searchQuery}
                                highlightText={(text) => text}
                                selectedItems={selectedItems}
                                selectAll={selectAll}
                                handleSelectAllChange={handleSelectAllChange}
                                handleCheckboxChange={handleCheckboxChange}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleDeleteSelected={handleDeleteSelected}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                handleChangePage={(p) => setPage(p)}
                                handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                            />
                        </div>

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => setShowForm(false)}
                            title={editingPractitioner ? "Modifier Praticien" : "Nouveau Praticien"}
                            displayMode="inline"
                            showHeader={false}
                        >
                            <SSTPractitionerForm
                                initialData={editingPractitioner}
                                onSubmit={handleSubmit}
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

export default SSTPractitioners;
