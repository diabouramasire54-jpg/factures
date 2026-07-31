import { Invoice } from "@/type";
import { Plus, Trash } from "lucide-react";
import React from "react";

interface Props {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
}

// Type local simple, pas besoin de Prisma ici
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const InvoiceLines: React.FC<Props> = ({ invoice, setInvoice }) => {
  const handleAddLine = () => {
    const newLine: LineItem = {
      id: `${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
    };
    setInvoice({
      ...invoice,
      lines: [...(invoice.lines || []), newLine],
    });
  };

  const handleQuantityChange = (index: number, value: string) => {
    const updatedLines = [...(invoice.lines || [])];
    updatedLines[index].quantity = value === "" ? 0 : parseInt(value);
    setInvoice({ ...invoice, lines: updatedLines });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedLines = [...(invoice.lines || [])];
    updatedLines[index].description = value;
    setInvoice({ ...invoice, lines: updatedLines });
  };

  const handleUnitPriceChange = (index: number, value: string) => {
    const updatedLines = [...(invoice.lines || [])];
    updatedLines[index].unitPrice = value === "" ? 0 : parseFloat(value);
    setInvoice({ ...invoice, lines: updatedLines });
  };

  const handleRemoveLine = (index: number) => {
    const updatedLines = (invoice.lines || []).filter((_, i) => i !== index);
    setInvoice({ ...invoice, lines: updatedLines });
  };

  return (
    <div className="h-fit bg-base-200 p-5 rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="badge badge-accent">Produits / Services</h2>
        <button className="btn btn-sm btn-accent" onClick={handleAddLine}>
          <Plus className="w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead className="uppercase">
            <tr>
              <th>Qté</th>
              <th>Description</th>
              <th>Prix U. (HT)</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(invoice.lines || []).map((line, index) => (
              <tr key={line.id || index}>
                <td>
                  <input
                    type="number"
                    value={line.quantity}
                    className="input input-sm input-bordered w-20"
                    min={0}
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={line.description}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={line.unitPrice}
                    className="input input-sm input-bordered w-28"
                    min={0}
                    step="any"
                    onChange={(e) =>
                      handleUnitPriceChange(index, e.target.value)
                    }
                  />
                </td>
                <td className="font-bold whitespace-nowrap">
                  {(line.quantity * line.unitPrice).toLocaleString()} FCFA
                </td>
                <td>
                  <button
                    onClick={() => handleRemoveLine(index)}
                    className="btn btn-sm btn-circle btn-accent"
                  >
                    <Trash className="w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceLines;
