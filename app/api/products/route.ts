import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - List all products
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, sourceType, sourceUrl, sourceFileUrl, pricingData, rawContent, currency } = await req.json();

        if (!name || !pricingData) {
            return NextResponse.json({ error: 'Name and pricing data are required' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                userId: session.user.id,
                name,
                sourceType: sourceType || 'manual',
                sourceUrl,
                sourceFileUrl,
                pricingData,
                rawContent,
                currency: currency || 'USD',
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
