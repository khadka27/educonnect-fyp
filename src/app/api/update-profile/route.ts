import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await getSession({ req: request as any });

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { password } = await request.json();

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword }
      });
    }
    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}

// Other HTTP methods can be exported similarly if needed.
