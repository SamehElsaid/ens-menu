"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import { FaEye } from "react-icons/fa";
import Link from "next/link";

// Define the client data type
export interface Client {
  id: string;
  patientName: string;
  parentName: string;
  numOfSessions: number;
}


export default function ClientPage() {
  const locale = useLocale();
  const t = useTranslations("");

  // Sample data - replace with actual API call
  const [rowData] = useState<Client[]>([
    {
      id: "1",
      patientName: "Jane Doe",
      parentName: "John Doe",
      numOfSessions: 12,
    },
    {
      id: "2",
      patientName: "Mike Smith",
      parentName: "Sarah Smith",
      numOfSessions: 8,
    },
    {
      id: "3",
      patientName: "Fatima Ali",
      parentName: "Ahmed Ali",
      numOfSessions: 15,
    },
    {
      id: "4",
      patientName: "Carlos Garcia",
      parentName: "Maria Garcia",
      numOfSessions: 6,
    },
    {
      id: "5",
      patientName: "Emily Johnson",
      parentName: "David Johnson",
      numOfSessions: 20,
    },
    {
      id: "6",
      patientName: "James Brown",
      parentName: "Lisa Brown",
      numOfSessions: 10,
    },
    {
      id: "7",
      patientName: "Amina Hassan",
      parentName: "Mohammed Hassan",
      numOfSessions: 14,
    },
    {
      id: "8",
      patientName: "Olivia Wilson",
      parentName: "Jennifer Wilson",
      numOfSessions: 9,
    },
    {
      id: "9",
      patientName: "Noah Taylor",
      parentName: "Robert Taylor",
      numOfSessions: 11,
    },
    {
      id: "10",
      patientName: "Sophia Martinez",
      parentName: "Emma Martinez",
      numOfSessions: 7,
    },
  ]);

  // Column definitions
  const columnDefs: ColDef<Client>[] = useMemo(
    () => [
      {
        headerName: t("application.view") || "View",
        sortable: false,
        filter: false,
        width: 80,
        cellRenderer: (params: ICellRendererParams<Client>) => {
          const client = params.data as Client;

          return (
            <div className="flex items-center justify-center">
              <Link
                href={`/specialist/clients/${client.id}/overview`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={t("application.view") || "View"}
              >
                <FaEye className="text-xs" />
              </Link>
            </div>
          );
        },
      },
      {
        headerName: "Patient Name",
        field: "patientName",
        sortable: true,
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Parent Name",
        field: "parentName",
        sortable: true,
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Sessions",
        field: "numOfSessions",
        sortable: true,
        flex: 0.3,
        minWidth: 100,
        valueFormatter: (params) => {
          if (!params.value) return "0";
          return params.value.toString();
        },
      },
    ],
    [t]
  );

  return (
    <CardDashBoard>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-500 mt-1">Manage and view all your clients</p>
      </div>

      <DataTable<Client>
        rowData={rowData}
        columnDefs={columnDefs}
        height="auto"
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        rowSelection={false}
        showRowNumbers={true}
        locale={locale}
      />
    </CardDashBoard>
  );
}
