"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  IconDots,
  IconPlus,
  IconTrash,
  IconChevronRight,
  IconFile,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"

import { buildDocumentTree, createDocument, deleteDocument } from "@/lib/document-storage"
import type { DocumentTreeNode } from "@/types"

function DocumentTreeItem({ node, depth = 0 }: { node: DocumentTreeNode; depth?: number }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = node.children.length > 0

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    const child = createDocument({ title: "Untitled", parent_id: node.id })
    if (child) {
      setIsOpen(true)
      router.push(`/documents/${child.id}`)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Delete this document and all sub-pages?")) {
      deleteDocument(node.id)
    }
  }

  if (depth > 0) {
    return (
      <>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild>
            <Link href={`/documents/${node.id}`}>
              <span>{node.icon}</span>
              <span className="truncate">{node.title}</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        {hasChildren && isOpen && (
          <SidebarMenuSub>
            {node.children.map((child) => (
              <DocumentTreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </SidebarMenuSub>
        )}
      </>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href={`/documents/${node.id}`}>
            {hasChildren ? (
              <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                <span className="cursor-pointer">
                  <IconChevronRight
                    className="transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    size={16}
                  />
                </span>
              </CollapsibleTrigger>
            ) : (
              <span>{node.icon}</span>
            )}
            <span className="truncate">{hasChildren ? `${node.icon} ${node.title}` : node.title}</span>
          </Link>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              showOnHover
              className="data-[state=open]:bg-accent rounded-sm"
            >
              <IconDots />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-40 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            <DropdownMenuItem onClick={handleCreate}>
              <IconPlus />
              <span>Add sub-page</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} variant="destructive">
              <IconTrash />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {node.children.map((child) => (
                <DocumentTreeItem key={child.id} node={child} depth={1} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavDocuments() {
  const [tree, setTree] = useState<DocumentTreeNode[]>([])
  const router = useRouter()

  const loadTree = useCallback(() => {
    setTree(buildDocumentTree())
  }, [])

  useEffect(() => {
    loadTree()
    const handleChange = () => loadTree()
    window.addEventListener("documents-changed", handleChange)
    return () => window.removeEventListener("documents-changed", handleChange)
  }, [loadTree])

  const handleCreate = () => {
    const doc = createDocument({ title: "Untitled", parent_id: null })
    if (doc) router.push(`/documents/${doc.id}`)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarGroupAction title="New document" onClick={handleCreate}>
        <IconPlus />
        <span className="sr-only">New Document</span>
      </SidebarGroupAction>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/documents">
              <IconFile size={16} />
              <span>All Documents</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {tree.map((node) => (
          <DocumentTreeItem key={node.id} node={node} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
