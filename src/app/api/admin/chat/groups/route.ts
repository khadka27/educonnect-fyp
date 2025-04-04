// app/api/admin/chat/groups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: List all groups with pagination and search
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const adminId = searchParams.get("adminId") || "";
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Prepare filters
    const where: any = {};
    
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (adminId) {
      where.adminId = adminId;
    }

    // Fetch groups with related data
    const [groups, totalGroups] = await Promise.all([
      prisma.group.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.group.count({ where }),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalGroups / limit);

    return NextResponse.json({
      groups,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalGroups,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST: Create a new group as an admin
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, adminId, memberIds } = body;

    // Validate required fields
    if (!name || !adminId) {
      return NextResponse.json(
        { error: "Group name and admin ID are required" },
        { status: 400 }
      );
    }

    // Verify admin user exists and has role ADMIN or TEACHER
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    if (adminUser.role !== "ADMIN" && adminUser.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Group admin must be an admin or teacher" },
        { status: 400 }
      );
    }

    // Use transaction to create group and add members
    const result = await prisma.$transaction(async (tx) => {
      // Create the group
      const group = await tx.group.create({
        data: {
          name,
          adminId,
        },
      });

      // Add members if provided
      if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
        // Verify all users exist
        const users = await tx.user.findMany({
          where: { id: { in: memberIds } },
          select: { id: true },
        });

        const validUserIds = users.map(user => user.id);
        
        // Create group memberships
        if (validUserIds.length > 0) {
          await tx.groupMember.createMany({
            data: validUserIds.map(userId => ({
              groupId: group.id,
              userId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Fetch the complete group with members
      return await tx.group.findUnique({
        where: { id: group.id },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}