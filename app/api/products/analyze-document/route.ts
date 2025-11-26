import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzePricingContent } from '@/lib/anthropic';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();
        let textContent = '';

        // Extract text based on file type
        if (fileName.endsWith('.pdf')) {
            try {
                const data = await pdf(buffer);
                textContent = data.text;
            } catch (e) {
                return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 400 });
            }
        } else if (fileName.endsWith('.docx')) {
            try {
                const result = await mammoth.extractRawText({ buffer });
                textContent = result.value;
            } catch (e) {
                return NextResponse.json({ error: 'Failed to parse Word document' }, { status: 400 });
            }
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            try {
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                textContent = workbook.SheetNames.map(name => {
                    const sheet = workbook.Sheets[name];
                    return `Sheet: ${name}\n${XLSX.utils.sheet_to_txt(sheet)}`;
                }).join('\n\n');
            } catch (e) {
                return NextResponse.json({ error: 'Failed to parse Excel file' }, { status: 400 });
            }
        } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
            textContent = buffer.toString('utf-8');
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload PDF, DOCX, XLSX, or TXT files.' },
                { status: 400 }
            );
        }

        // Clean up and limit content
        textContent = textContent
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();

        if (textContent.length > 15000) {
            textContent = textContent.slice(0, 15000) + '...';
        }

        if (textContent.length < 50) {
            return NextResponse.json(
                { error: 'Could not extract sufficient text from the document.' },
                { status: 400 }
            );
        }

        // Analyze with Claude Sonnet 4
        const pricingData = await analyzePricingContent(textContent);

        // TODO: Upload file to S3/R2 and store URL
        // const sourceFileUrl = await uploadToStorage(buffer, file.name);

        return NextResponse.json({
            pricingData,
            rawContent: textContent,
            sourceFileName: file.name,
            // sourceFileUrl,
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze document' },
            { status: 500 }
        );
    }
}
