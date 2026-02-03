import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { StateRaw } from "@/modules/Header/types";

interface State {
  id: string;
  name_en: string;
  name_ar: string;
  country_id: string;
}

interface PaginatedResponse {
  data: State[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isPrevious: boolean;
  isNext: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageLimit = parseInt(
      searchParams.get("pageLimit") || searchParams.get("limit") || "10",
      10
    );
    const countryId = searchParams.get("countryId") || "";
    const search = searchParams.get("search") || "";

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        {
          status: false,
          data: { message: "Page must be greater than 0" },
        },
        { status: 400 }
      );
    }

    if (pageLimit < 1) {
      return NextResponse.json(
        {
          status: false,
          data: { message: "Page limit must be greater than 0" },
        },
        { status: 400 }
      );
    }

    // Read country data from JSON file
    const filePath = path.join(process.cwd(), "data", "state.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const statesData: StateRaw[] = JSON.parse(fileContents);

    // Map the data to match the interface (name -> name_en)
    let allStates: State[] = statesData.map((state: StateRaw) => ({
      id: state.id,
      name_en: state.name_en,
      name_ar: state.name_ar,
      country_id: state.country_id,
    }));

    if (countryId.trim()) {
      allStates = allStates.filter((state) => state.country_id == countryId);
    } else {
      allStates = [];
    }

    // Apply search filter if provided
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      allStates = allStates.filter((state) => {
        const nameEn = (state.name_en || "").toLowerCase();
        const nameAr = (state.name_ar || "").toLowerCase();
        return nameEn.includes(searchLower) || nameAr.includes(searchLower);
      });
    }

    // Calculate pagination
    const total = allStates.length;
    const totalPages = Math.ceil(total / pageLimit);
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;

    // Get paginated countries
    const paginatedStates = allStates.slice(startIndex, endIndex);

    // Prepare response
    const response: PaginatedResponse = {
      data: paginatedStates,
      page,
      limit: pageLimit,
      total,
      totalPages,
      isPrevious: page > 1,
      isNext: endIndex < total,
    };

    return NextResponse.json({
      status: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      {
        status: false,
        data: { message: "Failed to fetch countries" },
      },
      { status: 500 }
    );
  }
}
