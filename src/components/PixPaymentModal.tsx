import { useState, useEffect } from 'react';
import { Copy, Check, Clock, Loader2, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCheckPaymentStatus } from '@/hooks/usePayment';

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  qrCode: string;
  qrCodeBase64: string;
  expirationDate: string;
  onPaymentConfirmed: () => void;
}

const PixPaymentModal = ({
  open,
  onOpenChange,
  orderId,
  qrCode,
  qrCodeBase64,
  expirationDate,
  onPaymentConfirmed,
}: PixPaymentModalProps) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const checkPayment = useCheckPaymentStatus();

  useEffect(() => {
    if (!open) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expiration = new Date(expirationDate);
      const diff = expiration.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expirado');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expirationDate, open]);

  useEffect(() => {
    if (!open) return;

    const checkStatus = async () => {
      try {
        const result = await checkPayment.mutateAsync(orderId);
        if (result.payment_status === 'paid') {
          onPaymentConfirmed();
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [open, orderId, checkPayment, onPaymentConfirmed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Expira em: {timeLeft}</span>
          </div>

          <div className="flex justify-center">
            {qrCodeBase64 ? (
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-48 h-48 rounded-lg border"
              />
            ) : (
              <div className="w-48 h-48 rounded-lg border flex items-center justify-center bg-muted">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Ou copie o código PIX:
            </p>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded-lg overflow-hidden">
                <p className="text-xs font-mono truncate">{qrCode}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Aguardando pagamento...</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              O status será atualizado automaticamente após a confirmação.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixPaymentModal;
