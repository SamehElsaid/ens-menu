import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CountryRaw } from "@/types/types";

interface Country {
  id: string;
  sortname: string;
  name_en: string;
  name_ar: string;
  phonecode: string;
}

interface PaginatedResponse {
  data: Country[];
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
      10,
    );
    const search = searchParams.get("search") || "";

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        {
          status: false,
          data: { message: "Page must be greater than 0" },
        },
        { status: 400 },
      );
    }

    if (pageLimit < 1) {
      return NextResponse.json(
        {
          status: false,
          data: { message: "Page limit must be greater than 0" },
        },
        { status: 400 },
      );
    }

    // Read country data from JSON file
    const filePath = path.join(process.cwd(), "data", "country.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const countriesData: CountryRaw[] = JSON.parse(fileContents);

    // Map the data to match the interface (name -> name_en)
    let allCountries: Country[] = countriesData.map((country: CountryRaw) => ({
      id: country.id,
      sortname: country.sortname,
      name_en: country.name_en,
      name_ar: country.name_ar,
      phonecode: country.phonecode,
    }));

    // Apply search filter if provided
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();

      allCountries = allCountries.filter((country) => {
        const nameEn = (country.name_en || "").toLowerCase();
        const nameAr = (country.name_ar || "").toLowerCase();
        return nameEn.includes(searchLower) || nameAr.includes(searchLower);
      });
    }

    // Calculate pagination
    const total = allCountries.length;
    const totalPages = Math.ceil(total / pageLimit);
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;

    // Get paginated countries
    const paginatedCountries = allCountries.slice(startIndex, endIndex);

    // Prepare response
    const response: PaginatedResponse = {
      data: paginatedCountries,
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
      { status: 500 },
    );
  }
}
