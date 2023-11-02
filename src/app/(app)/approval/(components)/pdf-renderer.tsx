'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ZoomIn,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useResizeDetector } from 'react-resize-detector';
import { z } from 'zod';
import Simplebar from 'simplebar-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFRenderer({ url }: { url: string }) {
  const { toast } = useToast();

  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState(1);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;

  const validator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type Validator = z.infer<typeof validator>;

  const form = useForm<Validator>({
    defaultValues: { page: '1' },
    resolver: zodResolver(validator),
  });

  const submit = (data: Validator) => {
    setCurrPage(Number(data.page));
    form.setValue('page', String(data.page));
  };

  return (
    <div className='w-full h-full bg-white rounded-lg shadow-md flex flex-col items-center'>
      <div className='border-b border-zinc-200 w-full flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <Button
            variant='ghost'
            disabled={currPage <= 1}
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              form.setValue('page', String(currPage - 1));
            }}>
            <ChevronLeft className='w-4 h-4' />
          </Button>

          <div className='flex items-center gap-1.5'>
            <Input
              {...form.register('page')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  form.handleSubmit(submit)();
                }
              }}
              className={cn(
                'w-12 h-8',
                form.formState.errors.page && 'focus-visible:ring-red-400',
              )}
            />
            <p className='text-sm space-x-1'>
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currPage === numPages}
            variant='ghost'
            onClick={() => {
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1,
              );
              form.setValue('page', String(currPage + 1));
            }}>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
        <div className='space-x-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='gap-1.5' variant='ghost'>
                <ZoomIn className='h-4 w-4' />
                {scale * 100}%<ChevronDown className='w-3 h-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className='flex-grow w-full h-full'>
        <Simplebar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
          <div ref={ref}>
            <Document
              file={url}
              onLoadError={() =>
                toast({
                  title: 'Error loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                })
              }
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className='flex justify-center'>
                  <Loader2 className='w-4 h-4 my-24 animate-spin' />
                </div>
              }>
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  key={'@' + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? 'hidden' : '')}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                key={'@' + scale}
                loading={
                  <div className='flex justify-center'>
                    <Loader2 className='my-24 h-6 w-6 animate-spin' />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </Simplebar>
      </div>
    </div>
  );
}
