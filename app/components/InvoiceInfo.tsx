import { Invoice } from "@/type";
import React from "react";

interface Props {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
}

// Helper : transforme Date | string | undefined en "YYYY-MM-DD"
const toDateInputValue = (date: Date | string | undefined | null): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

const InvoiceInfo: React.FC<Props> = ({ invoice, setInvoice }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Invoice,
  ) => {
    setInvoice({ ...invoice, [field]: e.target.value });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Invoice,
  ) => {
    const value = e.target.value;
    // Si ton type Invoice attend des Date :
    // setInvoice({ ...invoice, [field]: value ? new Date(value) : null });
    // Si ton type Invoice attend des string :
    setInvoice({ ...invoice, [field]: value });
  };

  return (
    <div className="flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0">
      <div className="space-y-4">
        <h2 className="badge badge-accent">Émetteur</h2>
        <input
          type="text"
          value={invoice.issuerName ?? ""}
          placeholder="Nom de l'entreprise émettrice"
          className="input input-bordered w-full"
          required
          onChange={(e) => handleInputChange(e, "issuerName")}
        />

        <textarea
          value={invoice.issuerAddress ?? ""}
          placeholder="Adresse de l'entreprise émettrice"
          className="textarea textarea-bordered w-full resize-none h-40"
          required
          onChange={(e) => handleInputChange(e, "issuerAddress")}
        />

        <h2 className="badge badge-accent">Client</h2>
        <input
          type="text"
          value={invoice.clientName ?? ""}
          placeholder="Nom de l'entreprise cliente"
          className="input input-bordered w-full"
          required
          onChange={(e) => handleInputChange(e, "clientName")}
        />

        <textarea
          value={invoice.clientAddress ?? ""}
          placeholder="Adresse de l'entreprise cliente"
          className="textarea textarea-bordered w-full resize-none h-40"
          required
          onChange={(e) => handleInputChange(e, "clientAddress")}
        />

        <h2 className="badge badge-accent">Date de la Facture</h2>
        <input
          type="date"
          value={toDateInputValue(invoice.invoiceDate)}
          className="input input-bordered w-full"
          required
          onChange={(e) => handleDateChange(e, "invoiceDate")}
        />

        <h2 className="badge badge-accent">Date d\échéance</h2>
        <input
          type="date"
          value={toDateInputValue(invoice.dueDate)}
          className="input input-bordered w-full"
          required
          onChange={(e) => handleDateChange(e, "dueDate")}
        />
      </div>
    </div>
  );
};

export default InvoiceInfo;