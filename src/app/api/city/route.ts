import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CityRaw } from "@/modules/Header/types";

interface City {
  id: string;
  name_en: string;
  name_ar: string;
  state_id: string;
}

interface PaginatedResponse {
  data: City[];
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
    const stateId = searchParams.get("stateId") || "";
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
    const filePath = path.join(process.cwd(), "data", "city.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const citiesData: CityRaw[] = JSON.parse(fileContents);

    // Map the data to match the interface (name -> name_en)
    let allCities: City[] = citiesData.map((city: CityRaw) => ({
      id: city.id,
      name_en: city.name_en,
      name_ar: city.name_ar,
      state_id: city.state_id,
    }));

    if (stateId.trim()) {
      allCities = allCities.filter((city) => city.state_id == stateId);
    } else {
      allCities = [];
    }

    // Apply search filter if provided
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      allCities = allCities.filter((city) => {
        const nameEn = (city.name_en || "").toLowerCase();
        const nameAr = (city.name_ar || "").toLowerCase();
        return nameEn.includes(searchLower) || nameAr.includes(searchLower);
      });
    }

    // Calculate pagination
    const total = allCities.length;
    const totalPages = Math.ceil(total / pageLimit);
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;

    // Get paginated cities
    const paginatedCities = allCities.slice(startIndex, endIndex);

    // Prepare response
    const response: PaginatedResponse = {
      data: paginatedCities,
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
