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
            // Forcer une largeur fixe A4 pour le rendu
            element.style.width = '210mm';
            
            const canvas = await html2canvas(element, { 
                scale: 3, 
                useCORS: true,
                width: 794, // 210mm en pixels à 96dpi
                height: element.scrollHeight,
                windowWidth: 794,
            })
            
            // Remettre la largeur auto après capture
            element.style.width = '';

            const imgData = canvas.toDataURL('image/png')

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = canvas.width
            const imgHeight = canvas.height
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
            
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
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
    const pageStyle: React.CSSProperties = {
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12pt',
        lineHeight: 1.4,
        boxSizing: 'border-box',
    }

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
        backgroundColor: '#f97316',
        color: '#ffffff',
        padding: '6px 16px',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: 700,
        display: 'inline-block',
    }

    const iconBoxStyle: React.CSSProperties = {
        backgroundColor: '#fff7ed',
        color: '#f97316',
        borderRadius: '9999px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
    }

    const tableHeaderStyle: React.CSSProperties = {
        borderBottom: '2px solid #e5e7eb',
        textAlign: 'left',
        padding: '10px 8px',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#6b7280',
    }

    const tableCellStyle: React.CSSProperties = {
        padding: '10px 8px',
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

                {/* ZONE CAPTURÉE : largeur fixe A4 */}
                <div style={pageStyle} ref={factureRef}>

                    {/* En-tête */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={iconBoxStyle}>
                                    <Layers style={{ width: 20, height: 20 }} />
                                </div>
                                <span style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: '1.25rem', fontStyle: 'italic' }}>
                                    In<span style={{ color: '#f97316' }}>Voice</span>
                                </span>
                            </div>
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>Facture</h1>
                        </div>
                        <div style={{ textAlign: 'right', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            <p style={badgeGhostStyle}>Facture N° {invoice.id}</p>
                            <p style={{ margin: '6px 0' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ maxWidth: '45%' }}>
                            <p style={{ ...badgeGhostStyle, marginBottom: '6px' }}>Émetteur</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', fontStyle: 'italic' }}>{invoice.issuerName}</p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', wordWrap: 'break-word' }}>{invoice.issuerAddress}</p>
                        </div>
                        <div style={{ textAlign: 'right', maxWidth: '45%' }}>
                            <p style={{ ...badgeGhostStyle, marginBottom: '6px' }}>Client</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', fontStyle: 'italic' }}>{invoice.clientName}</p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', wordWrap: 'break-word' }}>{invoice.clientAddress}</p>
                        </div>
                    </div>

                    {/* Tableau */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr>
                                <th style={{ ...tableHeaderStyle, width: '30px' }}></th>
                                <th style={tableHeaderStyle}>Description</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '80px' }}>Qté</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '120px' }}>Prix U.</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '120px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lines.map((ligne, index) => (
                                <tr key={ligne.id || index} style={index % 2 === 1 ? zebraRowStyle : undefined}>
                                    <td style={{ ...tableCellStyle, width: '30px' }}>{index + 1}</td>
                                    <td style={tableCellStyle}>{ligne.description}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>{ligne.quantity}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>{ligne.unitPrice.toLocaleString()} FCFA</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 600 }}>{(ligne.quantity * ligne.unitPrice).toLocaleString()} FCFA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totaux */}
                    <div style={{ marginTop: '20px', borderTop: '2px solid #e5e7eb', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.95rem' }}>
                            <div style={{ fontWeight: 700 }}>Total Hors Taxes</div>
                            <div>{totals.totalHT.toLocaleString()} FCFA</div>
                        </div>

                        {invoice.vatActive && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.95rem' }}>
                                <div style={{ fontWeight: 700 }}>TVA {invoice.vatRate} %</div>
                                <div>{totals.totalVAT.toLocaleString()} FCFA</div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', marginTop: '8px' }}>
                            <div style={{ fontWeight: 700 }}>Total TTC</div>
                            <div style={badgeAccentStyle}>
                                {totals.totalTTC.toLocaleString()} FCFA
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default InvoicePDF