import { format } from "date-fns";
import { Loader2, PackageCheck, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AddMaterialModal } from "@/components/inventory/AddMaterialModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCalendarEventsQuery,
  useCreateInventoryOrderMutation,
  useVendorsQuery,
} from "@/hooks/useBanquetData";
import { useT } from "@/i18n";
import { useProcurementLabels } from "@/i18n/procurementLabels";
import { ApiError } from "@/lib/apiClient";
import type { CreateInventoryOrderLineInput } from "@/lib/inventoryOrdersApi";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NONE_EVENT = "__none__";

const defaultDeliveryAt = () => {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  date.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const PlaceInventoryOrderModal = ({ open, onOpenChange }: Props) => {
  const { t } = useT();
  const { unitName } = useProcurementLabels();
  const { data: vendors } = useVendorsQuery(open);
  const { data: events } = useCalendarEventsQuery();
  const createMutation = useCreateInventoryOrderMutation();

  const [vendorId, setVendorId] = useState("");
  const [eventId, setEventId] = useState(NONE_EVENT);
  const [deliveryAt, setDeliveryAt] = useState(defaultDeliveryAt);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<CreateInventoryOrderLineInput[]>([]);
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);

  const eventOptions = useMemo(() => {
    if (!events) return [];
    return events
      .filter((event) => event.status !== "enquiry")
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const reset = () => {
    setVendorId("");
    setEventId(NONE_EVENT);
    setDeliveryAt(defaultDeliveryAt());
    setNotes("");
    setLineItems([]);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const handleAddMaterial = (item: CreateInventoryOrderLineInput) => {
    setLineItems((prev) => [...prev, item]);
  };

  const handleRemoveLine = (materialId: string) => {
    setLineItems((prev) => prev.filter((line) => line.materialId !== materialId));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!vendorId) {
      toast.error(t("orderInventory.validate.vendor"));
      return;
    }
    if (!deliveryAt) {
      toast.error(t("orderInventory.validate.delivery"));
      return;
    }
    if (lineItems.length === 0) {
      toast.error(t("orderInventory.validate.items"));
      return;
    }

    try {
      await createMutation.mutateAsync({
        vendorId,
        eventId: eventId === NONE_EVENT ? null : eventId,
        deliveryAt: new Date(deliveryAt).toISOString(),
        notes: notes.trim() || null,
        lineItems,
      });
      toast.success(t("orderInventory.placed"));
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("orderInventory.placeError");
      toast.error(message);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/70 px-6 py-4">
            <DialogTitle>{t("orderInventory.placeOrder")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-4 overflow-y-auto px-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("orderInventory.vendor")}</Label>
                  <Select value={vendorId || undefined} onValueChange={setVendorId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("orderInventory.vendorPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(vendors ?? []).map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("orderInventory.deliveryAt")}</Label>
                  <Input
                    type="datetime-local"
                    value={deliveryAt}
                    onChange={(e) => setDeliveryAt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("orderInventory.tagEvent")}</Label>
                  <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("orderInventory.tagEventPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_EVENT}>{t("orderInventory.noEvent")}</SelectItem>
                      {eventOptions.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} · {event.client} ·{" "}
                          {format(new Date(`${event.date}T00:00:00`), "dd MMM yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-notes">{t("orderInventory.notes")}</Label>
                <Textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={t("orderInventory.notesPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>{t("orderInventory.materials")}</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setAddMaterialOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {t("orderInventory.addItem")}
                  </Button>
                </div>

                {lineItems.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/70 px-3 py-6 text-center text-sm text-muted-foreground">
                    {t("orderInventory.emptyItems")}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border/70">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("orderInventory.col.material")}</TableHead>
                          <TableHead className="text-right">{t("orderInventory.col.qty")}</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((line) => (
                          <TableRow key={line.materialId}>
                            <TableCell className="font-medium">
                              {line.materialName}
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {unitName(line.unit)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{line.quantity}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleRemoveLine(line.materialId)}
                                aria-label={t("orderInventory.removeItem")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-border/70 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackageCheck className="h-4 w-4" />
                )}
                {t("orderInventory.placeOrder")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AddMaterialModal
        open={addMaterialOpen}
        onOpenChange={setAddMaterialOpen}
        existingMaterialIds={lineItems.map((line) => line.materialId)}
        onAdd={handleAddMaterial}
      />
    </>
  );
};
