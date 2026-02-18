// API Client for Context API
// Base URL can be configured via localStorage or environment

const DEFAULT_API_URL = import.meta.env.VITE_BASE_URL ?? "http://localhost:3000";

export const getApiUrl = (): string => {
  return DEFAULT_API_URL;
};

export const setApiUrl = (url: string): void => {
  localStorage.setItem("api_base_url", url);
};

export interface ApiContext {
  token: string;
  tenantId?: string;
  userId?: string;
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  correlationId?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  ok: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  ctx: ApiContext,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, correlationId } = options;

  const baseUrl = getApiUrl();

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (ctx.token) {
    requestHeaders["Authorization"] = `Bearer ${ctx.token}`;
  }

  if (ctx.tenantId) {
    requestHeaders["x-tenant-id"] = ctx.tenantId;
  }

  if (ctx.userId) {
    requestHeaders["x-user-id"] = ctx.userId;
  }

  if (correlationId) {
    requestHeaders["correlation_id"] = correlationId;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Query endpoints (GET)
export const queryEndpoints = {
  tables: "/api/query/tables-collection",
  shifts: "/api/query/shifts-collection",
  clerks: "/api/query/clerks-collection",
  clerksToInvite: "/api/query/clerkstoinvite-collection",
  tasks: "/api/query/tasks-collection",
  menus: "/api/query/uploadedmenus-collection",
  serviceDays: "/api/query/servicedays-collection",
  timeslots: "/api/query/configuredtimeslots-collection",
  vacations: "/api/query/plannedvacations-collection",
  shiftAssignments: "/api/query/shiftassignments-collection",
  shiftsForAssignments: "/api/query/shiftsforassignments-collection",
  images: "/api/query/uploadedimages-collection",
};

// Command endpoints (POST)
export const commandEndpoints = {
  registerRestaurant: "/api/register-restaurant",
  addTable: "/api/addtable",
  updateTable: "/api/updatetable",
  removeTable: "/api/removetable",
  blockTableReservation: "/api/blocktablereservation",
  unblockTableReservation: "/api/unblocktablereservation",
  createShift: "/api/createshift",
  activateShift: "/api/activateshift",
  deleteShift: "/api/deleteshift",
  assignShift: "/api/assignshift",
  unassignShift: "/api/unassignshift",
  registerClerk: "/api/registerclerk",
  deactivateClerk: "/api/deactivateclerk",
  removeClerk: "/api/removeclerk",
  confirmInvitation: "/api/confirminvitation",
  
  updateTask: "/api/updatetask",
  deleteTask: "/api/deletetask",
  uploadMenu: "/api/uploadmenu",
  deleteMenu: "/api/deletemenu",
  uploadImage: "/api/uploadimage",
  cancelReservation: "/api/cancelreservation",
  addServiceDay: "/api/addserviceday",
  configureTimeslot: "/api/configuretimeslot",
  planVacation: "/api/planvacation",
  cancelVacation: "/api/cancelvacation",
  activateOnlineReservation: "/api/activateonlinereservation",
  deactivateOnlineReservation: "/api/deactivateonlinereservation",
  registerNoShow: "/api/registernoshow",
  registerShowUp: "/api/registershowup",
};
