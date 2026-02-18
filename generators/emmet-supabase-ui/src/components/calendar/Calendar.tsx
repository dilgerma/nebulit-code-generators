import {useMemo, useRef, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Calendar as CalendarIcon, ChevronLeft, ChevronRight, Phone, Mail, Clock, AlignLeft} from "lucide-react";
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {format} from "date-fns";
import {de} from "date-fns/locale";


export type CalendarEntry = {
    type: string,
    id: string,
    title: string,
    description: string,
    phone: string,
    email: string,
    start: string,
    end: string,
    showupRegistered?: boolean,
}

interface DashboardCalendarProps {
    entries: CalendarEntry[];
    onAppointmentClick: (appointment: CalendarEntry) => void;
    onNoShow?: (reservationId: string) => void;
    onShowUp?: (reservationId: string) => void;
}

export function DashboardCalendar({
                                      entries,
                                      onAppointmentClick,
                                      onNoShow,
                                      onShowUp,
                                  }: DashboardCalendarProps) {
    const calendarRef = useRef<typeof Calendar>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

    // Convert appointments to Toast UI Calendar events
    const events = useMemo(() => {
        return entries.map(entry => {
            const showup = entry.showupRegistered === true;
            return {
                id: entry.id,
                calendarId: 'reservations',
                title: entry.title,
                body: entry.description || '',
                email: entry.email,
                phone: entry.phone,
                start: new Date(entry.start),
                end: new Date(entry.end),
                category: 'time' as const,
                backgroundColor: showup ? '#16a34a' : 'hsl(var(--primary))',
                color: '#ffffff',
                borderColor: showup ? '#15803d' : 'hsl(var(--primary))',
                raw: entry,
            };
        });
    }, [entries]);

    const calendars = useMemo(() => [
        {
            id: 'reservations',
            name: 'Appointments',
            backgroundColor: 'hsl(var(--primary))',
            borderColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
        },
    ], []);

    const handleClickEvent = useCallback((eventInfo: { event: { raw: CalendarEntry } }) => {
        if (eventInfo.event.raw) {
            setSelectedEntry(eventInfo.event.raw);
            onAppointmentClick(eventInfo.event.raw);
        }
    }, [onAppointmentClick]);

    const handlePrev = () => {
        const calendarInstance = (calendarRef.current as any)?.getInstance?.();
        if (calendarInstance) {
            calendarInstance.prev();
            setCurrentDate(calendarInstance.getDate().toDate());
        }
    };

    const handleNext = () => {
        const calendarInstance = (calendarRef.current as any)?.getInstance?.();
        if (calendarInstance) {
            calendarInstance.next();
            setCurrentDate(calendarInstance.getDate().toDate());
        }
    };

    const handleToday = () => {
        const calendarInstance = (calendarRef.current as any)?.getInstance?.();
        if (calendarInstance) {
            calendarInstance.today();
            setCurrentDate(calendarInstance.getDate().toDate());
        }
    };

    const handleViewChange = (newView: 'month' | 'week' | 'day') => {
        setView(newView);
        const calendarInstance = (calendarRef.current as any)?.getInstance?.();
        if (calendarInstance) {
            calendarInstance.changeView(newView);
        }
    };

    const formatCurrentDate = () => {
        return currentDate.toLocaleDateString('de-DE', {
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd. MMMM yyyy, HH:mm 'Uhr'", {locale: de});
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5"/>
                            Kalender
                        </CardTitle>

                        <div className="flex items-center gap-2">
                            {/* View Toggle */}
                            <div className="flex rounded-md border overflow-hidden">
                                <Button
                                    variant={view === 'month' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewChange('month')}
                                    className="rounded-none"
                                >
                                    Monat
                                </Button>
                                <Button
                                    variant={view === 'week' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewChange('week')}
                                    className="rounded-none border-x"
                                >
                                    Woche
                                </Button>
                                <Button
                                    variant={view === 'day' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleViewChange('day')}
                                    className="rounded-none"
                                >
                                    Tag
                                </Button>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={handlePrev}>
                                    <ChevronLeft className="h-4 w-4"/>
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleToday}>
                                    Heute
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleNext}>
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <p className="text-lg font-semibold mt-2">{formatCurrentDate()}</p>
                </CardHeader>
                <CardContent>
                    <div className="calendar-wrapper" style={{height: '600px'}}>
                        <Calendar
                            ref={calendarRef}
                            height="100%"
                            view={view}
                            calendars={calendars}
                            events={events}
                            month={{
                                dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                                startDayOfWeek: 1,
                            }}
                            week={{
                                dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                                startDayOfWeek: 1,
                                hourStart: 6,
                                hourEnd: 22,
                                taskView: false,
                                eventView: ['time'],
                            }}
                            usageStatistics={false}
                            isReadOnly={true}
                            onClickEvent={handleClickEvent}
                            template={{
                                time(event: { title: string, body: string, raw: { email: string, phone: string } }) {
                                    const emailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
                                    const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
                                    return `<span style="font-size: 12px;">
                                    <div><b>${event.title}</b></div><br/>
                                    <div>Anlass / Beschreibung: ${event.body}</div>
                                    ${event.raw?.email ? `<div>${emailIcon}${event.raw.email}</div>` : ''}
                                    ${event.raw?.phone ? `<div>${phoneIcon}${event.raw.phone}</div>` : ''}
                                    </span>`;
                                },
                                allday(event: { title: string }) {
                                    return `<span style="font-size: 12px;">${event.title}</span>`;
                                },
                                timegridDisplayPrimaryTime({time}: { time: Date }) {
                                    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
                                },
                                timegridDisplayTime({time}: { time: Date }) {
                                    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
                                },
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedEntry?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedEntry && (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-3">
                                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
                                <div className="text-sm">
                                    <p>{formatDateTime(selectedEntry.start)}</p>
                                    <p className="text-muted-foreground">bis {formatDateTime(selectedEntry.end)}</p>
                                </div>
                            </div>
                            {selectedEntry.description && (
                                <div className="flex items-start gap-3">
                                    <AlignLeft className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
                                    <p className="text-sm">{selectedEntry.description}</p>
                                </div>
                            )}
                            {selectedEntry.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0"/>
                                    <a href={`mailto:${selectedEntry.email}`}
                                       className="text-sm text-primary hover:underline">
                                        {selectedEntry.email}
                                    </a>
                                </div>
                            )}
                            {selectedEntry.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0"/>
                                    <a href={`tel:${selectedEntry.phone}`}
                                       className="text-sm text-primary hover:underline">
                                        {selectedEntry.phone}
                                    </a>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                        onShowUp?.(selectedEntry.id);
                                        setSelectedEntry(null);
                                    }}
                                >
                                    Sind gekommen
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => {
                                        onNoShow?.(selectedEntry.id);
                                        setSelectedEntry(null);
                                    }}
                                >
                                    Sind nicht gekommen
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
