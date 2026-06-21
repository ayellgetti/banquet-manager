import type { InvoiceTotals } from "@/lib/invoiceTotals";
import type { InvoiceState } from "@/types/invoice";
import { formatINR } from "@/lib/enquiryTotals";
import { useT } from "@/i18n";

const NAVY = "#1a2744";
const ROW_ALT = "#f4f6f9";
const AMOUNT_BG = "#e8ecf4";
const BORDER = "#e2e8f0";

const formatDisplayDate = (iso: string): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

type Props = {
  state: InvoiceState;
  totals: InvoiceTotals;
};

const MetaField = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">{label}</p>
    <p className="mt-1 text-[13px] font-medium text-[#1e293b]">{value || "—"}</p>
  </div>
);

const PartyBlock = ({
  title,
  name,
  address,
  phone,
  email,
  phoneLabel,
  emailLabel,
}: {
  title: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  phoneLabel: string;
  emailLabel: string;
}) => (
  <div className="h-full rounded-lg border p-4" style={{ borderColor: BORDER }}>
    <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: NAVY }}>
      {title}
    </p>
    <div className="space-y-2 text-[12px]">
      <p className="font-semibold text-[#1e293b]">{name || "—"}</p>
      {address.trim() ? (
        <p className="whitespace-pre-wrap text-[#64748b]">{address.trim()}</p>
      ) : (
        <p className="text-[#94a3b8]">—</p>
      )}
      <p className="text-[#64748b]">
        <span className="font-medium text-[#475569]">{phoneLabel}:</span> {phone.trim() || "—"}
      </p>
      <p className="text-[#64748b]">
        <span className="font-medium text-[#475569]">{emailLabel}:</span> {email.trim() || "—"}
      </p>
    </div>
  </div>
);

