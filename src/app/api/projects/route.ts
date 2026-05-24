import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { verifySession } from "@/lib/dal";
import Project from "@/models/Project";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    await connectDB();

    const { searchParams } = new URL(request.url);

    const limit = Number(searchParams.get("limit")) || 10;
    const page = Number(searchParams.get("page")) || 1;

    const projects = await Project.find({
      creator: new mongoose.Types.ObjectId(session.userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      {
        status: 500,
      },
    );
  }
}
