import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Tabs, Tab, Badge } from 'react-bootstrap';
import { History, Activity, FileText, CalendarDays, ArrowRight, Activity as ActivityIcon, Scale, Heart, Filter, ChevronRight } from 'lucide-react';

const SSTPatientDossierPanel = ({ employee, onClose }) => {
    if (!employee) return null;

    const visitHistory = [
        {
            id: 1, date: '12/01/2025', doctor: 'Dr. Martin', type: 'Visite Périodique',
            biometrics: { weight: '74', bp: '120/80', pulse: '70', imc: '24.2' },
            notes: { subjective: 'Patient en bonne santé globale.', assessment: 'Apte au poste.' },
            aptitude: 'Apte'
        },
        {
            id: 2, date: '15/06/2024', doctor: 'Dr. Sarah', type: 'Visite de Reprise',
            biometrics: { weight: '76', bp: '130/85', pulse: '75', imc: '24.8' },
            notes: { subjective: 'Douleurs lombaires légères.', assessment: 'Apte sous réserve (port de charges).' },
            aptitude: 'Restricted'
        },
        {
            id: 3, date: '10/01/2024', doctor: 'Dr. Martin', type: 'Visite d\'Embauche',
            biometrics: { weight: '75', bp: '120/80', pulse: '72', imc: '24.5' },
            notes: { subjective: 'RAS.', assessment: 'Apte.' },
            aptitude: 'Apte'
        }
    ];

    return (
        <Card className="sst-form-container">
            <style>
                {`
                .sst-form-container {
                    border: none;
                    border-radius: 0;
                    background-color: transparent;
                    box-shadow: none;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: visible;
                }

                .sst-form-header {
                    padding: 1.25rem 1.5rem;
                    letter-spacing: 0.5px;
                    margin: 0;
                    background: #f9fafb;
                    border-bottom: 1px solid #e9ecef;
                    flex-shrink: 0;
                }

                .sst-form-header h5 {
                    display: flex;
                    justify-content: center;
                    letter-spacing: 0.2px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #4b5563;
                    margin: 0;
                }

                .sst-form-content {
                    padding: 0;
                    background-color: transparent;
                    flex: 1;
                    overflow-y: auto;
                    min-height: 0;
                }

                .sst-form-footer {
                    padding: 1.25rem 1.5rem;
                    background: #ffffff;
                    border-top: 1px solid #e5e7eb;
                    flex-shrink: 0;
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                .form-section-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    margin: 1.5rem 0 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-secondary-custom {
                    background-color: #f3f4f6;
                    border: 1px solid #d1d5db;
                    color: #4b5563;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    min-width: 120px;
                    transition: all 0.2s ease;
                }

                .custom-tabs-sst .nav-link {
                    border: none;
                    color: #94a3b8;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 1rem 1.5rem;
                }

                .custom-tabs-sst .nav-link.active {
                    color: #00afaa;
                    background: transparent;
                    border-bottom: 2px solid #00afaa;
                }
                `}
            </style>

            <div className="sst-form-header">
                <h5>Dossier Médical : {employee.name}</h5>
            </div>

            <div className="sst-form-content">
                <Tabs defaultActiveKey="history" className="custom-tabs-sst">
                    <Tab eventKey="history" title="Historique & Synthèse" className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4 bg-light p-3 rounded-4">
                            <div className="d-flex align-items-center gap-2">
                                <Filter size={14} className="text-muted" />
                                <span className="extra-small fw-black text-muted uppercase">Période</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Control type="date" size="sm" className="extra-small fw-bold border-0 bg-white shadow-sm" style={{ width: '120px' }} />
                                <ArrowRight size={12} className="text-muted" />
                                <Form.Control type="date" size="sm" className="extra-small fw-bold border-0 bg-white shadow-sm" style={{ width: '120px' }} />
                            </div>
                        </div>

                        <Row className="g-3 mb-4">
                            <Col md={12}>
                                <Card className="border-0 bg-light p-3 rounded-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="extra-small fw-black text-muted uppercase">Dernières constantes</span>
                                        <ActivityIcon size={14} className="text-primary" />
                                    </div>
                                    <div className="d-flex justify-content-around">
                                        <div className="text-center">
                                            <div className="extra-small text-muted mb-1">IMC</div>
                                            <div className="fw-black h6 mb-0">24.2</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="extra-small text-muted mb-1">Tension</div>
                                            <div className="fw-black h6 mb-0">12/8</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="extra-small text-muted mb-1">Pouls</div>
                                            <div className="fw-black h6 mb-0">72</div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <div className="form-section-title">
                            <CalendarDays size={14} /> Historique des Visites
                        </div>
                        <div className="timeline-sst">
                            <div className="d-flex flex-column">
                                {visitHistory.map((visit, index) => (
                                    <div key={visit.id} className="border-bottom p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                                                    {visit.date}
                                                    <Badge bg="light" text="dark" className="border fw-normal extra-small m-0">{visit.doctor}</Badge>
                                                </span>
                                                <span className="extra-small text-muted uppercase tracking-wider">{visit.type}</span>
                                            </div>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                style={{ width: '28px', height: '28px' }}
                                                onClick={() => {
                                                    const details = document.getElementById(`panel-visit-details-${visit.id}`);
                                                    if (details) {
                                                        details.style.display = details.style.display === 'none' ? 'block' : 'none';
                                                    }
                                                }}
                                            >
                                                <ChevronRight size={16} className="text-muted" />
                                            </Button>
                                        </div>

                                        {/* Hidden Details Section */}
                                        <div id={`panel-visit-details-${visit.id}`} style={{ display: 'none' }} className="mt-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="p-3 bg-light rounded-3 border-start border-4 border-primary shadow-sm">
                                                <div className="extra-small text-muted fw-bold uppercase mb-2 d-flex justify-content-between align-items-center">
                                                    <span>Dossier Médical (Résumé)</span>
                                                    <FileText size={12} className="text-primary" />
                                                </div>
                                                <Row className="g-2 text-center mb-3">
                                                    <Col>
                                                        <div className="p-2 bg-white rounded-3 border border-light">
                                                            <div className="extra-small text-muted">IMC</div>
                                                            <div className="fw-black text-primary">{visit.biometrics.imc}</div>
                                                        </div>
                                                    </Col>
                                                    <Col>
                                                        <div className="p-2 bg-white rounded-3 border border-light">
                                                            <div className="extra-small text-muted">TA</div>
                                                            <div className="fw-black text-primary">{visit.biometrics.bp}</div>
                                                        </div>
                                                    </Col>
                                                    <Col>
                                                        <div className="p-2 bg-white rounded-3 border border-light">
                                                            <div className="extra-small text-muted">Pouls</div>
                                                            <div className="fw-black text-primary">{visit.biometrics.pulse}</div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <div className="extra-small text-muted mb-1 pb-1 border-bottom border-light">
                                                    <span className="fw-black text-dark">Notes:</span> {visit.notes.subjective}
                                                </div>
                                                <div className="extra-small text-muted pt-1">
                                                    <span className="fw-black text-dark">Avis:</span> {visit.notes.assessment}
                                                </div>
                                                <div className="text-end mt-2 pt-2 border-top border-light">
                                                    <span className={`badge bg-${visit.aptitude === 'Apte' ? 'success' : 'warning'} bg-opacity-10 text-${visit.aptitude === 'Apte' ? 'success' : 'warning'} border-0 extra-small`}>
                                                        {visit.aptitude === 'Apte' ? 'APTE' : 'APTE SOUS RÉSERVE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="biometrics" title="Biométrie" className="p-4">
                        <div className="form-section-title">
                            <Scale size={14} /> Évolution du Poids
                        </div>
                        <div className="bg-light p-5 rounded-4 text-center text-muted mb-4 extra-small fw-bold uppercase">
                            [Composant Graphique]
                        </div>

                        <div className="form-section-title">
                            <Heart size={14} /> Paramètres Cardiaques
                        </div>
                        <div className="bg-light p-5 rounded-4 text-center text-muted extra-small fw-bold uppercase">
                            [Composant Graphique]
                        </div>
                    </Tab>
                </Tabs>
            </div>

            <div className="sst-form-footer">
                <Button type="button" onClick={onClose} className="btn-secondary-custom">
                    Fermer
                </Button>
            </div>
        </Card>
    );
};

export default SSTPatientDossierPanel;
