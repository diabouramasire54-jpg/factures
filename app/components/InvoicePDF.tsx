import { Invoice, Totals } from '@/type'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine, Layers } from 'lucide-react'
import React, { useRef } from 'react'

interface FacturePDFProps {
    invoice: Invoice
    totals: Totals
}

function formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options).toUpperCase();
}

const InvoicePDF: React.FC<FacturePDFProps> = ({ invoice, totals }) => {
    const factureRef = useRef<HTMLDivElement>(null)

    const handleDownloadPdf = async () => {
        const element = factureRef.current
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 3, useCORS: true })
            const imgData = canvas.toDataURL('image/png')

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "A4"
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`facture-${invoice.name || invoice.id}.pdf`)

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999
            })
        } catch (error) {
            console.error('Erreur lors de la génération du PDF :', error);
        }
    }

    // Styles inline pour html2canvas
    const badgeGhostStyle: React.CSSProperties = {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        display: 'inline-block',
    }

    const badgeAccentStyle: React.CSSProperties = {
        backgroundColor: '#f97316', // orange-500, adapte à ta couleur accent
        color: '#ffffff',
        padding: '6px 16px',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: 700,
        display: 'inline-block',
    }

    const iconBoxStyle: React.CSSProperties = {
        backgroundColor: '#fff7ed', // orange-50
        color: '#f97316',
        borderRadius: '9999px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }

    const tableHeaderStyle: React.CSSProperties = {
        borderBottom: '1px solid #e5e7eb',
        textAlign: 'left',
        padding: '12px 8px',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#6b7280',
    }

    const tableCellStyle: React.CSSProperties = {
        padding: '12px 8px',
        fontSize: '0.875rem',
        borderBottom: '1px solid #f3f4f6',
    }

    const zebraRowStyle: React.CSSProperties = {
        backgroundColor: '#f9fafb',
    }

    return (
        <div className='mt-4'>
            <div className='border-base-300 border-2 border-dashed rounded-xl p-5 overflow-x-auto'>
                <button
                    onClick={handleDownloadPdf}
                    className='btn btn-sm btn-accent mb-4'
                >
                    Facture PDF
                    <ArrowDownFromLine className="w-4 ml-2" />
                </button>

                {/* ZONE CAPTURÉE PAR HTML2CANVAS : tout en style inline */}
                <div style={{ padding: '32px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#1f2937' }} ref={factureRef}>

                    {/* En-tête */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={iconBoxStyle}>
                                    <Layers style={{ width: 24, height: 24 }} />
                                </div>
                                <span style={{ marginLeft: '12px', fontWeight: 'bold', fontSize: '1.5rem', fontStyle: 'italic' }}>
                                    In<span style={{ color: '#f97316' }}>Voice</span>
                                </span>
                            </div>
                            <h1 style={{ fontSize: '4.5rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>Facture</h1>
                        </div>
                        <div style={{ textAlign: 'right', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                            <p style={badgeGhostStyle}>Facture ° {invoice.id}</p>
                            <p style={{ margin: '8px 0' }}>
                                <strong>Date </strong>
                                {formatDate(invoice.invoiceDate)}
                            </p>
                            <p>
                                <strong>Date échéance </strong>
                                {formatDate(invoice.dueDate)}
                            </p>
                        </div>
                    </div>

                    {/* Émetteur / Client */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <p style={{ ...badgeGhostStyle, marginBottom: '8px' }}>Émetteur</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', fontStyle: 'italic' }}>{invoice.issuerName}</p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', maxWidth: '208px', wordWrap: 'break-word' }}>{invoice.issuerAddress}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ ...badgeGhostStyle, marginBottom: '8px' }}>Client</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', fontStyle: 'italic' }}>{invoice.clientName}</p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', maxWidth: '208px', wordWrap: 'break-word', marginLeft: 'auto' }}>{invoice.clientAddress}</p>
                        </div>
                    </div>

                    {/* Tableau */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                        <thead>
                            <tr>
                                <th style={{ ...tableHeaderStyle, width: '40px' }}></th>
                                <th style={tableHeaderStyle}>Description</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Quantité</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Prix Unitaire</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lines.map((ligne, index) => (
                                <tr key={ligne.id || index} style={index % 2 === 1 ? zebraRowStyle : undefined}>
                                    <td style={{ ...tableCellStyle, width: '40px' }}>{index + 1}</td>
                                    <td style={tableCellStyle}>{ligne.description}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>{ligne.quantity}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>{ligne.unitPrice} FCFA</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 600 }}>{(ligne.quantity * ligne.unitPrice)} FCFA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totaux */}
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1rem' }}>
                            <div style={{ fontWeight: 700 }}>Total Hors Taxes</div>
                            <div>{totals.totalHT} FCFA</div>
                        </div>

                        {invoice.vatActive && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1rem' }}>
                                <div style={{ fontWeight: 700 }}>TVA {invoice.vatRate} %</div>
                                <div>{totals.totalVAT} FCFA</div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem' }}>
                            <div style={{ fontWeight: 700 }}>Total Toutes Taxes Comprises</div>
                            <div style={badgeAccentStyle}>
                                {totals.totalTTC} FCFA
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default InvoicePDF