// app/api/admin/chat/groups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Retrieve detailed information about a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const groupId = params.id;

    // Fetch group details
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            profileImage: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                profileImage: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                profileImage: true,
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
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Get message statistics by day (for the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messageStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count 
      FROM message 
      WHERE group_id = ${groupId} AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at) 
      ORDER BY date
    `;

    // Return group with additional statistics
    return NextResponse.json({
      ...group,
      statistics: {
        messagesByDay: messageStats,
        totalMessages: group._count.messages,
        totalMembers: group._count.members,
      },
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return NextResponse.json(
      { error: "Failed to fetch group details" },
      { status: 500 }
    );
  }
}

// PUT: Update a group (name or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const groupId = params.id;
    const body = await request.json();
    const { name, adminId } = body;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (adminId) {
      // Verify new admin user exists and is an admin/teacher
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
      
      updateData.adminId = adminId;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update data provided" },
        { status: 400 }
      );
    }

    // Update group
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a group and all its related data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const groupId = params.id;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Use transaction to ensure all related data is cleaned up
    await prisma.$transaction([
      // Delete all messages associated with the group
      prisma.message.deleteMany({
        where: { groupId },
      }),
      
      // Delete all group memberships
      prisma.groupMember.deleteMany({
        where: { groupId },
      }),
      
      // Finally delete the group itself
      prisma.group.delete({
        where: { id: groupId },
      }),
    ]);

    return NextResponse.json(
      { message: "Group and all associated data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}

// POST: Add members to a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const groupId = params.id;
    const body = await request.json();
    const { userIds, action } = body;

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: "Valid action (add or remove) is required" },
        { status: 400 }
      );
    }

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    let result;

    if (action === 'add') {
      // Verify all users exist
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
      });

      const validUserIds = users.map(user => user.id);
      
      if (validUserIds.length === 0) {
        return NextResponse.json(
          { error: "No valid users found" },
          { status: 400 }
        );
      }

      // Add members to group
      await prisma.groupMember.createMany({
        data: validUserIds.map(userId => ({
          groupId,
          userId,
        })),
        skipDuplicates: true,
      });

      result = {
        message: `Added ${validUserIds.length} members to the group`,
        addedCount: validUserIds.length,
      };
    } else {
      // Remove members from group
      const { count } = await prisma.groupMember.deleteMany({
        where: {
          groupId,
          userId: { in: userIds },
        },
      });

      result = {
        message: `Removed ${count} members from the group`,
        removedCount: count,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error ${request.body.action === 'add' ? 'adding' : 'removing'} group members:`, error);
    return NextResponse.json(
      { error: `Failed to ${request.body.action === 'add' ? 'add' : 'remove'} group members` },
      { status: 500 }
    );
  }
}