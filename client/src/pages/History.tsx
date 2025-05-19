import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WebsiteData } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function History() {
  const { data: websites, isLoading } = useQuery<WebsiteData[]>({
    queryKey: ['/api/websites'],
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Website History</h1>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : websites && websites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <Card key={website.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{website.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {website.createdAt 
                    ? formatDistanceToNow(new Date(website.createdAt), { addSuffix: true }) 
                    : "Recently"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full bg-gray-100 rounded-md overflow-hidden">
                  {/* Website preview thumbnail would go here */}
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    Website Preview
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {website.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View & Edit</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No websites yet</h2>
          <p className="text-gray-500 mb-6">
            You haven't created any websites yet. Start generating your first website now!
          </p>
          <Link href="/">
            <Button className="bg-blue-500 hover:bg-blue-600">Create Your First Website</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
