import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group'
import { Label } from './components/ui/label'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { X } from '@phosphor-icons/react'

interface FrontierSettings {
  webApps: 'no-access' | 'all-users' | 'specific-groups'
  webGroups: string[]
  officeWin32: 'no-access' | 'all-users' | 'specific-groups'
  officeGroups: string[]
}

const defaultSettings: FrontierSettings = {
  webApps: 'no-access',
  webGroups: [],
  officeWin32: 'all-users',
  officeGroups: []
}

function App() {
  const [settings, setSettings] = useKV<FrontierSettings>('frontier-settings', defaultSettings)
  const [newWebGroup, setNewWebGroup] = useState('')
  const [newOfficeGroup, setNewOfficeGroup] = useState('')

  const currentSettings = settings || defaultSettings

  const addWebGroup = () => {
    if (newWebGroup.trim()) {
      setSettings(current => ({
        ...defaultSettings,
        ...current,
        webGroups: [...(current?.webGroups || []), newWebGroup.trim()]
      }))
      setNewWebGroup('')
    }
  }

  const removeWebGroup = (index: number) => {
    setSettings(current => ({
      ...defaultSettings,
      ...current,
      webGroups: current?.webGroups?.filter((_, i) => i !== index) || []
    }))
  }

  const addOfficeGroup = () => {
    if (newOfficeGroup.trim()) {
      setSettings(current => ({
        ...defaultSettings,
        ...current,
        officeGroups: [...(current?.officeGroups || []), newOfficeGroup.trim()]
      }))
      setNewOfficeGroup('')
    }
  }

  const removeOfficeGroup = (index: number) => {
    setSettings(current => ({
      ...defaultSettings,
      ...current,
      officeGroups: current?.officeGroups?.filter((_, i) => i !== index) || []
    }))
  }

  const handleWebAccessChange = (value: string) => {
    setSettings(current => ({
      ...defaultSettings,
      ...current,
      webApps: value as FrontierSettings['webApps']
    }))
  }

  const handleOfficeAccessChange = (value: string) => {
    setSettings(current => ({
      ...defaultSettings,
      ...current,
      officeWin32: value as FrontierSettings['officeWin32']
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      callback()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              The Frontier program gives your organization early, hands-on access to experimental 
              and preview features from Microsoft. All Frontier features and agents are previews and 
              might not be released to general availability. Configure access settings below for where 
              users can experience Frontier.
            </p>
            <p>To get the most out of the Frontier program, we recommend turning on preview features in web apps, desktop apps, and agents.</p>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="web-apps" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="web-apps">Web apps</TabsTrigger>
              <TabsTrigger value="office-win32">Office Desktop Apps</TabsTrigger>
            </TabsList>

            <TabsContent value="web-apps" className="space-y-4 mt-6 min-h-[320px]">
              <div>
                <h3 className="font-medium mb-2">Enable Frontier features in web apps</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select which groups of users get access to the Frontier program for the Microsoft 365 
                  Copilot app and web apps for Word, PowerPoint, Excel.
                </p>
              </div>

              <RadioGroup 
                value={currentSettings.webApps} 
                onValueChange={handleWebAccessChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-access" id="web-no-access" className="border-black" />
                  <Label htmlFor="web-no-access" className="font-normal">
                    No access
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-3">
                  Users will not have access to Frontier features in web apps.
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all-users" id="web-all-users" className="border-black" />
                  <Label htmlFor="web-all-users" className="font-normal">
                    All users
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-3">
                  All users in your organization will automatically receive Frontier features in web apps.
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific-groups" id="web-specific-groups" className="border-black" />
                  <Label htmlFor="web-specific-groups" className="font-normal">
                    Specific user groups
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-3">
                  Only specified user groups will automatically receive Frontier features in web apps.
                </div>

                {currentSettings.webApps === 'specific-groups' && (
                  <div className="ml-6 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter group name"
                        value={newWebGroup}
                        onChange={(e) => setNewWebGroup(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, addWebGroup)}
                        className="flex-1 border-black"
                      />
                      <Button 
                        onClick={addWebGroup}
                        variant="outline"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {currentSettings.webGroups && currentSettings.webGroups.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentSettings.webGroups.map((group, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            {group}
                            <button
                              onClick={() => removeWebGroup(index)}
                              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </RadioGroup>
            </TabsContent>

            <TabsContent value="office-win32" className="space-y-4 mt-6 min-h-[320px]">
              <div>
                <h3 className="font-medium mb-2">Allow users to access Frontier features in Office win32</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select which groups of users get access to toggle Frontier features in their Office win32 
                  desktop applications.
                </p>
              </div>

              <RadioGroup 
                value={currentSettings.officeWin32} 
                onValueChange={handleOfficeAccessChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-access" id="office-no-access" className="border-black" />
                  <Label htmlFor="office-no-access" className="font-normal">
                    No access
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-3">
                  Users will not see Frontier toggle options in their Office win32 applications.
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all-users" id="office-all-users" className="border-black" />
                  <Label htmlFor="office-all-users" className="font-normal">
                    All users
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-3">
                  All users will see a Frontier toggle in their Office win32 apps (off by default). 
                  Users can choose to turn it on to receive Frontier features.
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific-groups" id="office-specific-groups" className="border-black" />
                  <Label htmlFor="office-specific-groups" className="font-normal">
                    Specific user groups
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-3">
                  Only specified user groups will see a Frontier toggle in their Office win32 apps (off by default). 
                  These users can choose to turn it on to receive Frontier features.
                </div>

                {currentSettings.officeWin32 === 'specific-groups' && (
                  <div className="ml-6 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter group name"
                        value={newOfficeGroup}
                        onChange={(e) => setNewOfficeGroup(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, addOfficeGroup)}
                        className="flex-1 border-black"
                      />
                      <Button 
                        onClick={addOfficeGroup}
                        variant="outline"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {currentSettings.officeGroups && currentSettings.officeGroups.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentSettings.officeGroups.map((group, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            {group}
                            <button
                              onClick={() => removeOfficeGroup(index)}
                              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </RadioGroup>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
            <Button variant="outline">
              Cancel
            </Button>
            <Button>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App