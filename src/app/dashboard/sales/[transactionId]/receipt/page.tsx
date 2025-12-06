'use client';

import { useRef, forwardRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useReactToPrint } from 'react-to-print';
import { Loader2, Printer, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useSettings } from '@/contexts/settings-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Transaction } from '@/lib/data-types';
import { ReceiptTemplate1, ReceiptTemplate2, ReceiptTemplate3, ReceiptTemplate4 } from '@/components/receipt-templates';

const PrintableReceipt = forwardRef<HTMLDivElement, { transaction: Transaction | null, shop: any }>(({ transaction, shop }, ref) => {
    if (!transaction || !shop) {
        return <div ref={ref}><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const renderReceipt = () => {
        switch (shop.receiptTemplate) {
            case 'template1':
                return <ReceiptTemplate1 transaction={transaction} shop={shop} />;
            case 'template2':
                return <ReceiptTemplate2 transaction={transaction} shop={shop} />;
            case 'template3':
                return <ReceiptTemplate3 transaction={transaction} shop={shop} />;
            case 'template4':
                return <ReceiptTemplate4 transaction={transaction} shop={shop} />;
            default:
                return <ReceiptTemplate1 transaction={transaction} shop={shop} />;
        }
    };
    
    return (
        <div ref={ref} className="p-4 bg-white">
            {renderReceipt()}
        </div>
    );
});
PrintableReceipt.displayName = 'PrintableReceipt';


export default function ReceiptPage() {
    const params = useParams();
    const transactionId = params.transactionId as string;

    const firestore = useFirestore();
    const { settings, loading: settingsLoading } = useSettings();
    const shopId = settings?.id;

    const [isSharingSupported, setIsSharingSupported] = useState(false);

    useEffect(() => {
        if (navigator.share) {
            setIsSharingSupported(true);
        }
    }, []);

    const transactionDocRef = useMemoFirebase(() => {
        if (shopId && transactionId) {
            return doc(firestore, 'shops', shopId, 'transactions', transactionId);
        }
        return null;
    }, [firestore, shopId, transactionId]);

    const { data: transaction, isLoading: transactionLoading } = useDoc<Transaction>(transactionDocRef);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `receipt-${transaction?.id.substring(0, 7) || 'sale'}`,
    });
    
    const generatePdf = async (action: 'download' | 'share') => {
        const input = componentRef.current;
        if (!input) return;
    
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
    
        // Calculate dimensions
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
    
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const fileName = `receipt-${transaction?.id.substring(0, 7) || 'sale'}.pdf`;

        if (action === 'download') {
            pdf.save(fileName);
        } else if (action === 'share' && isSharingSupported) {
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
            try {
                await navigator.share({
                    title: `Receipt for ${shopId}`,
                    text: `Here is your receipt for transaction #${transactionId.substring(0, 7)}`,
                    files: [pdfFile]
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };
    
    const isLoading = settingsLoading || transactionLoading;

    return (
        <div className="max-w-4xl mx-auto space-y-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Sale Receipt</CardTitle>
                        <CardDescription>Transaction ID: #{transactionId.substring(0, 7)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint} disabled={isLoading}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                         <Button variant="outline" onClick={() => generatePdf('download')} disabled={isLoading}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        {isSharingSupported && (
                             <Button variant="outline" onClick={() => generatePdf('share')} disabled={isLoading}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="bg-gray-200 p-4 sm:p-8 flex justify-center">
                   <div className="w-full sm:w-auto">
                       <PrintableReceipt ref={componentRef} transaction={transaction} shop={settings} />
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}
