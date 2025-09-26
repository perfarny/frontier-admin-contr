import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group'
import { Label } from './components/ui/label'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { Switch } from './components/ui/switch'
import { X } from '@phosphor-icons/react'

interface FrontierSettings {
  webApps: 'no-access' | 'all-users' | 'specific-groups'
  webGroups: string[]
  officeWin32: 'no-access' | 'all-users' | 'specific-groups'
  officeGroups: string[]
  allApps: 'no-access' | 'all-users' | 'specific-groups'
  allAppsGroups: string[]
}

const defaultSettings: FrontierSettings = {
  webApps: 'no-access',
  webGroups: [],
  officeWin32: 'all-users',
  officeGroups: [],
  allApps: 'no-access',
  allAppsGroups: []
}

function App() {
  const [settings, setSettings] = useKV<FrontierSettings>('frontier-settings', defaultSettings)
  const [newWebGroup, setNewWebGroup] = useState('')
  const [newOfficeGroup, setNewOfficeGroup] = useState('')
  const [newAllAppsGroup, setNewAllAppsGroup] = useState('')
  const [isAlternateVersion, setIsAlternateVersion] = useState(false)

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

  const addAllAppsGroup = () => {
    if (newAllAppsGroup.trim()) {
      setSettings(current => ({
        ...defaultSettings,
        ...current,
        allAppsGroups: [...(current?.allAppsGroups || []), newAllAppsGroup.trim()]
      }))
      setNewAllAppsGroup('')
    }
  }

  const removeAllAppsGroup = (index: number) => {
    setSettings(current => ({
      ...defaultSettings,
      ...current,
      allAppsGroups: current?.allAppsGroups?.filter((_, i) => i !== index) || []
    }))
  }

  const handleAllAppsAccessChange = (value: string) => {
    setSettings(current => ({
      ...defaultSettings,
      ...current,
      allApps: value as FrontierSettings['allApps']
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      callback()
    }
  }

  const OriginalVersion = () => (
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="web-apps" className="cursor-pointer">Web apps</TabsTrigger>
            <TabsTrigger value="office-win32" className="cursor-pointer">Office Desktop Apps</TabsTrigger>
            <TabsTrigger value="agents" className="cursor-pointer">Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="web-apps" className="space-y-4 mt-6 min-h-[320px]">
            <div>
              <h3 className="font-medium mb-2">Enable Frontier features in web apps</h3>
              <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in web apps.</p>
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
              <div className="text-xs text-muted-foreground ml-6 -mt-2">
                Users will not have access to Frontier features in web apps.
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-users" id="web-all-users" className="border-black" />
                <Label htmlFor="web-all-users" className="font-normal">
                  All users
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6 -mt-2">
                All users in your organization will automatically receive Frontier features in web apps.
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific-groups" id="web-specific-groups" className="border-black" />
                <Label htmlFor="web-specific-groups" className="font-normal">
                  Specific user groups
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6 -mt-2">
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
              <h3 className="font-medium mb-2">Allow users to enable Frontier features in Office Desktop applications</h3>
              <p className="text-sm text-muted-foreground mb-4">Select which users can enable Frontier features in their Office desktop applications. Users can make different choices across devices. </p>
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
              <div className="text-xs text-muted-foreground ml-6 -mt-2">Users cannot choose to enable Frontier features.</div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-users" id="office-all-users" className="border-black" />
                <Label htmlFor="office-all-users" className="font-normal">
                  All users
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6 -mt-2">All users can choose to enable Frontier features.</div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific-groups" id="office-specific-groups" className="border-black" />
                <Label htmlFor="office-specific-groups" className="font-normal">
                  Specific user groups
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6 -mt-2">Only specified user can choose to enable Frontier features.</div>

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

          <TabsContent value="agents" className="space-y-4 mt-6 min-h-[320px]">
            <div>
              <h3 className="font-bold mb-2">Get early access to AI agents built by Microsoft</h3>
              <p className="text-sm text-muted-foreground">
                The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.
              </p>
            </div>
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
  )

  const AlternateVersion = () => (
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
        <Tabs defaultValue="all-apps" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-apps" className="cursor-pointer">All Apps</TabsTrigger>
            <TabsTrigger value="agents" className="cursor-pointer">Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="all-apps" className="space-y-4 mt-6 min-h-[320px]">
            <div>
              <h3 className="font-medium mb-2">All Apps</h3>
              <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in all applications.</p>
            </div>

            <RadioGroup 
              value={currentSettings.allApps} 
              onValueChange={handleAllAppsAccessChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no-access" id="alt-no-access" className="border-black" />
                <Label htmlFor="alt-no-access" className="font-normal">
                  No access
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6 -mt-2">
                Users will not have access to Frontier features in web apps.
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-users" id="alt-all-users" className="border-black" />
                <Label htmlFor="alt-all-users" className="font-normal">
                  All users
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6 -mt-2">
                All users in your organization will automatically receive Frontier features in web apps.
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific-groups" id="alt-specific-groups" className="border-black" />
                <Label htmlFor="alt-specific-groups" className="font-normal">
                  Specific user groups
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6 -mt-2">
                Only specified user groups will automatically receive Frontier features in web apps.
              </div>

              {currentSettings.allApps === 'specific-groups' && (
                <div className="ml-6 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter group name"
                      value={newAllAppsGroup}
                      onChange={(e) => setNewAllAppsGroup(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addAllAppsGroup)}
                      className="flex-1 border-black"
                    />
                    <Button 
                      onClick={addAllAppsGroup}
                      variant="outline"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  {currentSettings.allAppsGroups && currentSettings.allAppsGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentSettings.allAppsGroups.map((group, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          {group}
                          <button
                            onClick={() => removeAllAppsGroup(index)}
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

          <TabsContent value="agents" className="space-y-4 mt-6 min-h-[320px]">
            <div>
              <h3 className="font-bold mb-2">Get early access to AI agents built by Microsoft</h3>
              <p className="text-sm text-muted-foreground">
                The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.
              </p>
            </div>
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
  )

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      {/* Version Selector */}
      <div className="flex items-center gap-4 p-6 bg-card rounded-lg border-2 border-primary/20 shadow-lg">
        <span className="text-lg font-semibold text-foreground">Select Version:</span>
        <div className="flex gap-2">
          <Button
            variant={!isAlternateVersion ? "default" : "outline"}
            onClick={() => setIsAlternateVersion(false)}
            className="border-black cursor-pointer"
          >
            With win32 Toggle
          </Button>
          <Button
            variant={isAlternateVersion ? "default" : "outline"}
            onClick={() => setIsAlternateVersion(true)}
            className="border-black cursor-pointer"
          >
            No win32 Toggle
          </Button>
        </div>
      </div>
      {/* Render the selected version */}
      {isAlternateVersion ? <AlternateVersion /> : <OriginalVersion />}
    </div>
  );
}

export default App