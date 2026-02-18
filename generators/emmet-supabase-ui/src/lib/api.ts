// Centralized API functions
import {apiRequest, commandEndpoints, getApiUrl, ApiContext} from "./api-client";
import {supabase} from "@/integrations/supabase/client";
import {Location, Table, Shift, Clerk, Task, Menu, ReservationTemplate, Vacation} from "@/types";
import {v4} from "uuid";

// ==================== LOCATIONS ====================

interface DbLocation {
    location_id: string;
    name: string;
    zip_code: string;
    city: string;
}

const transformDbLocation = (dbLocation: DbLocation): Location => ({
    location_id: dbLocation.location_id,
    name: dbLocation.name || "",
    street: "",
    housenumber: "",
    zipCode: dbLocation.zip_code || "",
    city: dbLocation.city || "",
});

// ==================== TENANTS ====================

export interface RegisterTenantParams {
    tenantId: string;
    name: string;
    ownerId: string;
}

export async function registerTenant(params: RegisterTenantParams, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.registerRestaurant}/${params.tenantId}`,
        ctx,
        {
            method: "POST",
            body: {
                tenantId: params.tenantId,
                name: params.name,
                ownerId: params.ownerId,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== TABLES ====================

interface DbTable {
    table_id: string;
    name: string;
    seats: number;
    blocked: boolean;
}

const transformDbTable = (dbTable: DbTable): Table => ({
    tableId: dbTable.table_id,
    name: dbTable.name || "",
    seats: dbTable.seats || 0,
    minPersons: 1,
    reservable: true,
    blocked: dbTable.blocked ?? false,
});

export async function fetchTables(_token: string): Promise<Table[]> {
    const { data, error } = await supabase
        .from("tables")
        .select("*");
    
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbTable);
}

export async function fetchTable(id: string, _token: string): Promise<Table | null> {
    const { data, error } = await supabase
        .from("tables")
        .select("*")
        .eq("table_id", id)
        .single();
    
    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return data ? transformDbTable(data) : null;
}

export interface AddTableParams {
    name: string;
    seats: number;
    minPersons?: number;
    reservable: boolean;
}

export async function addTable(params: AddTableParams, ctx: ApiContext) {
    const tableId =  v4()
    const response = await apiRequest(
        `${commandEndpoints.addTable}/${tableId}`,
        ctx,
        {
            method: "POST",
            body: {
                tableid: tableId,
                ...params,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export interface UpdateTableParams {
    tableId: string;
    name: string;
    seats: number;
    minPersons?: number;
    reservable: boolean;
}

export async function updateTable(params: UpdateTableParams, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.updateTable}/${params.tableId}`,
        ctx,
        {
            method: "POST",
            body: {
                tableid: params.tableId,
                name: params.name,
                seats: params.seats,
                minPersons: params.minPersons,
                reservable: params.reservable,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function removeTable(tableId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.removeTable}/${tableId}`,
        ctx,
        {
            method: "POST",
            body: {tableId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function blockTable(tableId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.blockTableReservation}/${tableId}`,
        ctx,
        {
            method: "POST",
            body: {tableId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function unblockTable(tableId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.unblockTableReservation}/${tableId}`,
        ctx,
        {
            method: "POST",
            body: {tableId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== SHIFTS ====================

interface DbShift {
    shift_id: string;
    restaurant_id: string;
    days: string[];
    description: string;
    start: string;
    end: string;
}

const transformDbShift = (dbShift: DbShift): Shift => ({
    shift_id: dbShift.shift_id,
    restaurant_id: dbShift.restaurant_id || "",
    description: dbShift.description || "",
    days: Array.isArray(dbShift.days) ? dbShift.days.join(", ") : "",
    start: dbShift.start || "",
    end: dbShift.end || "",
    active: true,
});

export async function fetchShifts(_token: string): Promise<Shift[]> {
    const { data, error } = await supabase
        .from("shifts")
        .select("*");
    
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbShift);
}

export async function fetchShift(id: string, _token: string): Promise<Shift | null> {
    const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("shift_id", id)
        .single();
    
    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return data ? transformDbShift(data) : null;
}

export interface CreateShiftParams {
    restaurantId: string;
    description: string;
    days: string[];
    start: string;
    end: string;
}

export async function createShift(params: CreateShiftParams, ctx: ApiContext) {
    const shiftId = `shift-${Date.now()}`;
    const response = await apiRequest(
        `${commandEndpoints.createShift}/${shiftId}`,
        ctx,
        {
            method: "POST",
            body: {
                shift_id: shiftId,
                ...params,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function activateShift(restaurantId: string, shift_id: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.activateShift}/${shift_id}`,
        ctx,
        {
            method: "POST",
            body: {restaurantId, shift_id},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function deleteShift(restaurantId: string, shift_id: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.deleteShift}/${shift_id}`,
        ctx,
        {
            method: "POST",
            body: {restaurantId, shift_id},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export interface AssignShiftParams {
    restaurantId: string;
    shift_id: string;
    clerkId: string;
}

export async function assignShift(params: AssignShiftParams, ctx: ApiContext) {
    const assignmentId = `assign-${Date.now()}`;
    const response = await apiRequest(
        `${commandEndpoints.assignShift}/${assignmentId}`,
        ctx,
        {
            method: "POST",
            body: params,
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function unassignShift(params: AssignShiftParams, ctx: ApiContext) {
    const unassignId = `unassign-${Date.now()}`;
    const response = await apiRequest(
        `${commandEndpoints.unassignShift}/${unassignId}`,
        ctx,
        {
            method: "POST",
            body: params,
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== CLERKS ====================

interface DbClerk {
    clerk_id: string;
    email: string;
    name: string;
    phone: string;
    role: string;
    surname: string;
}

const transformDbClerk = (dbClerk: DbClerk): Clerk => ({
    clerkId: dbClerk.clerk_id,
    name: dbClerk.name || "",
    surname: dbClerk.surname || "",
    email: dbClerk.email || "",
    phone: dbClerk.phone || "",
    role: dbClerk.role || "",
    active: true,
});

export async function fetchClerks(_token: string): Promise<Clerk[]> {
    const { data, error } = await supabase
        .from("clerks")
        .select("*");
    
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbClerk);
}

export async function fetchClerk(id: string, _token: string): Promise<Clerk | null> {
    const { data, error } = await supabase
        .from("clerks")
        .select("*")
        .eq("clerk_id", id)
        .single();
    
    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return data ? transformDbClerk(data) : null;
}

export interface RegisterClerkParams {
    name: string;
    surname: string;
    email: string;
    phone: string;
    role: string;
}

export async function registerClerk(params: RegisterClerkParams, ctx: ApiContext) {
    const clerkId = v4()
    const response = await apiRequest(
        `${commandEndpoints.registerClerk}/${clerkId}`,
        ctx,
        {
            method: "POST",
            body: {
                clerkId,
                ...params,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function deactivateClerk(clerkId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.deactivateClerk}/${clerkId}`,
        ctx,
        {
            method: "POST",
            body: {clerkid: clerkId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function removeClerk(clerkId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.removeClerk}/${clerkId}`,
        ctx,
        {
            method: "POST",
            body: {clerkid: clerkId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function confirmInvitation(clerkId: string, ctx: ApiContext) {
    const confirmId = `confirm-${Date.now()}`;
    const response = await apiRequest(
        `${commandEndpoints.confirmInvitation}/${confirmId}`,
        ctx,
        {
            method: "POST",
            body: {clerkId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== TASKS ====================

interface DbTask {
    task_id: string;
    assigned_clerk: string;
    date: string;
    description: string;
    interval: string;
    repeats: string[];
    repeat_time: string;
    title: string;
}

const transformDbTask = (dbTask: DbTask): Task => ({
    taskId: dbTask.task_id,
    title: dbTask.title || "",
    description: dbTask.description || "",
    assignedClerk: dbTask.assigned_clerk || "",
    date: dbTask.date || "",
    interval: dbTask.interval || "",
    repeats: Array.isArray(dbTask.repeats) ? dbTask.repeats : [],
    repeatTime: dbTask.repeat_time || "",
});

export async function fetchTasks(_token: string): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*");
    
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbTask);
}

export async function fetchTask(id: string, _token: string): Promise<Task | null> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_id", id)
        .single();
    
    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return data ? transformDbTask(data) : null;
}

export interface AddTaskParams {
    title: string;
    description: string;
    assignedClerk: string;
    date: string;
    interval: string;
    repeats: string[];
    repeatTime: string;
}

export async function addTask(params: AddTaskParams, ctx: ApiContext) {
    const taskId = v4();
    const response = await apiRequest(
        `${commandEndpoints.updateTask}/${taskId}`,
        ctx,
        {
            method: "POST",
            body: {
                taskId,
                ...params,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export interface UpdateTaskParams {
    taskId: string;
    title: string;
    description: string;
    assignedClerk: string;
    date: string;
    interval: string;
    repeats: string[];
    repeatTime: string;
}

export async function updateTask(params: UpdateTaskParams, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.updateTask}/${params.taskId}`,
        ctx,
        {
            method: "POST",
            body: params,
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function deleteTask(taskId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.deleteTask}/${taskId}`,
        ctx,
        {
            method: "POST",
            body: {taskId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== MENUS ====================

interface DbMenu {
    menu_id: string;
    file: string;
    restaurant_id: string;
    menu_name: string;
    menu_type: string;
}

const transformDbMenu = (dbMenu: DbMenu): Menu => ({
    menuId: dbMenu.menu_id,
    menuName: dbMenu.menu_name || "",
    menuType: dbMenu.menu_type || "",
    file: dbMenu.file || "",
    restaurant_id: dbMenu.restaurant_id || "",
});

export async function fetchMenus(_token: string): Promise<Menu[]> {
    const { data, error } = await supabase
        .from("uploaded_menus")
        .select("*");
    
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbMenu);
}

export async function fetchMenu(id: string, _token: string): Promise<Menu | null> {
    const { data, error } = await supabase
        .from("uploaded_menus")
        .select("*")
        .eq("menu_id", id)
        .single();
    
    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return data ? transformDbMenu(data) : null;
}

export interface UploadMenuParams {
    menuName: string;
    menuType: string;
    file: string;
    restaurantId: string;
}

export async function uploadMenu(params: UploadMenuParams, ctx: ApiContext) {
    const menuId = `menu-${Date.now()}`;
    const response = await apiRequest(
        `${commandEndpoints.uploadMenu}/${menuId}`,
        ctx,
        {
            method: "POST",
            body: {
                menuId,
                ...params,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function deleteMenu(menuId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.deleteMenu}/${menuId}`,
        ctx,
        {
            method: "POST",
            body: {menuId},
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== ACTIVE SHIFTS DASHBOARD ====================

interface DbActiveShiftDashboard {
    shift_id: string;
    name: string;
    from_to: string;
    assignees: string[];
    restaurant_id: string;
}

const transformDbActiveShift = (db: DbActiveShiftDashboard): import("@/types").ActiveShiftDashboard => ({
    shiftId: db.shift_id,
    name: db.name || "",
    fromTo: db.from_to || "",
    assignees: Array.isArray(db.assignees) ? db.assignees : [],
    restaurantId: db.restaurant_id || "",
});

export async function fetchActiveShiftsForDashboard(_token: string, restaurantId?: string): Promise<import("@/types").ActiveShiftDashboard[]> {
    let query = supabase.from("active_shifts_for_dashboard").select("*");
    if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
    }
    const { data, error } = await query;
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbActiveShift);
}

// ==================== ACTIVE TASKS DASHBOARD ====================

interface DbActiveTaskDashboard {
    task_id: string;
    title: string;
    description: string;
    assigned_clerk: string;
    date: string;
    interval: string;
    repeats: string[];
    repeat_time: string;
    restaurant_id: string;
}

const transformDbActiveTask = (db: DbActiveTaskDashboard): import("@/types").ActiveTaskDashboard => ({
    taskId: db.task_id,
    title: db.title || "",
    description: db.description || "",
    assignedClerk: db.assigned_clerk || "",
    date: db.date || "",
    interval: db.interval || "",
    repeats: Array.isArray(db.repeats) ? db.repeats : [],
    repeatTime: db.repeat_time || "",
    restaurantId: db.restaurant_id || "",
});

export async function fetchActiveTasksForDashboard(_token: string, restaurantId?: string): Promise<import("@/types").ActiveTaskDashboard[]> {
    let query = supabase.from("active_tasks_for_dashboard").select("*");
    if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
    }
    const { data, error } = await query;
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbActiveTask);
}

// ==================== RESERVATION TEMPLATES ====================

interface DbReservationTemplate {
    template_id: string;
    restaurant_id: string;
    template_type: string;
    template: string;
}

const transformDbReservationTemplate = (dbTemplate: DbReservationTemplate): ReservationTemplate => ({
    templateId: dbTemplate.template_id,
    restaurantId: dbTemplate.restaurant_id || "",
    templateType: dbTemplate.template_type as "EMAIL" | "PHONE",
    template: dbTemplate.template || "",
});

export async function fetchReservationTemplates(_token: string): Promise<ReservationTemplate[]> {
    const { data, error } = await supabase
        .from("reservation_templates")
        .select("*");
    
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbReservationTemplate);
}

export interface SaveReservationTemplateParams {
    templateId: string;
    restaurantId?: string;
    templateType: string;
    template: string;
}

export async function saveReservationTemplate(params: SaveReservationTemplateParams, ctx: ApiContext) {
    const response = await apiRequest(
        `/api/saveconfirmationtemplate/${params.templateId}`,
        ctx,
        {
            method: "POST",
            body: {
                restaurantId: params.restaurantId,
                templateType: params.templateType,
                template: params.template,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== VACATIONS ====================

interface DbVacation {
    vacation_id: string;
    restaurant_id: string;
    from: string;
    to: string;
    description?: string;
}

const transformDbVacation = (db: DbVacation): Vacation => ({
    vacation_id: db.vacation_id,
    restaurant_id: db.restaurant_id || "",
    from: db.from || "",
    to: db.to || "",
    description: db.description,
});

export async function fetchVacations(_token: string): Promise<Vacation[]> {
    const { data, error } = await supabase
        .from("planned_vacations")
        .select("*");
    
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(transformDbVacation);
}

export interface PlanVacationParams {
    from: string;
    to: string;
    description?: string;
}

export async function planVacation(params: PlanVacationParams, ctx: ApiContext) {
    const vacationId = v4();
    const response = await apiRequest(
        `${commandEndpoints.planVacation}/${vacationId}`,
        ctx,
        {
            method: "POST",
            body: {
                vacation_id: vacationId,
                from: params.from,
                to: params.to,
                description: params.description,
            },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function cancelVacation(vacationId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.cancelVacation}/${vacationId}`,
        ctx,
        {
            method: "POST",
            body: { vacation_id: vacationId },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== RESERVATION CANCELLATION ====================

export interface ActiveReservation {
    reservation_id: string;
    date: string;
    start: string;
    duration: number;
    persons: number;
    restaurant_id: string;
}

export interface ReservationDetails {
    reservation_id: string;
    name: string;
    email: string;
    phone: string;
    restaurant_id: string;
}

export async function fetchActiveReservationsForCancellation(restaurantId: string): Promise<ActiveReservation[]> {
    const { data, error } = await supabase
        .from("active_reservations_for_cancellation")
        .select("*")
        .eq("restaurant_id", restaurantId);

    if (error) {
        throw new Error(error.message);
    }
    return data || [];
}

export async function fetchActiveReservationById(reservationId: string): Promise<ActiveReservation | null> {
    const { data, error } = await supabase
        .from("active_reservations_for_cancellation")
        .select("*")
        .eq("reservation_id", reservationId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export interface ReservationDetailsLookup {
    reservation_id: string;
    name: string;
    email: string;
    phone: string;
    description:string;
    restaurant_id: string;
    confirmed: boolean;
    start_date: string;
    end_date: string;
    showup_registered: boolean;
}

export async function fetchUpcomingReservations(restaurantId: string): Promise<ReservationDetailsLookup[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from("reservation_details_lookup")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gt("end_date", now)
        .order("start_date", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }
    return data || [];
}

export async function fetchReservationDetails(restaurantId, reservationId: string): Promise<ReservationDetails | null> {
    const { data, error } = await supabase
        .from("reservation_details_lookup")
        .select("*")
        .eq("reservation_id", reservationId)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function cancelReservation(reservationId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.cancelReservation}/${reservationId}`,
        ctx,
        {
            method: "POST",
            body: { reservationId },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

// ==================== ONLINE RESERVATION ====================

export interface OnlineReservationStatus {
    restaurant_id: string;
    active: boolean;
}

export async function fetchOnlineReservationStatus(_token: string): Promise<OnlineReservationStatus | null> {
    const { data, error } = await supabase
        .from("online_reservation_status")
        .select("*")
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function activateOnlineReservation(restaurantId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.activateOnlineReservation}/${restaurantId}`,
        ctx,
        {
            method: "POST",
            body: { restaurantId },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function deactivateOnlineReservation(restaurantId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.deactivateOnlineReservation}/${restaurantId}`,
        ctx,
        {
            method: "POST",
            body: { restaurantId },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function registerNoShow(reservationId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.registerNoShow}/${reservationId}`,
        ctx,
        {
            method: "POST",
            body: { reservationId },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function registerShowUp(reservationId: string, ctx: ApiContext) {
    const response = await apiRequest(
        `${commandEndpoints.registerShowUp}/${reservationId}`,
        ctx,
        {
            method: "POST",
            body: { reservationId },
        }
    );
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}
