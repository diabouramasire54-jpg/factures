"use client";
import Wrapper from "./components/Wrapper";
import { Layers } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createEmptyInvoice, getInvoicesByEmail } from "./actions";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Invoice } from "@/type";
import InvoiceComponent from "./components/InvoiceComponent";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [invoiceName, setInvoiceName] = useState("");
  const [isNameValide, setIsNameValide] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const email = user?.primaryEmailAddress?.emailAddress;

  const fetchInvoices = useCallback(async () => {
    if (!email) return;
    try {
      const data = await getInvoicesByEmail(email);
      setInvoices(data);
    } catch (error) {
      console.error("Erreur lors du chargement des factures :", error);
    }
  }, [email]);

  useEffect(() => {
    if (isLoaded) {
      fetchInvoices();
    }
  }, [fetchInvoices, isLoaded]);

  useEffect(() => {
    setIsNameValide(invoiceName.length <= 60);
  }, [invoiceName]);

  const handleCreateInvoice = async () => {
    if (!email) return;
    try {
      await createEmptyInvoice(email, invoiceName);
      await fetchInvoices();
      setInvoiceName("");
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (error) {
      console.error("Erreur lors de la création de la facture :", error);
    }
  };

  if (!isLoaded) {
    return (
      <Wrapper>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <h1 className="text-lg font-bold">Mes factures</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex flex-col justify-center items-center p-5"
            onClick={() =>
              (
                document.getElementById("my_modal_3") as HTMLDialogElement
              ).showModal()
            }
          >
            <div className="font-bold text-accent">Créer une facture</div>
            <div className="bg-accent-content text-accent rounded-full p-2 mt-2">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          {invoices.map((invoice) => (
            <InvoiceComponent
              key={invoice.id}
              invoice={invoice}
            />
          ))}
        </div>

        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Nouvelle Facture !</h3>
            <input
              type="text"
              placeholder="Nom de la facture (max 60 caractères)"
              className="input input-bordered w-full my-4"
              value={invoiceName}
              onChange={(e) => setInvoiceName(e.target.value)}
            />
            {!isNameValide && (
              <p className="mb-4 text-sm text-error">
                Le nom ne doit pas dépasser 60 caractères.
              </p>
            )}

            <button
              className="btn btn-accent"
              disabled={!isNameValide || invoiceName.length === 0}
              onClick={handleCreateInvoice}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}