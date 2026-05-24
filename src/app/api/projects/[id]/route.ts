import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { verifySession } from "@/lib/dal";
import Project from "@/models/Project";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifySession();

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        {
          status: 404,
        },
      );
    }

    if (project.creator.toString() !== session.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 403,
        },
      );
    }

    if (body.name !== undefined) {
      project.name = body.name;
    }

    if (body.description !== undefined) {
      project.description = body.description;
    }

    if (body.code !== undefined) {
      project.code = body.code;
    }

    project.updatedAt = new Date();

    await project.save();

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project",
      },
      {
        status: 500,
      },
    );
  }
}
