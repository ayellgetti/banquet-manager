import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionCard } from "@/components/enquiry/SectionCard";
import { itemsByCategory, PROCUREMENT_CATEGORIES, PROCUREMENT_ITEMS, type ProcurementItem } from "@/data/procurementOptions";
import { initialProcurement, type ProcurementState } from "@/types/procurement";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { useProcurementLabels } from "@/i18n/procurementLabels";

const TAB_ORDER = ["materials", "summary"] as const;
type TabKey = typeof TAB_ORDER[number];

const procurementAccordionItemClass =
  "mb-2 overflow-hidden rounded-lg border border-border bg-white last:mb-0";
const procurementAccordionTriggerClass =
  "bg-muted/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:no-underline data-[state=open]:border-b data-[state=open]:border-border";

const procurementTableClass =
  "border-collapse text-sm [&_td]:border [&_th]:border [&_td]:border-border [&_th]:border-border [&_th]:bg-muted/40";

type ColumnLabels = {
  item: string;
  unit: string;
  qty: string;
  rate: string;
  total: string;
};

const VendorBlankCell = () => (
  <TableCell className="min-w-[5rem] bg-muted/15 px-2 py-2 text-right align-middle">
    <span aria-hidden="true" className="inline-block min-h-[1.25rem] w-full">&nbsp;</span>
  </TableCell>
);

const VendorBlankField = ({ label }: { label: string }) => (
  <div>
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <div
      aria-hidden="true"
      className="flex h-9 items-center rounded-md border border-border bg-muted/15 px-2"
    >
      <span className="inline-block min-h-[1rem] w-full">&nbsp;</span>
    </div>
  </div>
);

const ProcurementTableHead = ({ labels }: { labels: ColumnLabels }) => (
  <TableHeader>
    <TableRow className="hover:bg-transparent">
      <TableHead className="font-semibold">{labels.item}</TableHead>
      <TableHead className="w-20 font-semibold">{labels.unit}</TableHead>
      <TableHead className="w-24 text-right font-semibold">{labels.qty}</TableHead>
      <TableHead className="w-28 text-right font-semibold">{labels.rate}</TableHead>
      <TableHead className="w-28 text-right font-semibold">{labels.total}</TableHead>
    </TableRow>
  </TableHeader>
);

