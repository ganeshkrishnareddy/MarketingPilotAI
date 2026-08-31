"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Palette, Users, Box, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Brand Kit", icon: Palette },
  { id: 3, title: "Competitors", icon: Users },
  { id: 4, title: "Products", icon: Box },
  { id: 5, title: "Complete", icon: CheckCircle2 },
];

export default function WorkspaceSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" placeholder="Acme Corp" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="Technology" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea id="description" placeholder="What does your business do?" className="bg-background/50 min-h-[100px]" />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input type="color" id="primaryColor" defaultValue="#3b82f6" className="w-12 h-10 p-1 bg-background/50" />
                <Input placeholder="#3b82f6" className="bg-background/50 flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Brand Font</Label>
              <Input id="fontFamily" placeholder="Inter, Roboto..." className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone of Voice</Label>
              <Input id="tone" placeholder="Professional, friendly, bold..." className="bg-background/50" />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competitor1">Competitor 1</Label>
              <Input id="competitor1" placeholder="Competitor URL or Name" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor2">Competitor 2</Label>
              <Input id="competitor2" placeholder="Competitor URL or Name" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor3">Competitor 3</Label>
              <Input id="competitor3" placeholder="Competitor URL or Name" className="bg-background/50" />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Main Product/Service Name</Label>
              <Input id="productName" placeholder="e.g. Pro Plan" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDesc">Product Description</Label>
              <Textarea id="productDesc" placeholder="Describe the key features and benefits..." className="bg-background/50 min-h-[100px]" />
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Workspace Ready!</h3>
            <p className="text-muted-foreground">Your AI is fully customized and ready to generate personalized content for your brand.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-3xl space-y-8">
        {/* Progress Bar & Steps Header */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 z-10 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden mx-6">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with the basics of your business."}
              {currentStep === 2 && "Define how your brand looks and sounds."}
              {currentStep === 3 && "Tell us who you're up against."}
              {currentStep === 4 && "What are you selling?"}
              {currentStep === 5 && "You're all set up!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className="bg-background/50 hover:bg-background"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Go to Dashboard
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
