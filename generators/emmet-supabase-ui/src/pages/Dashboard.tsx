import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {StatCard} from "@/components/ui/stat-card";
import {Users, Calendar, ClipboardList} from "lucide-react";
import {mockClerks} from "@/data/mock-data";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {useActiveShiftsForDashboard} from "@/hooks/api/useShifts";
import {useActiveTasksForDashboard} from "@/hooks/api/useTasks";
import {useClerks} from "@/hooks/api/useClerks";
import {useUpcomingReservations} from "@/hooks/api/useReservations";
import {format} from "date-fns";
import {DashboardCalendar, CalendarEntry} from "@/components/calendar/Calendar";
import {useMemo, useCallback} from "react";
import {useApiContext} from "@/hooks/useApiContext";
import {registerNoShow, registerShowUp} from "@/lib/api";

export default function Dashboard() {
    const ctx = useApiContext();
    const {data: activeShifts = [], isLoading: shiftsLoading} = useActiveShiftsForDashboard();
    const {data: activeTasks = [], isLoading: tasksLoading} = useActiveTasksForDashboard();
    const {data: clerks = []} = useClerks();
    const {data: upcomingReservations = []} = useUpcomingReservations();
    const activeStaff = mockClerks.filter((c) => c.active).length;

    const getClerkName = (clerkId: string) => {
        const clerk = clerks.find((c) => c.clerkId === clerkId);
        return clerk ? `${clerk.name} ${clerk.surname}` : clerkId;
    };

    const calendarEntries = useMemo<CalendarEntry[]>(() => {
        return upcomingReservations.map((r) => ({
            type: "reservation",
            id: r.reservation_id,
            title: r.name || r.reservation_id,
            description: r.description,
            start: r.start_date,
            email: r.email,
            phone: r.phone,
            end: r.end_date,
            showupRegistered: r.showup_registered,
        }));
    }, [upcomingReservations]);

    const handleNoShow = useCallback((reservationId: string) => {
        registerNoShow(reservationId, ctx).catch(console.error);
    }, [ctx]);

    const handleShowUp = useCallback((reservationId: string) => {
        registerShowUp(reservationId, ctx).catch(console.error);
    }, [ctx]);

    return (
        <DashboardLayout title="Overview" subtitle="Welcome back! Here is your summary.">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Staff"
                    value={activeStaff}
                    icon={Users}
                    change={`${mockClerks.length - activeStaff} inactive`}
                    changeType="neutral"
                />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* Active Shifts */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="h-5 w-5 text-primary"/>
                            Active Shifts Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {shiftsLoading ? (
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            ) : activeShifts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No active shifts</p>
                            ) : (
                                activeShifts.map((shift) => (
                                    <div
                                        key={shift.shiftId}
                                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">{shift.name}</p>
                                            <p className="text-sm text-muted-foreground">{shift.fromTo}</p>
                                            {shift.assignees.length > 0 && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {shift.assignees.map(getClerkName).join(", ")}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="bg-success/10 text-success">
                                            Active
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Tasks */}
            <Card className="mt-6 animate-fade-in">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ClipboardList className="h-5 w-5 text-primary"/>
                        Pending Tasks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {tasksLoading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : activeTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No active tasks</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Assigned to</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Due date</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Recurrence</th>
                                </tr>
                                </thead>
                                <tbody>
                                {activeTasks.map((task) => (
                                    <tr key={task.taskId} className="border-b border-border/50 last:border-0">
                                        <td className="py-4">
                                            <p className="font-medium text-foreground">{task.title}</p>
                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                        </td>
                                        <td className="py-4 text-foreground">
                                            {task.assignedClerk ? getClerkName(task.assignedClerk) : "Unassigned"}
                                        </td>
                                        <td className="py-4 text-foreground">
                                            {task.date ? format(new Date(task.date), "MM/dd/yyyy") : "–"}
                                        </td>
                                        <td className="py-4">
                                            {task.repeats ? (
                                                <Badge variant="outline">{task.repeats}</Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Once</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DashboardCalendar
                entries={calendarEntries}
                onAppointmentClick={() => {}}
                onNoShow={handleNoShow}
                onShowUp={handleShowUp}
            />
        </DashboardLayout>
    );
}
