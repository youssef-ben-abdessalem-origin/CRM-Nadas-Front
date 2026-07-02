import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CalendarPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.activities.getAll().catch(() => []),
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api.activities.getTypes().catch(() => []),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll().catch(() => []),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => api.activities.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(t("calendar.statusUpdates.activityCompleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getActivitiesForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return activities.filter((a: any) => {
      if (!a.dueDate) return false;
      const dueDate = new Date(a.dueDate);
      return (
        dueDate.getDate() === day &&
        dueDate.getMonth() === month &&
        dueDate.getFullYear() === year
      );
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedDateActivities = selectedDate
    ? activities.filter((a: any) => {
        if (!a.dueDate) return false;
        const dueDate = new Date(a.dueDate);
        return (
          dueDate.getDate() === selectedDate.getDate() &&
          dueDate.getMonth() === selectedDate.getMonth() &&
          dueDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  return (
    <CRMLayout title={t("calendar.pageTitle")}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="bg-muted p-2 text-center text-sm font-medium"
                  >
                    {day}
                  </div>
                ))}
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`bg-background p-2 min-h-[100px] cursor-pointer hover:bg-muted/50 transition-colors ${
                      day === null ? "bg-muted/30" : ""
                    } ${
                      selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === currentDate.getMonth()
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => {
                      if (day !== null) {
                        setSelectedDate(
                          new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            day
                          )
                        );
                      }
                    }}
                  >
                    {day !== null && (
                      <>
                        <div className="text-sm font-medium mb-1">{day}</div>
                        <div className="space-y-1">
                          {getActivitiesForDay(day)
                            .slice(0, 3)
                            .map((activity: any) => (
                              <div
                                key={activity.id}
                                className={`text-xs p-1 rounded truncate ${
                                  activity.completed
                                    ? "bg-green-500/20 text-green-600"
                                    : "bg-blue-500/20 text-blue-600"
                                }`}
                              >
                                {activity.subject || "Activity"}
                              </div>
                            ))}
                          {getActivitiesForDay(day).length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{getActivitiesForDay(day).length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate ? formatDate(selectedDate) : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateActivities.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateActivities.map((activity: any) => {
                      const type = activityTypes.find((t: any) => t.id === activity.typeId);
                      return (
                        <div
                          key={activity.id}
                          className={`p-3 rounded-lg border ${
                            activity.completed
                              ? "bg-green-500/10 border-green-500/20"
                              : "bg-muted/50 border-border"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() =>
                                !activity.completed &&
                                completeMutation.mutate(activity.id)
                              }
                              className="mt-0.5"
                            >
                              {activity.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium text-sm ${
                                  activity.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {activity.subject || "Activity"}
                              </p>
                              {type && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {type.name}
                                </Badge>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                {activity.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(activity.dueDate).toLocaleTimeString(
                                      "en-US",
                                      { hour: "2-digit", minute: "2-digit" }
                                    )}
                                  </div>
                                )}
                                {activity.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {activity.assignedTo.name || "Assigned"}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activities scheduled
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click on a date to see activities
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activities
                  .filter((a: any) => !a.completed && a.dueDate)
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                  )
                  .slice(0, 5)
                  .map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-2 text-sm bg-muted/50 rounded"
                    >
                      <span className="truncate">{activity.subject || "Activity"}</span>
                      <span className="text-muted-foreground text-xs">
                        {activity.dueDate
                          ? new Date(activity.dueDate).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  ))}
                {activities.filter((a: any) => !a.completed && a.dueDate).length ===
                  0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No upcoming activities
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
};

export default CalendarPage;