const ProcurementMaterialsTable = ({
  items,
  quantities,
  setQty,
  labels,
  itemName,
  unitName,
}: {
  items: ProcurementItem[];
  quantities: Record<string, number>;
  setQty: (id: string, qty: number) => void;
  labels: ColumnLabels;
  itemName: (item: ProcurementItem) => string;
  unitName: (unit: string) => string;
}) => (
  <>
    <div className="divide-y border-t md:hidden print:hidden">
      {items.map((item) => (
        <div key={item.id} className="px-3 py-3">
          <p className="text-sm font-medium leading-snug">{itemName(item)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {labels.unit}: {unitName(item.unit)}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor={`qty-${item.id}`}
                className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {labels.qty}
              </label>
              <Input
                id={`qty-${item.id}`}
                type="number"
                min={0}
                max={9999}
                inputMode="numeric"
                value={quantities[item.id] ?? ""}
                onChange={(e) => setQty(item.id, Number(e.target.value) || 0)}
                className="h-9 w-full text-right tabular-nums"
                placeholder="0"
              />
            </div>
            <VendorBlankField label={labels.rate} />
            <VendorBlankField label={labels.total} />
          </div>
        </div>
      ))}
    </div>

    <div className="hidden overflow-x-auto md:block print:block">
      <Table className={`${procurementTableClass} min-w-[36rem]`}>
        <ProcurementTableHead labels={labels} />
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="min-w-[10rem] font-medium">{itemName(item)}</TableCell>
              <TableCell className="w-20 text-muted-foreground">{unitName(item.unit)}</TableCell>
              <TableCell className="w-24 p-1 text-right">
                <Input
                  type="number"
                  min={0}
                  max={9999}
                  inputMode="numeric"
                  aria-label={`${itemName(item)} ${labels.qty}`}
                  value={quantities[item.id] ?? ""}
                  onChange={(e) => setQty(item.id, Number(e.target.value) || 0)}
                  className="ml-auto h-9 w-full max-w-[6rem] text-right tabular-nums"
                  placeholder="0"
                />
              </TableCell>
              <VendorBlankCell />
              <VendorBlankCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
);

const ProcurementSummaryTable = ({
  rows,
  labels,
  itemName,
  unitName,
}: {
  rows: { item: ProcurementItem; qty: number }[];
  labels: ColumnLabels;
  itemName: (item: ProcurementItem) => string;
  unitName: (unit: string) => string;
}) => (
  <>
    <div className="divide-y border-t md:hidden print:hidden">
      {rows.map(({ item, qty }) => (
        <div key={item.id} className="px-1 py-3">
          <p className="text-sm font-medium leading-snug">{itemName(item)}</p>
          <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="block text-[10px] font-semibold uppercase text-muted-foreground">
                {labels.unit}
              </span>
              <span className="mt-1 block font-medium">{unitName(item.unit)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-muted-foreground">
                {labels.qty}
              </span>
              <span className="mt-1 block font-medium tabular-nums">{qty}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-muted-foreground">
                {labels.rate}
              </span>
              <span className="mt-1 block min-h-[1rem] rounded border border-border bg-muted/15">&nbsp;</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-muted-foreground">
                {labels.total}
              </span>
              <span className="mt-1 block min-h-[1rem] rounded border border-border bg-muted/15">&nbsp;</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="hidden overflow-x-auto md:block print:block">
      <Table className={`${procurementTableClass} min-w-[36rem]`}>
        <ProcurementTableHead labels={labels} />
        <TableBody>
          {rows.map(({ item, qty }) => (
            <TableRow key={item.id}>
              <TableCell className="min-w-[10rem] font-medium">{itemName(item)}</TableCell>
              <TableCell className="w-20 text-muted-foreground">{unitName(item.unit)}</TableCell>
              <TableCell className="w-24 text-right tabular-nums">{qty}</TableCell>
              <VendorBlankCell />
              <VendorBlankCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
);

export const ProcurementForm = () => {
  const { t } = useT();
  const { itemName, categoryName, unitName } = useProcurementLabels();
  const [tab, setTab] = useState<TabKey>("materials");
  const [state, setState] = useState<ProcurementState>(initialProcurement);
  const [attempted, setAttempted] = useState<Set<TabKey>>(new Set());
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const columnLabels: ColumnLabels = {
    item: t("procurement.item"),
    unit: t("procurement.unit"),
    qty: t("procurement.qty"),
    rate: t("procurement.rate"),
    total: t("procurement.total"),
  };

  const idx = TAB_ORDER.indexOf(tab);

  const validateTab = (key: TabKey): string[] => {
    const errs: string[] = [];
    if (key === "materials") {
      const hasQty = Object.values(state.quantities).some((q) => q > 0);
      if (!hasQty) errs.push(t("procurement.validate.materials"));
    }
    return errs;
  };

  const tryChangeTab = async (next: TabKey) => {
    if (next === tab) return;
    const nextIdx = TAB_ORDER.indexOf(next);
    if (nextIdx < idx) { setTab(next); return; }

    let firstBad: TabKey | null = null;
    const allErrs: string[] = [];
    for (let i = idx; i < nextIdx; i++) {
      const errs = validateTab(TAB_ORDER[i]);
      if (errs.length) {
        firstBad ??= TAB_ORDER[i];
        allErrs.push(...errs);
      }
    }
    if (firstBad) {
      setAttempted((prev) => new Set([...prev, firstBad!]));
      if (firstBad !== tab) setTab(firstBad);
      toast.error(t("toast.fixErrors"), {
        description: (
          <ul className="ml-4 list-disc space-y-0.5 text-white">
            {allErrs.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        ),
      });
      return;
    }

    setTab(next);
  };

  const setQty = (id: string, raw: number) => {
    const qty = Math.max(0, Math.min(9999, raw));
    setState((s) => ({
      ...s,
      quantities: { ...s.quantities, [id]: qty },
    }));
  };

  const selectedItems = Object.entries(state.quantities).filter(([, q]) => q > 0);

  const handleDownloadPdf = async () => {
    if (selectedItems.length === 0) {
      toast.error(t("procurement.validate.materials"));
      return;
    }
    const element = document.getElementById("print-area");
    if (!element) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `Procurement_${timestamp}.pdf`;
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

  const summaryByCategory = PROCUREMENT_CATEGORIES.map((cat) => {
    const catItems = selectedItems
      .map(([id, qty]) => {
        const item = PROCUREMENT_ITEMS.find((i) => i.id === id);
        return item?.category === cat ? { item, qty } : null;
      })
      .filter(Boolean) as { item: typeof PROCUREMENT_ITEMS[number]; qty: number }[];
    return { cat, catItems };
  }).filter((g) => g.catItems.length > 0);

  const renderCategoryItems = (items: ProcurementItem[]) => (
    <ProcurementMaterialsTable
      items={items}
      quantities={state.quantities}
      setQty={setQty}
      labels={columnLabels}
      itemName={itemName}
      unitName={unitName}
    />
  );

  const renderSummaryTables = (className?: string) => (
    <div className={className}>
      {summaryByCategory.map(({ cat, catItems }) => (
        <div key={cat} className="mb-6 last:mb-0">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">{categoryName(cat)}</h3>
          <div className="overflow-x-auto">
            <ProcurementSummaryTable
              rows={catItems}
              labels={columnLabels}
              itemName={itemName}
              unitName={unitName}
            />
          </div>
        </div>
      ))}
      <p className="mt-4 text-xs text-muted-foreground italic">{t("procurement.vendorFill")}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => void tryChangeTab(v as TabKey)}>
        <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1.5 shadow-soft">
          {TAB_ORDER.map((k, i) => (
            <TabsTrigger
              key={k}
              value={k}
              className="gap-1.5 rounded-lg data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                {i + 1}
              </span>
              {t(`procurement.tab.${k}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="materials" className="mt-6">
          <SectionCard title={t("procurement.materials.title")} description={t("procurement.materials.desc")} required>
            {attempted.has("materials") && selectedItems.length === 0 && (
              <p className="mb-4 text-sm text-destructive">{t("procurement.validate.materials")}</p>
            )}
            <p className="mb-4 text-xs text-muted-foreground">{t("procurement.vendorFill")}</p>
            <Accordion type="single" collapsible className="w-full">
              {PROCUREMENT_CATEGORIES.map((cat) => {
                const items = itemsByCategory[cat] ?? [];
                if (!items.length) return null;
                const selectedInCat = items.filter((item) => (state.quantities[item.id] ?? 0) > 0).length;
                return (
                  <AccordionItem key={cat} value={cat} className={procurementAccordionItemClass}>
                    <AccordionTrigger className={procurementAccordionTriggerClass}>
                      <span className="flex flex-1 items-center gap-2 text-left normal-case sm:uppercase">
                        {categoryName(cat)}
                        {selectedInCat > 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium normal-case text-amber-800">
                            {selectedInCat} {t("menu.selected")}
                          </span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white px-0 pb-0 pt-0">
                      {renderCategoryItems(items)}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </SectionCard>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <SectionCard title={t("summary.title")} description={t("procurement.summary.desc")}>
            <div id="print-area">
              {selectedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("procurement.noMaterials")}</p>
              ) : (
                <>
                  <div className="no-print">
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue={summaryByCategory[0]?.cat}
                      className="w-full"
                    >
                      {summaryByCategory.map(({ cat, catItems }) => (
                        <AccordionItem key={cat} value={cat} className={procurementAccordionItemClass}>
                          <AccordionTrigger className={procurementAccordionTriggerClass}>
                            <span className="flex-1 text-left">{categoryName(cat)}</span>
                          </AccordionTrigger>
                          <AccordionContent className="bg-white px-2 pb-4 pt-0">
                            <ProcurementSummaryTable
                              rows={catItems}
                              labels={columnLabels}
                              itemName={itemName}
                              unitName={unitName}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <p className="mt-4 text-xs text-muted-foreground italic">{t("procurement.vendorFill")}</p>
                  </div>
                  <div className="print-only">
                    <h2 className="mb-4 font-display text-lg font-semibold">{t("procurement.materials.title")}</h2>
                    {renderSummaryTables()}
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void tryChangeTab(TAB_ORDER[idx - 1])} disabled={idx === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> {t("common.back")}
          </Button>
          {idx < TAB_ORDER.length - 1 ? (
            <Button
              onClick={() => void tryChangeTab(TAB_ORDER[idx + 1])}
              className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            >
              {t("common.next")} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => void handleDownloadPdf()}
              disabled={isPdfGenerating}
              className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            >
              <Printer className="mr-1 h-4 w-4" /> {isPdfGenerating ? t("toast.pdfGenerating") : t("common.downloadPdf")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