export const InvoicePreview = ({ state, totals }: Props) => {
  const { t } = useT();
  const businessName = state.businessName.trim() || t("app.title");
  const displayLines = totals.items.filter((line) => line.description.trim() && line.amount > 0);

  return (
    <div
      id="invoice-print-area"
      className="overflow-hidden bg-white text-[13px] leading-relaxed text-[#334155]"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <div className="px-8 py-6 text-white" style={{ backgroundColor: NAVY }}>
        <p className="text-3xl font-bold tracking-wide">{t("invoice.titleCaps")}</p>
        <p className="mt-1 text-sm text-white/75">{businessName}</p>
      </div>

      <div className="space-y-6 px-8 py-6">
        {/* col-sm-12: invoice meta */}
        <div
          className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ borderColor: BORDER }}
        >
          <MetaField label={t("invoice.date")} value={formatDisplayDate(state.invoiceDate)} />
          <MetaField label={t("invoice.number")} value={state.invoiceNumber} />
          <MetaField label={t("invoice.dueDate")} value={formatDisplayDate(state.dueDate)} />
        </div>

        {/* col-sm-6 + col-sm-6: business & customer */}
        <div className="grid gap-6 sm:grid-cols-2">
          <PartyBlock
            title={t("invoice.businessTitle")}
            name={businessName}
            address={state.businessAddress}
            phone={state.businessPhone}
            email={state.businessEmail}
            phoneLabel={t("invoice.businessPhone")}
            emailLabel={t("invoice.businessEmail")}
          />
          <PartyBlock
            title={t("invoice.customerTitle")}
            name={state.customerName}
            address={state.customerAddress}
            phone={state.customerPhone}
            email={state.customerEmail}
            phoneLabel={t("invoice.customerPhone")}
            emailLabel={t("invoice.customerEmail")}
          />
        </div>

        {/* col-sm-12: charges */}
        <div>
          <p className="mb-3 text-sm font-bold text-[#1e293b]">
            {t("invoice.linesTitle")}
            <span className="text-destructive">*</span>
          </p>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr style={{ backgroundColor: NAVY, color: "#fff" }}>
                <th className="px-3 py-2.5 text-left font-semibold">{t("invoice.col.no")}</th>
                <th className="px-3 py-2.5 text-left font-semibold">{t("invoice.col.description")}</th>
                <th className="px-3 py-2.5 text-center font-semibold">{t("invoice.col.qty")}</th>
                <th className="px-3 py-2.5 text-right font-semibold">{t("invoice.col.rate")}</th>
                <th className="px-3 py-2.5 text-right font-semibold">{t("invoice.col.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {displayLines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border-b px-3 py-4 text-center text-[#94a3b8]" style={{ borderColor: BORDER }}>
                    —
                  </td>
                </tr>
              ) : (
                displayLines.map((line, index) => (
                  <tr
                    key={line.id}
                    style={{ backgroundColor: index % 2 === 1 ? ROW_ALT : "#ffffff" }}
                  >
                    <td className="border-b px-3 py-2.5 tabular-nums" style={{ borderColor: BORDER }}>
                      {index + 1}
                    </td>
                    <td className="border-b px-3 py-2.5" style={{ borderColor: BORDER }}>
                      {line.description}
                    </td>
                    <td className="border-b px-3 py-2.5 text-center tabular-nums" style={{ borderColor: BORDER }}>
                      {line.quantity}
                    </td>
                    <td className="border-b px-3 py-2.5 text-right tabular-nums" style={{ borderColor: BORDER }}>
                      {formatINR(line.rate)}
                    </td>
                    <td className="border-b px-3 py-2.5 text-right tabular-nums" style={{ borderColor: BORDER }}>
                      {formatINR(line.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-[12px]">
              <div className="flex justify-between gap-8">
                <span className="text-[#64748b]">{t("summary.subtotal")}</span>
                <span className="font-medium tabular-nums">{formatINR(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between gap-8">
                  <span className="text-[#64748b]">{t("summary.discount").replace(" (%)", "")}</span>
                  <span className="font-medium tabular-nums">- {formatINR(totals.discount)}</span>
                </div>
              )}
              <div
                className="flex items-center justify-between gap-4 rounded px-3 py-2.5"
                style={{ backgroundColor: AMOUNT_BG }}
              >
                <span className="text-sm font-bold text-[#1e293b]">{t("invoice.amountDue")}</span>
                <span className="text-lg font-bold tabular-nums" style={{ color: NAVY }}>
                  {formatINR(totals.total)}
                </span>
              </div>
            </div>
          </div>

          {(state.paymentInfo.trim() || state.notes.trim()) && (
            <div className="mt-6 grid gap-4 border-t pt-4 sm:grid-cols-2" style={{ borderColor: BORDER }}>
              {state.paymentInfo.trim() && (
                <div className="text-[12px]">
                  <p className="mb-1 font-bold text-[#1e293b]">{t("invoice.paymentInfo")}</p>
                  <p className="whitespace-pre-wrap text-[#64748b]">{state.paymentInfo.trim()}</p>
                </div>
              )}
              {state.notes.trim() && (
                <div className="text-[12px]">
                  <p className="mb-1 font-bold text-[#1e293b]">{t("summary.notes")}</p>
                  <p className="whitespace-pre-wrap text-[#64748b]">{state.notes.trim()}</p>
                </div>
              )}
            </div>
          )}

          {state.authorizedSignatory.trim() && (
            <div className="mt-8 flex justify-end">
              <div className="w-48 border-t pt-2 text-center text-[12px]" style={{ borderColor: "#94a3b8" }}>
                <p className="mb-1 font-medium italic text-[#475569]">{state.authorizedSignatory.trim()}</p>
                <p className="text-[11px] text-[#64748b]">{t("invoice.authorizedSignature")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="mx-8 mb-6 flex flex-wrap items-center justify-between gap-3 border-t py-4 text-[11px] text-[#64748b]"
        style={{ borderColor: BORDER }}
      >
        <p>{t("invoice.thankYou")}</p>
        <p className="text-right">
          {[state.businessEmail.trim(), state.businessPhone.trim()].filter(Boolean).join("  |  ") || businessName}
        </p>
      </div>
    </div>
  );
};
