import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionCard } from "@/components/enquiry/SectionCard";
import { InvoicePreview } from "@/components/bill/InvoicePreview";
import { createInvoiceLineItem, initialInvoice, saveInvoiceBusinessProfile, type InvoiceState } from "@/types/invoice";
import { calcInvoiceTotals } from "@/lib/invoiceTotals";
import { mapApiInvoiceToState, mapInvoiceStateToCreateInput } from "@/lib/invoicesApi";
import {
  useCreateInvoiceMutation,
  useInvoiceDetailQuery,
  useUpdateInvoiceMutation,
} from "@/hooks/useBanquetData";
import { formatINR } from "@/lib/enquiryTotals";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { ArrowLeft, ArrowRight, Loader2, Plus, Printer, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";

const TABS = ["invoice", "preview"] as const;
type TabKey = (typeof TABS)[number];

const Req = () => <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>;

export const BanquetInvoiceForm = () => {
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const invoiceId = searchParams.get("id") ?? undefined;
  const { data: invoiceDetail, isLoading: isLoadingInvoice } = useInvoiceDetailQuery(invoiceId);
  const createMutation = useCreateInvoiceMutation();
  const updateMutation = useUpdateInvoiceMutation();
  const [tab, setTab] = useState<TabKey>("invoice");
  const [state, setState] = useState<InvoiceState>(() => initialInvoice());
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | undefined>(invoiceId);
  const [touched, setTouched] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const totals = calcInvoiceTotals(state);
  const idx = TABS.indexOf(tab);
  const isPersisting = createMutation.isPending || updateMutation.isPending || isSaving;

  useEffect(() => {
    if (!invoiceId) {
      setState(initialInvoice());
      setSavedInvoiceId(undefined);
      return;
    }

    if (invoiceDetail) {
      setState(mapApiInvoiceToState(invoiceDetail));
      setSavedInvoiceId(invoiceDetail.id);
    }
  }, [invoiceId, invoiceDetail]);

  const update = <K extends keyof InvoiceState>(key: K, value: InvoiceState[K]) =>
    setState((s) => {
      const next = { ...s, [key]: value };
      if (key === "businessName" || key === "businessAddress" || key === "businessPhone" || key === "businessEmail" || key === "authorizedSignatory" || key === "paymentInfo") {
        saveInvoiceBusinessProfile({
          businessName: next.businessName,
          businessAddress: next.businessAddress,
          businessPhone: next.businessPhone,
          businessEmail: next.businessEmail,
          authorizedSignatory: next.authorizedSignatory,
          paymentInfo: next.paymentInfo,
        });
      }
      return next;
    });

  const updateLine = (id: string, patch: Partial<InvoiceState["lineItems"][number]>) =>
    setState((s) => ({
      ...s,
      lineItems: s.lineItems.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    }));

  const addLine = () => setState((s) => ({ ...s, lineItems: [...s.lineItems, createInvoiceLineItem()] }));

  const removeLine = (id: string) =>
    setState((s) => ({
      ...s,
      lineItems: s.lineItems.length <= 1 ? s.lineItems : s.lineItems.filter((line) => line.id !== id),
    }));

  const lineItemValid = (line: InvoiceState["lineItems"][number]) =>
    line.description.trim() && line.quantity > 0 && line.rate >= 0 && line.quantity * line.rate > 0;

  const validate = () => {
    setTouched(true);
    const errors: string[] = [];
    if (!state.customerName.trim()) errors.push(t("invoice.validate.customer"));
    if (!state.lineItems.some((line) => line.description.trim() && lineItemValid(line))) {
      errors.push(t("invoice.validate.lines"));
    }
    if (errors.length) {
      toast.error(t("toast.fixErrors"), {
        description: (
          <ul className="ml-4 list-disc space-y-0.5 text-white">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        ),
      });
      return false;
    }
    return true;
  };

  const tryChangeTab = (next: TabKey) => {
    if (next === tab) return;
    if (TABS.indexOf(next) > idx && !validate()) return;
    setTab(next);
  };

  const handleSaveInvoice = async (): Promise<string | undefined> => {
    if (!validate()) return undefined;

    setIsSaving(true);
    try {
      const input = mapInvoiceStateToCreateInput(state);
      const activeId = savedInvoiceId ?? invoiceId;

      if (activeId) {
        const updated = await updateMutation.mutateAsync({ id: activeId, input });
        setSavedInvoiceId(updated.id);
        if (!invoiceId) {
          setSearchParams({ id: updated.id });
        }
        toast.success(t("invoice.save.success"));
        return updated.id;
      }

      const created = await createMutation.mutateAsync(input);
      setSavedInvoiceId(created.id);
      setSearchParams({ id: created.id });
      toast.success(t("invoice.save.success"));
      return created.id;
    } catch {
      toast.error(t("invoice.save.failed"));
      return undefined;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!validate()) return;

    const savedId = await handleSaveInvoice();
    if (!savedId) return;

    const element = document.getElementById("invoice-print-area");
    if (!element) return;

    const safeName = state.customerName.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Customer";
    const filename = `Invoice_${safeName}_${state.invoiceNumber.replace(/[^a-zA-Z0-9-]+/g, "_")}.pdf`;

    setIsPdfGenerating(true);
    const loadingToast = toast.loading(t("toast.pdfGenerating"));
    try {
      const result = await downloadPdfFromElement(element, filename);
      toast.dismiss(loadingToast);
      if (result === "view") {
        toast.info(t("toast.pdfOpenedMobile"), { duration: 8000 });
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error(t("toast.pdfFailed"));
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const showCustomerError = touched && !state.customerName.trim();

  if (invoiceId && isLoadingInvoice) {
    return <div className="py-16 text-center text-sm text-muted-foreground">{t("invoices.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => tryChangeTab(v as TabKey)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl border border-border/70 bg-card p-1.5 shadow-soft">
          {TABS.map((k) => (
            <TabsTrigger
              key={k}
              value={k}
              className="rounded-lg data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold"
            >
              {k === "invoice" ? t("invoice.tab.edit") : t("invoice.tab.preview")}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="invoice" className="mt-6">
          <SectionCard title={t("invoice.tab.edit")} description={t("invoice.formDesc")}>
            <div className="space-y-8">
              {/* col-sm-12: invoice meta */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="inv-date">{t("invoice.date")}</Label>
                  <Input
                    id="inv-date"
                    type="date"
                    value={state.invoiceDate}
                    onChange={(e) => update("invoiceDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-number">{t("invoice.number")}</Label>
                  <Input
                    id="inv-number"
                    value={state.invoiceNumber}
                    onChange={(e) => update("invoiceNumber", e.target.value.slice(0, 40))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-due-date">{t("invoice.dueDate")}</Label>
                  <Input
                    id="inv-due-date"
                    type="date"
                    value={state.dueDate}
                    onChange={(e) => update("dueDate", e.target.value)}
                  />
                </div>
              </div>

              {/* col-sm-6 + col-sm-6: business & customer */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4 rounded-lg border border-border/70 p-4">
                  <p className="text-sm font-semibold">{t("invoice.businessTitle")}</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inv-business-name">{t("invoice.businessName")}</Label>
                      <Input
                        id="inv-business-name"
                        value={state.businessName}
                        onChange={(e) => update("businessName", e.target.value.slice(0, 120))}
                        placeholder={t("app.title")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-business-address">{t("invoice.businessAddress")}</Label>
                      <Textarea
                        id="inv-business-address"
                        value={state.businessAddress}
                        onChange={(e) => update("businessAddress", e.target.value.slice(0, 500))}
                        rows={3}
                        placeholder={t("invoice.businessAddressPh")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-business-phone">{t("invoice.businessPhone")}</Label>
                      <Input
                        id="inv-business-phone"
                        inputMode="tel"
                        value={state.businessPhone}
                        onChange={(e) => update("businessPhone", e.target.value.replace(/\D/g, "").slice(0, 15))}
                        placeholder="9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-business-email">{t("invoice.businessEmail")}</Label>
                      <Input
                        id="inv-business-email"
                        type="email"
                        value={state.businessEmail}
                        onChange={(e) => update("businessEmail", e.target.value.slice(0, 120))}
                        placeholder="info@venue.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-signatory">{t("invoice.authorizedSignatory")}</Label>
                      <Input
                        id="inv-signatory"
                        value={state.authorizedSignatory}
                        onChange={(e) => update("authorizedSignatory", e.target.value.slice(0, 80))}
                        placeholder={t("invoice.authorizedSignatoryPh")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border border-border/70 p-4">
                  <p className="text-sm font-semibold">
                    {t("invoice.customerTitle")}
                    <Req />
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inv-customer">{t("invoice.customerName")}<Req /></Label>
                      <Input
                        id="inv-customer"
                        value={state.customerName}
                        onChange={(e) => update("customerName", e.target.value.slice(0, 100))}
                        aria-invalid={showCustomerError}
                        className={showCustomerError ? "border-destructive" : ""}
                        placeholder={t("basics.customerName.ph")}
                      />
                      {showCustomerError && (
                        <p className="text-xs text-destructive">{t("invoice.validate.customer")}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-customer-address">{t("invoice.customerAddress")}</Label>
                      <Textarea
                        id="inv-customer-address"
                        value={state.customerAddress}
                        onChange={(e) => update("customerAddress", e.target.value.slice(0, 500))}
                        rows={3}
                        placeholder={t("invoice.customerAddressPh")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-customer-phone">{t("invoice.customerPhone")}</Label>
                      <Input
                        id="inv-customer-phone"
                        inputMode="tel"
                        value={state.customerPhone}
                        onChange={(e) => update("customerPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-customer-email">{t("invoice.customerEmail")}</Label>
                      <Input
                        id="inv-customer-email"
                        type="email"
                        value={state.customerEmail}
                        onChange={(e) => update("customerEmail", e.target.value.slice(0, 120))}
                        placeholder="customer@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* col-sm-12: charges */}
              <div className="space-y-3 border-t border-border/70 pt-6">
                <p className="text-sm font-semibold">
                  {t("invoice.linesTitle")}
                  <Req />
                </p>
                <p className="text-xs text-muted-foreground">{t("invoice.linesDesc")}</p>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("invoice.col.description")}</TableHead>
                      <TableHead className="w-24 text-right">{t("invoice.col.qty")}</TableHead>
                      <TableHead className="w-32 text-right">{t("invoice.col.rate")}</TableHead>
                      <TableHead className="w-32 text-right">{t("invoice.col.amount")}</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.lineItems.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={(e) => updateLine(line.id, { description: e.target.value.slice(0, 200) })}
                            placeholder={t("invoice.linePlaceholder")}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="text-right tabular-nums"
                            value={line.quantity || ""}
                            onChange={(e) =>
                              updateLine(line.id, { quantity: Math.max(0, Number(e.target.value) || 0) })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="text-right tabular-nums"
                            value={line.rate || ""}
                            onChange={(e) =>
                              updateLine(line.id, { rate: Math.max(0, Number(e.target.value) || 0) })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatINR(totals.items.find((i) => i.id === line.id)?.amount ?? 0)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLine(line.id)}
                            disabled={state.lineItems.length <= 1}
                            aria-label={t("invoice.removeLine")}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {state.lineItems.map((line) => (
                  <div key={line.id} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("invoice.col.description")}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeLine(line.id)}
                        disabled={state.lineItems.length <= 1}
                        aria-label={t("invoice.removeLine")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(line.id, { description: e.target.value.slice(0, 200) })}
                      placeholder={t("invoice.linePlaceholder")}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("invoice.col.qty")}</Label>
                        <Input
                          type="number"
                          min={0}
                          className="text-right tabular-nums"
                          value={line.quantity || ""}
                          onChange={(e) =>
                            updateLine(line.id, { quantity: Math.max(0, Number(e.target.value) || 0) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("invoice.col.rate")}</Label>
                        <Input
                          type="number"
                          min={0}
                          className="text-right tabular-nums"
                          value={line.rate || ""}
                          onChange={(e) =>
                            updateLine(line.id, { rate: Math.max(0, Number(e.target.value) || 0) })
                          }
                        />
                      </div>
                    </div>
                    <p className="text-right text-sm font-medium tabular-nums">
                      {t("invoice.col.amount")}: {formatINR(totals.items.find((i) => i.id === line.id)?.amount ?? 0)}
                    </p>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("invoice.addLine")}
              </Button>

              <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="inv-payment-info">{t("invoice.paymentInfo")}</Label>
                  <Textarea
                    id="inv-payment-info"
                    value={state.paymentInfo}
                    onChange={(e) => update("paymentInfo", e.target.value.slice(0, 500))}
                    rows={3}
                    placeholder={t("invoice.paymentInfoPh")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("summary.discount").replace(" (%)", "")}</Label>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <button
                        type="button"
                        onClick={() => update("discountType", "percent")}
                        className={`h-9 px-3 text-xs font-semibold ${state.discountType === "percent" ? "bg-gradient-gold text-primary-foreground" : "bg-muted/40"}`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => update("discountType", "fixed")}
                        className={`h-9 px-3 text-xs font-semibold ${state.discountType === "fixed" ? "bg-gradient-gold text-primary-foreground" : "bg-muted/40"}`}
                      >
                        ₹
                      </button>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={state.discountType === "percent" ? 100 : undefined}
                      className="w-28 text-right tabular-nums"
                      value={state.discountType === "percent" ? state.discountPercent : state.discountAmount}
                      onChange={(e) => {
                        const n = Math.max(0, Number(e.target.value) || 0);
                        if (state.discountType === "percent") {
                          update("discountPercent", Math.min(100, n));
                        } else {
                          update("discountAmount", n);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="inv-notes">{t("summary.notes")}</Label>
                  <Textarea
                    id="inv-notes"
                    value={state.notes}
                    onChange={(e) => update("notes", e.target.value.slice(0, 1000))}
                    rows={3}
                    placeholder={t("invoice.notesPh")}
                  />
                </div>
              </div>
            </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <SectionCard title={t("invoice.tab.preview")} description={t("invoice.previewDesc")}>
            <div className="overflow-hidden rounded-lg">
              <InvoicePreview state={state} totals={totals} />
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <div className="text-sm">
          <span className="text-muted-foreground">{t("summary.grandTotal")}: </span>
          <span className="font-display text-lg font-bold text-gradient-gold tabular-nums">
            {formatINR(totals.total)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => tryChangeTab(TABS[idx - 1])} disabled={idx === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> {t("common.back")}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleSaveInvoice()}
            disabled={isPersisting}
            className="gap-2"
          >
            {isPersisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPersisting ? t("invoice.save.submitting") : t("invoice.save.submit")}
          </Button>
          {tab === "preview" ? (
            <Button
              onClick={() => void handleDownloadPdf()}
              disabled={isPdfGenerating || isPersisting}
              className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            >
              <Printer className="mr-1 h-4 w-4" />
              {isPdfGenerating ? t("toast.pdfGenerating") : t("invoice.downloadPdf")}
            </Button>
          ) : (
            <Button
              onClick={() => tryChangeTab(TABS[idx + 1])}
              className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            >
              {t("common.next")} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
