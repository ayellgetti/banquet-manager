import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentMethod, PaymentType } from "@/data/banquetData";
import {
  useBookingsQuery,
  useCreatePaymentMutation,
  useVendorsQuery,
} from "@/hooks/useBanquetData";
import { useT } from "@/i18n";
import { toast } from "sonner";

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "upi", "card", "bank"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBookingId?: string;
  initialPaymentType?: PaymentType;
};

export const RecordPaymentModal = ({
  open,
  onOpenChange,
  initialBookingId,
  initialPaymentType = "income",
}: Props) => {
  const { t } = useT();
  const { data: bookings } = useBookingsQuery(open);
  const { data: vendors } = useVendorsQuery();
  const createMutation = useCreatePaymentMutation();

  const [paymentType, setPaymentType] = useState<PaymentType>(initialPaymentType);
  const [bookingId, setBookingId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [description, setDescription] = useState("");

  const isIncome = paymentType === "income";

  useEffect(() => {
    if (!open) return;
    setPaymentType(initialPaymentType);
    setBookingId(initialBookingId ?? "");
    setVendorId("");
    setAmount("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setMethod("cash");
    setReceivedFrom("");
    setPaidTo("");
    setDescription("");
  }, [open, initialBookingId, initialPaymentType]);

  useEffect(() => {
    if (!isIncome || !bookingId || !bookings) return;
    const booking = bookings.find((item) => item.id === bookingId);
    if (booking && !receivedFrom) {
      setReceivedFrom(booking.clientName);
    }
  }, [bookingId, bookings, receivedFrom, isIncome]);

  useEffect(() => {
    if (isIncome || !vendorId || !vendors) return;
    const vendor = vendors.find((item) => item.id === vendorId);
    if (vendor && !paidTo) {
      setPaidTo(vendor.name);
    }
  }, [vendorId, vendors, paidTo, isIncome]);

  const handleTypeChange = (value: string) => {
    const nextType = value as PaymentType;
    setPaymentType(nextType);
    setBookingId("");
    setVendorId("");
    setReceivedFrom("");
    setPaidTo("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error(t("payments.form.validate.amount"));
      return;
    }

    try {
      await createMutation.mutateAsync({
        paymentType,
        bookingId: isIncome ? bookingId || undefined : undefined,
        vendorId: isIncome ? undefined : vendorId || undefined,
        amount: parsedAmount,
        date,
        method,
        receivedFrom: isIncome ? receivedFrom.trim() || undefined : undefined,
        paidTo: isIncome ? undefined : paidTo.trim() || undefined,
        description: description.trim() || undefined,
      });
      toast.success(t("payments.form.success"));
      onOpenChange(false);
    } catch {
      toast.error(t("payments.form.failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-y-auto p-0 sm:max-w-md scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {t("payments.recordPayment")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isIncome ? t("payments.form.desc.income") : t("payments.form.desc.expense")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-6 py-5">
          <Tabs value={paymentType} onValueChange={handleTypeChange}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/70 bg-card p-1.5 shadow-soft">
              <TabsTrigger value="income" className="rounded-lg text-sm">
                {t("payments.type.income")}
              </TabsTrigger>
              <TabsTrigger value="expense" className="rounded-lg text-sm">
                {t("payments.type.expense")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isIncome ? (
            <>
              <div className="space-y-2">
                <Label>{t("payments.form.booking")}</Label>
                <Select
                  value={bookingId || "none"}
                  onValueChange={(v) => setBookingId(v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("payments.form.booking.ph")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("payments.form.booking.none")}</SelectItem>
                    {bookings?.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.title} · {booking.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-received-from">{t("payments.form.receivedFrom")}</Label>
                <Input
                  id="payment-received-from"
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                  placeholder={t("payments.form.receivedFrom.ph")}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t("payments.form.vendor")}</Label>
                <Select
                  value={vendorId || "none"}
                  onValueChange={(v) => setVendorId(v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("payments.form.vendor.ph")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("payments.form.vendor.none")}</SelectItem>
                    {vendors?.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} · {vendor.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-paid-to">{t("payments.form.paidTo")}</Label>
                <Input
                  id="payment-paid-to"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder={t("payments.form.paidTo.ph")}
                />
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">{t("payments.col.amount")}</Label>
              <Input
                id="payment-amount"
                type="number"
                min={1}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-date">{t("payments.col.date")}</Label>
              <Input
                id="payment-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("payments.col.method")}</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`payments.method.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-note">{t("payments.form.note")}</Label>
            <Textarea
              id="payment-note"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("payments.form.note.ph")}
              rows={3}
            />
          </div>

          <DialogFooter className="border-t border-border/60 px-0 pb-0 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createMutation.isPending ? t("payments.form.submitting") : t("payments.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
