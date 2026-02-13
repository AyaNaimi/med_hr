import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, ProgressBar, Table } from 'react-bootstrap';
import {
    DollarSign,
    TrendingUp,
    Users,
    Search,
    Download,
    Wallet,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Stethoscope,
    ChevronRight,
    FileText,
    Plus
} from 'lucide-react';
import GenericSidePanel from '../GenericSidePanel';
import SSTPaymentForm from './SSTPaymentForm';
import ExpandRTable from '../Employe/ExpandRTable';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { FaPlusCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import "../Style.css";

const SSTPayments = () => {
    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();

    const initialDoctorPayments = [
        {
            id: 'DOC-001',
            name: 'Dr. Martin',
            specialty: 'Généraliste',
            baseSalary: 4500,
            visitsCount: 124,
            bonusPerVisit: 15,
            extraHours: 12,
            ratePerHour: 45,
            status: 'Validé',
            total: 6900
        },
        {
            id: 'DOC-002',
            name: 'Dr. Dupont',
            specialty: 'Médecine du travail',
            baseSalary: 5200,
            visitsCount: 98,
            bonusPerVisit: 20,
            extraHours: 8,
            ratePerHour: 55,
            status: 'En attente',
            total: 7600
        },
        {
            id: 'DOC-003',
            name: 'Dr. Leroy',
            specialty: 'Psychologue',
            baseSalary: 3800,
            visitsCount: 145,
            bonusPerVisit: 12,
            extraHours: 0,
            ratePerHour: 40,
            status: 'Validé',
            total: 5540
        }
    ];

    const [doctorPayments, setDoctorPayments] = useState(initialDoctorPayments);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(doctorPayments[0]);
    const [filteredData, setFilteredData] = useState(doctorPayments);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        setTitle("Honoraires SST");
        return () => {
            clearActions();
        };
    }, [setTitle, clearActions]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = doctorPayments.filter(d =>
                d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(doctorPayments);
        }
    }, [searchQuery, doctorPayments]);

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedItems(filteredData.map(d => d.id));
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
            text: `Vous allez supprimer ${selectedItems.length} déclarations.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Supprimer"
        }).then((result) => {
            if (result.isConfirmed) {
                setDoctorPayments(doctorPayments.filter(d => !selectedItems.includes(d.id)));
                setSelectedItems([]);
                setSelectAll(false);
                Swal.fire("Supprimé", "Les honoraires ont été supprimés.", "success");
            }
        });
    };

    const totalPayout = doctorPayments.reduce((sum, d) => sum + d.total, 0);

    const activityData = doctorPayments.map(d => ({
        doctor: d.name,
        visits: d.visitsCount,
        earnings: d.total
    }));

    const columns = [
        {
            key: 'doctor',
            label: 'Médecin',
            render: (item) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-light text-muted d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                        {item.name.split(' ').pop()[0]}
                    </div>
                    <div>
                        <div className="fw-bold small">{item.name}</div>
                        <div className="extra-small text-muted uppercase">{item.specialty}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'visitsCount',
            label: 'Actes',
            render: (item) => (
                <div className="text-center">
                    <Badge bg="light" text="dark" className="border px-2 py-1 font-black">{item.visitsCount}</Badge>
                </div>
            )
        },
        {
            key: 'extraHours',
            label: 'Heures Sup',
            render: (item) => (
                <div className="text-center">
                    <span className="small fw-bold">{item.extraHours > 0 ? `+${item.extraHours}h` : '--'}</span>
                </div>
            )
        },
        {
            key: 'calcul',
            label: 'Calcul',
            render: (item) => (
                <div className="bg-light p-2 rounded extra-small border border-secondary border-opacity-10 d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between text-muted">
                        <span>Base</span>
                        <span className="fw-bold">{item.baseSalary}€</span>
                    </div>
                    <div className="d-flex justify-content-between text-success">
                        <span>Prime act.</span>
                        <span className="fw-bold">+{item.visitsCount * item.bonusPerVisit}€</span>
                    </div>
                </div>
            )
        },
        {
            key: 'total',
            label: 'Total Brut',
            render: (item) => (
                <div className="text-end">
                    <div className="fw-black text-primary">{item.total.toLocaleString()}€</div>
                    <Badge bg={item.status === 'Validé' ? 'success' : 'warning'} style={{ fontSize: '0.6rem' }}>{item.status.toUpperCase()}</Badge>
                </div>
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
                                                Détails Honoraires SST
                                            </span>
                                            <p className="section-description text-muted mb-0">
                                                Gestion des paiements médecins et variables d'activité
                                            </p>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button
                                                onClick={() => setShowForm(true)}
                                                className="btn-primary-custom d-flex align-items-center"
                                                style={{ height: '45px' }}
                                            >
                                                <FaPlusCircle size={20} className="me-2" />
                                                <span>Déclarer Honoraires</span>
                                            </Button>
                                            <Button variant="outline-secondary" className="bg-white rounded-3 d-flex align-items-center" style={{ height: '45px' }}>
                                                <Download size={18} className="me-2" /> <span>Exporter</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Row className="mb-4 g-4 text-dark">
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                        <div className="d-flex justify-content-between mb-3 text-dark">
                                            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                                                <Wallet size={24} />
                                            </div>
                                            <Badge bg="success" className="rounded-pill p-2 px-3">+12.5%</Badge>
                                        </div>
                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-1">Masse Salariale Prévue</p>
                                        <h3 className="fw-black mb-2">{totalPayout.toLocaleString()}€</h3>
                                        <p className="extra-small text-muted fw-bold"><Clock size={12} /> Échéance : 28 Fév. 2026</p>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-dark">
                                        <div className="d-flex justify-content-between mb-3 text-dark">
                                            <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
                                                <Stethoscope size={24} />
                                            </div>
                                        </div>
                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-1">Total Actes / Visites</p>
                                        <h3 className="fw-black mb-2">367 actes</h3>
                                        <p className="extra-small text-muted fw-bold">Moyenne: 122 act./médecin</p>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-dark">
                                        <div className="d-flex justify-content-between mb-3 text-dark">
                                            <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info">
                                                <Users size={24} />
                                            </div>
                                        </div>
                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-1">Médecins Actifs</p>
                                        <h3 className="fw-black mb-2">{doctorPayments.length}</h3>
                                        <p className="extra-small text-muted fw-bold">Dossiers validés</p>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="border-0 shadow-none rounded-4 p-4 bg-dark text-white shadow-lg h-100">
                                        <div className="d-flex justify-content-between mb-3 text-dark">
                                            <div className="p-2 rounded-3 bg-white bg-opacity-10">
                                                <ArrowUpRight size={24} />
                                            </div>
                                        </div>
                                        <p className="extra-small fw-black text-white-50 uppercase tracking-widest mb-1 text-white">Économie Prévue</p>
                                        <h3 className="fw-black mb-2">-480€</h3>
                                        <p className="extra-small text-white-50 fw-bold">Vs mois dernier</p>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-4">
                                <Col lg={8}>
                                    <ExpandRTable
                                        columns={columns}
                                        data={doctorPayments}
                                        filteredData={filteredData}
                                        searchTerm={searchQuery}
                                        highlightText={(text) => text}
                                        selectedItems={selectedItems}
                                        selectAll={selectAll}
                                        handleSelectAllChange={handleSelectAllChange}
                                        handleCheckboxChange={handleCheckboxChange}
                                        handleEdit={(doc) => setSelectedDoctor(doc)}
                                        handleDelete={() => { }}
                                        handleDeleteSelected={handleDeleteSelected}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        handleChangePage={(p) => setPage(p)}
                                        handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                    />
                                </Col>

                                <Col lg={4}>
                                    <Card className="border-0 shadow-sm rounded-4 p-5 mb-4 position-relative overflow-hidden text-dark">
                                        <div className="position-absolute top-0 end-0 p-5 opacity-5 text-dark"><TrendingUp size={150} /></div>
                                        <div className="position-relative text-dark">
                                            <h6 className="fw-black uppercase small tracking-widest mb-4 d-flex align-items-center gap-2">
                                                <TrendingUp size={16} className="text-primary" /> Volume d'Activité
                                            </h6>
                                            <div className="h-100" style={{ height: '250px' }}>
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <BarChart data={activityData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis
                                                            dataKey="doctor"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                                        />
                                                        <YAxis hide />
                                                        <RechartsTooltip
                                                            cursor={{ fill: '#f8fafc' }}
                                                            content={({ active, payload }) => {
                                                                if (active && payload && payload.length) {
                                                                    return (
                                                                        <div className="bg-dark text-white p-3 rounded-4 shadow-lg border-0">
                                                                            <p className="extra-small fw-black text-white-50 uppercase mb-1">{payload[0].payload.doctor}</p>
                                                                            <p className="fw-black mb-0 text-white">{payload[0].value.toLocaleString()}€</p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                        <Bar dataKey="earnings" radius={[10, 10, 0, 0]} barSize={40}>
                                                            {activityData.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={selectedDoctor?.name === entry.doctor ? '#2c767c' : '#f1f5f9'}
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-4 pt-4 border-top">
                                                {selectedDoctor && (
                                                    <div className="p-4 rounded-4 bg-light border border-secondary border-opacity-10 mb-4 ">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="extra-small fw-black text-muted uppercase">Sél. Actuelle</span>
                                                            <span className="extra-small fw-black text-success uppercase text-success">A Payé</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-end text-dark">
                                                            <span className="fw-black">{selectedDoctor.name}</span>
                                                            <div className="text-end">
                                                                <div className="h4 fw-black mb-0">{selectedDoctor.total.toLocaleString()}€</div>
                                                                <div className="extra-small text-muted fw-bold">BRUT ESTIMÉ</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <Button variant="primary" className="w-100 rounded-3 py-3 fw-black text-uppercase small shadow-lg">
                                                    <Download size={16} className="me-2" /> Fiche de Paie
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        <GenericSidePanel
                            isOpen={showForm}
                            onClose={() => setShowForm(false)}
                            title="Déclarer Honoraires / Paiement"
                            displayMode="inline"
                            showHeader={false}
                        >
                            <SSTPaymentForm
                                onSubmit={(data) => {
                                    console.log("Paiement ajouté:", data);
                                    setShowForm(false);
                                    Swal.fire("Enregistré", "Le paiement a été déclaré avec succès.", "success");
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

export default SSTPayments;
