import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 })
  }

  try {
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { adminId: userId },
          { members: { some: { userId: userId } } }
        ]
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        }
      }
    })
    return NextResponse.json({ success: true, data: groups })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error fetching groups' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, adminId, memberIds } = body

  if (!name || !adminId || !memberIds || memberIds.length === 0) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
  }

  try {
    const group = await prisma.group.create({
      data: {
        name,
        adminId,
        members: {
          create: memberIds.map((userId: string) => ({ userId }))
        }
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        }
      }
    })
    return NextResponse.json({ success: true, data: group }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error creating group' }, { status: 500 })
  }
}