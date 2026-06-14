import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">UI Test</h1>
      <div className="flex gap-2">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-2">
        <Badge>Badge</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <Card className="w-64">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Isi card di sini</CardContent>
      </Card>
    </div>
  )
}