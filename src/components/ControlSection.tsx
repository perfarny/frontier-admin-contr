import { ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ControlSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  isOpen: boolean
  onToggle: () => void
}

export function ControlSection({ 
  title, 
  children, 
  isOpen, 
  onToggle 
}: ControlSectionProps) {
  return (
    <Card className="bg-card border-border">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <CaretDown 
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border">
          <div className="p-4 space-y-4">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}