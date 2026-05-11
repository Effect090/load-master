import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    /** Added by `jspdf-autotable` after each table call. */
    lastAutoTable: { finalY: number };
  }
}
