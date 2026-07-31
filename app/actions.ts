"use server";

import prisma from "@/lib/prisma";
import { Invoice, InvoiceLine } from "@prisma/client";
import { randomBytes } from "crypto";

// Type utilitaire : facture avec ses lignes
type InvoiceWithLines = Invoice & { lines: InvoiceLine[] };

export async function checkAndAddUser(email: string, name: string): Promise<void> {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser && name) {
      await prisma.user.create({
        data: { email, name },
      });
    }
  } catch (error) {
    console.error("checkAndAddUser error:", error);
    throw error;
  }
}

const generateUniqueId = async (): Promise<string> => {
  let uniqueId = "";
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    uniqueId = randomBytes(4).toString("hex");
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: uniqueId },
    });
    if (!existingInvoice) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Impossible de générer un ID unique pour la facture.");
  }

  return uniqueId;
};

export async function createEmptyInvoice(email: string, name: string): Promise<Invoice> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(`Utilisateur avec l'email ${email} non trouvé.`);
    }

    const invoiceId = await generateUniqueId();
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const newInvoice = await prisma.invoice.create({
      data: {
        id: invoiceId,
        name,
        userId: user.id,
        issuerName: "",
        issuerAddress: "",
        clientName: "",
        clientAddress: "",
        invoiceDate: "",
        dueDate:"",
        vatActive: false,
        vatRate: 18,
        status: 1,
      },
    });

    return newInvoice;
  } catch (error) {
    console.error("createEmptyInvoice error:", error);
    throw error;
  }
}

export async function getInvoicesByEmail(email: string): Promise<InvoiceWithLines[]> {
  if (!email) return [];
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        invoices: {
          include: { lines: true },
        },
      },
    });

    if (!user) return [];

    const today = new Date();

    const updatedInvoices = await Promise.all(
      user.invoices.map(async (invoice) => {
        if (!invoice.dueDate) return invoice;

        const dueDate = new Date(invoice.dueDate);
        if (isNaN(dueDate.getTime())) return invoice;

        if (dueDate < today && invoice.status === 2) {
          return prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 5 },
            include: { lines: true },
          });
        }
        return invoice;
      }),
    );

    return updatedInvoices;
  } catch (error) {
    console.error("getInvoicesByEmail error:", error);
    throw error;
  }
}

export async function getInvoiceById(invoiceId: string): Promise<InvoiceWithLines | null> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lines: true },
    });

    return invoice;
  } catch (error) {
    console.error("getInvoiceById error:", error);
    throw error;
  }
}

export async function updateInvoice(invoice: InvoiceWithLines): Promise<InvoiceWithLines> {
  try {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { lines: true },
    });

    if (!existingInvoice) {
      throw new Error(`Facture avec l'ID ${invoice.id} introuvable.`);
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        issuerName: invoice.issuerName,
        issuerAddress: invoice.issuerAddress,
        clientName: invoice.clientName,
        clientAddress: invoice.clientAddress,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        vatActive: invoice.vatActive,
        vatRate: invoice.vatRate,
        status: invoice.status,
      },
    });

    const existingLines = existingInvoice.lines;
    const receivedLines = invoice.lines || [];

    const linesToDelete = existingLines.filter(
      (existingLine) => !receivedLines.some((line) => line.id === existingLine.id),
    );

    if (linesToDelete.length > 0) {
      await prisma.invoiceLine.deleteMany({
        where: {
          id: { in: linesToDelete.map((line) => line.id) },
        },
      });
    }

    for (const line of receivedLines) {
      const existingLine = existingLines.find((l) => l.id === line.id);
      if (existingLine) {
        const hasChanged =
          line.description !== existingLine.description ||
          line.quantity !== existingLine.quantity ||
          line.unitPrice !== existingLine.unitPrice;

        if (hasChanged) {
          await prisma.invoiceLine.update({
            where: { id: line.id },
            data: {
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
            },
          });
        }
      } else {
        await prisma.invoiceLine.create({
          data: {
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            invoiceId: invoice.id,
          },
        });
      }
    }

    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { lines: true },
    });

    if (!updatedInvoice) {
      throw new Error("Erreur lors de la récupération de la facture mise à jour.");
    }

    return updatedInvoice;
  } catch (error) {
    console.error("updateInvoice error:", error);
    throw error;
  }
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  try {
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
  } catch (error) {
    console.error("deleteInvoice error:", error);
    throw error;
  }
}