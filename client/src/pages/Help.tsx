import { Link } from "wouter";
import { ArrowLeft, HelpCircle, MessageSquare, Search, PenSquare, Image, MonitorSmartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>How to Use Instant Website</CardTitle>
              <CardDescription>
                Learn how to create beautiful websites in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">1. Describe Your Website</h3>
                    <p className="text-gray-600">
                      Start by telling our AI assistant what type of website you need. Include details such as:
                    </p>
                    <ul className="list-disc ml-6 mt-2 text-gray-600 space-y-1">
                      <li>Your business or organization type (bakery, law firm, portfolio, etc.)</li>
                      <li>Color preferences or brand colors</li>
                      <li>Layout preferences (modern, minimal, bold, etc.)</li>
                      <li>Key sections you want to include (about, services, contact, etc.)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Image className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">2. Upload Images (Optional)</h3>
                    <p className="text-gray-600">
                      Upload your business logo, product photos, or other relevant images to
                      personalize your website. Click the image icon in the chat input to open
                      the upload area.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Search className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">3. Preview Your Website</h3>
                    <p className="text-gray-600">
                      Once generated, your website will appear in the preview panel. You can toggle
                      between desktop and mobile views to see how it looks on different devices.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <PenSquare className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">4. Edit and Refine</h3>
                    <p className="text-gray-600">
                      Click on any element in the preview to edit its content. You can also ask
                      the AI to make specific changes by describing what you want modified in
                      the chat.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Download className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">5. Export Your Website</h3>
                    <p className="text-gray-600">
                      When you're satisfied with your website, click the "Export" button to download
                      the HTML file. You can then host this file on any web hosting service.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How much does it cost?</AccordionTrigger>
                  <AccordionContent>
                    The basic version is free to use with limited exports. Premium plans with
                    additional features and unlimited exports are coming soon.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I host the website myself?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can download your website as an HTML file and host it on any web
                    hosting service of your choice.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>What types of websites can I create?</AccordionTrigger>
                  <AccordionContent>
                    You can create various business websites including landing pages, portfolios,
                    small business sites, restaurants, professional services, and more.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I add my own domain?</AccordionTrigger>
                  <AccordionContent>
                    After exporting your website, you can upload it to any hosting service and
                    connect your domain there. We don't directly provide domain registration or
                    hosting services at this time.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Are the websites mobile-friendly?</AccordionTrigger>
                  <AccordionContent>
                    Yes! All generated websites are fully responsive and work well on desktop,
                    tablet, and mobile devices. You can preview the mobile view before exporting.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any other questions or need further assistance, feel free to contact our support team.
              </p>
              <Button className="w-full flex items-center justify-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
