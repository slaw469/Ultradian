"use client";

import { useState } from "react";
import { TodaySessionsFeed } from "@/components/dashboard/TodaySessionsFeed";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Container } from "@/components/ui/container";

export default function TestSessionsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createTestSessions = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/test-sessions', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test sessions');
      }
      
      const result = await response.json();
      toast({
        title: "Success!",
        description: `Created ${result.sessions?.length || 0} test sessions`,
      });
      
      // Refresh the page to show new sessions
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test sessions",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Test Sessions Feed</h1>
          <p className="text-muted-foreground">
            Testing the new session feed functionality
          </p>
          <div className="mt-4">
            <Button 
              onClick={createTestSessions} 
              disabled={isCreating}
              className="mr-4"
            >
              {isCreating ? "Creating..." : "Create Test Sessions"}
            </Button>
          </div>
        </div>
        
        <TodaySessionsFeed />
      </div>
    </Container>
  );
} 