"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Form validation schema
const ticketFormSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
  summary: z.string().min(1, "Summary is required").min(10, "Summary must be at least 10 characters"),
  currentResults: z.string().min(1, "Current results are required").min(10, "Current results must be at least 10 characters"),
  expectedResults: z.string().min(1, "Expected results are required").min(10, "Expected results must be at least 10 characters"),
  priority: z.enum(["Low", "Medium", "High"], {
    required_error: "Priority is required",
  }),
  status: z.enum(["To Do", "In Progress", "Done"]).default("To Do"),
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  tags: z.string().optional(),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

interface QuickCreateTicketModalProps {
  onTicketCreate?: (ticket: TicketFormValues & { id: number; createdDate: Date }) => void
  trigger?: React.ReactNode
}

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low Priority", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "High", label: "High Priority", color: "bg-red-100 text-red-800 border-red-200" },
]

const STATUS_OPTIONS = [
  { value: "To Do", label: "To Do", icon: AlertCircle, color: "text-gray-600" },
  { value: "In Progress", label: "In Progress", icon: Clock, color: "text-blue-600" },
  { value: "Done", label: "Done", icon: CheckCircle, color: "text-green-600" },
]

const TEAM_MEMBERS = [
  "Alice Johnson",
  "Bob Wilson",
  "Charlie Brown",
  "Diana Prince",
  "Eva Martinez",
  "Frank Miller"
]

export function QuickCreateTicketModal({ onTicketCreate, trigger }: QuickCreateTicketModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      priority: undefined,
      status: "To Do",
      assignee: "unassigned",
      dueDate: undefined,
      currentResults: "",
      expectedResults: "",
      tags: "",
    },
  })

  const onSubmit = async (values: TicketFormValues) => {
    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create ticket object with additional fields
      const newTicket = {
        ...values,
        id: Date.now(), // Generate temporary ID
        createdDate: new Date(),
      }

      // Call the parent callback
      onTicketCreate?.(newTicket)

      // Reset form and close modal
      form.reset()
      setOpen(false)

      // Show success message (you could use toast here)
      console.log("Ticket created successfully:", newTicket)

    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchedPriority = form.watch("priority")
  const watchedStatus = form.watch("status")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Quick Create
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>
            Create a new ticket with all the necessary details. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-sm">Required Information</h4>
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a clear, descriptive title for the ticket"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Summary <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed summary of the issue or requirement..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the problem, requirement, or task in detail
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Results */}
              <FormField
                control={form.control}
                name="currentResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Current Results <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what is currently happening or the current state..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What is the current behavior or outcome you're seeing?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expected Results */}
              <FormField
                control={form.control}
                name="expectedResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Expected Results <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what should happen or the desired outcome..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What should be the expected behavior or outcome?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Priority <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-xs", priority.color)}>
                                {priority.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Clock className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium text-sm">Optional Settings</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <status.icon className={cn("h-4 w-4", status.color)} />
                                {status.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Assignee */}
                <FormField
                  control={form.control}
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {TEAM_MEMBERS.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a due date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When should this ticket be completed?
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="bug, enhancement, documentation (comma-separated)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags separated by commas (e.g., bug, urgent, frontend)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Summary */}
            {(watchedPriority || watchedStatus) && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Ticket Preview</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {watchedPriority && (
                    <Badge
                      variant="outline"
                      className={PRIORITY_OPTIONS.find(p => p.value === watchedPriority)?.color}
                    >
                      {watchedPriority} Priority
                    </Badge>
                  )}
                  {watchedStatus && (
                    <Badge variant="outline">
                      {watchedStatus}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}